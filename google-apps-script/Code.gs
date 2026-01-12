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
 * If a 'query' is present, it searches and returns results with Base64 image data.
 * Otherwise, it fetches all certificates with thumbnail URLs for efficiency.
 */
function doGet(e) {
  try {
    const query = e.parameter.query;
    let certificates;

    if (query && query.trim() !== '') {
      // For search, use the robust Base64 method with caching to ensure images display.
      const cache = CacheService.getScriptCache();
      const cacheKey = `search_${query.trim().toLowerCase()}`;
      const cached = cache.get(cacheKey);

      if (cached) {
        // If found in cache, return the cached result immediately.
        return createJsonResponse(JSON.parse(cached));
      } else {
        // If not in cache, perform the search.
        certificates = searchCertificatesByText(query);
        // Store the result in cache for 10 minutes (600 seconds).
        cache.put(cacheKey, JSON.stringify(certificates), 600);
      }
    } else {
      // For browsing all, use efficient thumbnail links.
      certificates = fetchAllCertificates();
    }
    
    return createJsonResponse(certificates);
      
  } catch (error)
 {
    console.error(`Error in doGet: ${error.toString()}\nStack: ${error.stack}`);
    return createJsonResponse({ 
      error: 'An error occurred on the server.', 
      details: error.toString() 
    });
  }
}

/**
 * Creates a JSON response object.
 * @param {object} data - The data to stringify.
 * @returns {ContentService.TextOutput} The JSON response.
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Fetches all certificate files and processes them to use thumbnail URLs for speed.
 * @returns {Array<object>} An array of all certificate objects.
 */
function fetchAllCertificates() {
  const allCertificates = [];
  for (const position in DRIVE_FOLDER_IDS) {
    const folderId = DRIVE_FOLDER_IDS[position];
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFilesByType(MimeType.PNG);
    
    while (files.hasNext()) {
      // `false` indicates to use thumbnail links for efficiency.
      allCertificates.push(processFile(files.next(), position, false));
    }
  }
  return allCertificates;
}

/**
 * Searches for certificates and processes them to use Base64 data URLs.
 * The search now includes both full text (image content) and the file name.
 * @param {string} query - The text to search for.
 * @returns {Array<object>} An array of matching certificate objects.
 */
function searchCertificatesByText(query) {
  const folderIds = Object.values(DRIVE_FOLDER_IDS);
  const positionMap = Object.entries(DRIVE_FOLDER_IDS).reduce((acc, [pos, id]) => {
      acc[id] = pos;
      return acc;
  }, {});

  // Sanitize query to handle single quotes in names (e.g., O'Malley)
  const sanitizedQuery = query.replace(/'/g, "\\'");

  const parentQuery = folderIds.map(id => `'${id}' in parents`).join(' or ');
  // Updated query to search in both file name and full text content
  const searchQuery = `(fullText contains '${sanitizedQuery}' or name contains '${sanitizedQuery}') and (${parentQuery}) and mimeType = 'image/png' and trashed = false`;
  
  const files = DriveApp.searchFiles(searchQuery);
  const certificates = [];
  
  while(files.hasNext()) {
      const file = files.next();
      const parentFolderId = file.getParents().next().getId();
      const position = positionMap[parentFolderId] || 'ไม่ระบุ';
      // `true` indicates to use Base64 encoding for search results for maximum compatibility.
      certificates.push(processFile(file, position, true));
  }
  return certificates;
}


/**
 * Processes a Drive file into a structured certificate object.
 * @param {Drive.File} file - The file object from Drive.
 * @param {string} position - The position associated with the certificate.
 * @param {boolean} useBase64 - If true, returns a Base64 data URL for the thumbnail.
 * @returns {object} A structured certificate object.
 */
function processFile(file, position, useBase64) {
  const fileId = file.getId();
  let thumbnailUrl;

  if (useBase64) {
    try {
      const blob = file.getBlob();
      const bytes = blob.getBytes();
      const base64Data = Utilities.base64Encode(bytes);
      thumbnailUrl = `data:image/png;base64,${base64Data}`;
    } catch (e) {
      console.error(`Base64 encoding failed for file ID: ${fileId}. Error: ${e.toString()}`);
      // Fallback to the thumbnail link if Base64 fails.
      thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w512-h512`;
    }
  } else {
    // For "Browse All", use the standard, more efficient thumbnail link.
    thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w512-h512`;
  }

  return {
    id: fileId,
    name: cleanFileName(file.getName()),
    position: position,
    thumbnailUrl: thumbnailUrl,
    fileUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}

/**
 * Cleans the file name by removing the .png extension.
 * @param {string} fileName - The original file name.
 * @returns {string} The cleaned file name.
 */
function cleanFileName(fileName) {
  return fileName.substring(0, fileName.lastIndexOf('.png')) || fileName;
}