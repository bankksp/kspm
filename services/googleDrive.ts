import { Certificate, Position } from '../types';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwI6w9WIbP3StAm9TmxpbotBzby9h-n0cFWxpnu2HmLP5boDVz0Y8X3cY2orf_ZfrkJAg/exec';

interface FetchResponse {
  certificates: Certificate[];
  hasNextPage: boolean;
  error?: string;
  details?: string;
}

/**
 * Fetches certificates from the Google Apps Script.
 * Can fetch all certificates (paginated) or search for specific ones.
 * @param query - Optional search string.
 * @param limit - Optional number of items per page.
 * @param offset - Optional starting index for pagination.
 * @param position - Optional position to filter by.
 * @returns A promise that resolves to an object with certificates and pagination info.
 */
export async function fetchCertificates(
  query?: string,
  limit?: number,
  offset?: number,
  position?: Position | 'ทั้งหมด'
): Promise<FetchResponse> {
  const params = new URLSearchParams();
  if (query) {
    params.append('query', query);
  }
  if (limit !== undefined) {
    params.append('limit', String(limit));
  }
  if (offset !== undefined) {
    params.append('offset', String(offset));
  }
  if (position) {
    params.append('position', position);
  }

  const url = `${APPS_SCRIPT_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Apps Script. Status: ${response.status}`);
    }
    
    const data: FetchResponse = await response.json();

    if (data.error) {
      console.error("Google Apps Script Error:", data.details);
      throw new Error(`เกิดข้อผิดพลาดจากฝั่งเซิร์ฟเวอร์: ${data.error}`);
    }
    
    // Ensure the response has the expected shape
    return {
      certificates: data.certificates || [],
      hasNextPage: data.hasNextPage === true,
    };
  } catch (error) {
    console.error("Error fetching certificates from Apps Script:", error);
    if (error instanceof TypeError) { // Network error or CORS issue
        throw new Error("ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ กรุณาตรวจสอบเครือข่ายและการตั้งค่า Apps Script");
    }
    throw error; // Re-throw other errors
  }
}


/**
 * Fetches the current maintenance status from the server.
 */
export async function fetchMaintenanceStatus(): Promise<boolean> {
  const url = `${APPS_SCRIPT_URL}?action=getMaintenanceStatus`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.maintenance === true;
  } catch (error) {
    console.warn("Failed to fetch maintenance status, defaulting to false", error);
    return false;
  }
}

/**
 * Updates the maintenance status on the server.
 */
export async function updateMaintenanceStatus(status: boolean): Promise<boolean> {
  const url = `${APPS_SCRIPT_URL}?action=setMaintenanceStatus&mode=${status}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Failed to update maintenance status", error);
    throw new Error("ไม่สามารถบันทึกสถานะไปยังเซิร์ฟเวอร์ได้");
  }
}