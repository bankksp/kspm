
// Enum-like object for positions
const Position = {
  Teacher: 'ครู',
  ViceDirector: 'รองผู้อำนวยการ',
  Director: 'ผู้อำนวยการ',
};

// Google Drive Folder IDs
const DRIVE_FOLDER_IDS = {
  [Position.Teacher]: '1zjx4bbiJq8BBeH6sCHeeNZ0GRkXqVGXl',
  [Position.Director]: '1FSiiFZoAIHS9zbV7bx9nKFA-FdnrbeAe',
  [Position.ViceDirector]: '1iCrrrwSRkWFasbozky-7_6iw1kkEv7Jd',
};

/**
 * Handles HTTP GET requests.
 */
function doGet(e) {
  try {
    const params = e.parameter;
    const action = params.action;

    // --- NEW: Handle Maintenance Status ---
    
    // 1. Get Maintenance Status
    if (action === 'getMaintenanceStatus') {
      const props = PropertiesService.getScriptProperties();
      // Default to 'false' if not set
      const status = props.getProperty('MAINTENANCE_MODE') === 'true';
      return createJsonResponse({ maintenance: status });
    }

    // 2. Set Maintenance Status
    if (action === 'setMaintenanceStatus') {
      const mode = params.mode; // 'true' or 'false'
      PropertiesService.getScriptProperties().setProperty('MAINTENANCE_MODE', mode);
      return createJsonResponse({ success: true, maintenance: mode === 'true' });
    }

    // --- End Maintenance Logic ---

    const query = params.query;

    // If there is a search query, perform a server-side search (no caching for search results)
    if (query && query.trim() !== '') {
      const searchResults = searchCertificates(query);
      return createJsonResponse(searchResults);
    }

    // If no query (Browse All), use cache
    const cache = CacheService.getScriptCache();
    const cacheKey = 'all_certificates_v5'; // Bump version
    const cached = cache.get(cacheKey);

    if (cached) {
      return createJsonResponse(JSON.parse(cached));
    }

    const certificates = fetchAllCertificates();
    
    try {
      cache.put(cacheKey, JSON.stringify(certificates), 600); // 10 minutes
    } catch(err) {
      console.warn("Cache write failed: " + err);
    }
    
    return createJsonResponse(certificates);
      
  } catch (error) {
    console.error(`Error in doGet: ${error.toString()}`);
    return createJsonResponse({ 
      error: 'Server Error', 
      details: error.toString() 
    });
  }
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Searches for files containing the query text within specific folders.
 * Uses 'fullText' to search content (OCR) and metadata.
 */
function searchCertificates(query) {
  const results = [];
  // Escape single quotes for the query string
  const sanitizedQuery = query.replace(/'/g, "\\'");
  
  // Search logic: Content contains query OR Name contains query
  // Note: 'fullText' includes the file content (indexable text) and title.
  const searchParams = `fullText contains '${sanitizedQuery}' and trashed = false`;

  for (const position in DRIVE_FOLDER_IDS) {
    try {
      const folderId = DRIVE_FOLDER_IDS[position];
      const folder = DriveApp.getFolderById(folderId);
      const files = folder.searchFiles(searchParams);
      
      while (files.hasNext()) {
        const file = files.next();
        const mimeType = file.getMimeType();
         // Filter only images and PDFs
        if (mimeType.indexOf('image/') === 0 || mimeType === MimeType.PDF) {
           results.push(processFile(file, position));
        }
      }
    } catch (e) {
      console.error(`Error searching folder ${position}: ${e}`);
    }
  }
  
  // Sort by name
  results.sort((a, b) => a.name.localeCompare(b.name, 'th'));
  return results;
}

function fetchAllCertificates() {
  const allCertificates = [];
  
  for (const position in DRIVE_FOLDER_IDS) {
    const folderId = DRIVE_FOLDER_IDS[position];
    try {
      const folder = DriveApp.getFolderById(folderId);
      const files = folder.getFiles(); 
      
      while (files.hasNext()) {
        const file = files.next();
        const mimeType = file.getMimeType();
        
        if (mimeType.indexOf('image/') === 0 || mimeType === MimeType.PDF) {
          allCertificates.push(processFile(file, position));
        }
      }
    } catch (e) {
      console.error(`Error processing folder ${position}: ${e}`);
    }
  }
  
  allCertificates.sort((a, b) => a.name.localeCompare(b.name, 'th'));
  
  return allCertificates;
}

function processFile(file, position) {
  const fileId = file.getId();
  const name = cleanFileName(file.getName());

  return {
    id: fileId,
    name: name,
    position: position,
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`, 
    fileUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}

function cleanFileName(fileName) {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    return fileName.substring(0, lastDotIndex);
  }
  return fileName;
}
