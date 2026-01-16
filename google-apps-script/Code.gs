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

    // --- Handle Maintenance Status ---
    if (action === 'getMaintenanceStatus') {
      const props = PropertiesService.getScriptProperties();
      const status = props.getProperty('MAINTENANCE_MODE') === 'true';
      return createJsonResponse({ maintenance: status });
    }

    if (action === 'setMaintenanceStatus') {
      const mode = params.mode; // 'true' or 'false'
      PropertiesService.getScriptProperties().setProperty('MAINTENANCE_MODE', mode);
      return createJsonResponse({ success: true, maintenance: mode === 'true' });
    }
    // --- End Maintenance Logic ---

    const query = params.query;

    if (query && query.trim() !== '') {
      // Search logic is not paginated, returns all results
      const searchResults = searchCertificates(query);
      return createJsonResponse(searchResults);
    }

    // BROWSE logic is paginated for performance
    const limit = parseInt(params.limit, 10) || 30; // Default page size
    const offset = parseInt(params.offset, 10) || 0;
    const position = params.position;

    const paginatedData = fetchCertificatesByPage(limit, offset, position);
    return createJsonResponse(paginatedData);
      
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
 * Searches for files and returns all results. Not paginated.
 * Returns data in the new standard object format.
 */
function searchCertificates(query) {
  const results = [];
  const sanitizedQuery = query.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  
  const folderIdToPosition = Object.entries(DRIVE_FOLDER_IDS).reduce((acc, [pos, id]) => {
    acc[id] = pos; return acc;
  }, {});
  
  const folderClauses = Object.values(DRIVE_FOLDER_IDS).map(id => `'${id}' in parents`);
  const searchParams = `(${folderClauses.join(' or ')}) and (fullText contains '${sanitizedQuery}' or title contains '${sanitizedQuery}') and (mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'application/pdf') and trashed = false`;

  try {
    const files = DriveApp.searchFiles(searchParams);
    while (files.hasNext()) {
      const file = files.next();
      const parents = file.getParents();
      let position = null;
      while (parents.hasNext()) {
        const parent = parents.next();
        const parentId = parent.getId();
        if (folderIdToPosition[parentId]) {
          position = folderIdToPosition[parentId];
          break; 
        }
      }
      if (position) {
        results.push(processFile(file, position));
      }
    }
  } catch (e) {
    console.error(`Error searching with query '${query}': ${e}`);
  }
  
  results.sort((a, b) => a.name.localeCompare(b.name, 'th'));
  return { certificates: results, hasNextPage: false };
}

/**
 * Fetches certificates page by page for the 'Browse All' view.
 */
function fetchCertificatesByPage(limit, offset, positionFilter) {
  const results = [];
  const folderIdToPosition = Object.entries(DRIVE_FOLDER_IDS).reduce((acc, [pos, id]) => {
    acc[id] = pos; return acc;
  }, {});

  let folderClauses;
  if (positionFilter && positionFilter !== 'ทั้งหมด' && DRIVE_FOLDER_IDS[positionFilter]) {
    folderClauses = [`'${DRIVE_FOLDER_IDS[positionFilter]}' in parents`];
  } else {
    folderClauses = Object.values(DRIVE_FOLDER_IDS).map(id => `'${id}' in parents`);
  }

  const searchParams = `(${folderClauses.join(' or ')}) and (mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'application/pdf') and trashed = false`;

  try {
    const files = DriveApp.searchFiles(searchParams);

    // Manual offset skip since the API doesn't support it directly
    for (let i = 0; i < offset && files.hasNext(); i++) {
      files.next();
    }

    // Fetch items for the current page
    for (let i = 0; i < limit && files.hasNext(); i++) {
      const file = files.next();
      const parents = file.getParents();
      let position = null;
      while (parents.hasNext()) {
        const parent = parents.next();
        const parentId = parent.getId();
        if (folderIdToPosition[parentId]) {
          position = folderIdToPosition[parentId];
          break;
        }
      }
      if (position) {
        results.push(processFile(file, position));
      }
    }

    const hasNextPage = files.hasNext();
    return { certificates: results, hasNextPage: hasNextPage };

  } catch (e) {
    console.error(`Error in fetchCertificatesByPage: ${e}`);
    return { certificates: [], hasNextPage: false, error: e.toString() };
  }
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