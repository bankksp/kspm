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
    const cacheKey = 'all_certificates_v6'; // Bump version
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
 * Uses 'fullText contains' to search inside file content (OCR).
 */
function searchCertificates(query) {
  const results = [];
  // Escape backslashes and single quotes for the query string.
  const sanitizedQuery = query.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  
  for (const position in DRIVE_FOLDER_IDS) {
    try {
      const folderId = DRIVE_FOLDER_IDS[position];
      // Refined query to include mimeType for better accuracy and performance.
      const searchParams = `'${folderId}' in parents and fullText contains '${sanitizedQuery}' and (mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'application/pdf') and trashed = false`;
      const files = DriveApp.searchFiles(searchParams);
      
      while (files.hasNext()) {
        const file = files.next();
        // The mimeType check is now done in the query, so we can just process the file.
        results.push(processFile(file, position));
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
        
        // Correctly check for images and PDFs
        if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
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