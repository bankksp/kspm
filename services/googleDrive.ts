
import { Certificate } from '../types';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwI6w9WIbP3StAm9TmxpbotBzby9h-n0cFWxpnu2HmLP5boDVz0Y8X3cY2orf_ZfrkJAg/exec';

/**
 * Fetches certificates from the Google Apps Script.
 * Can fetch all certificates or search for specific ones using a query.
 * @param query - Optional search string. If provided, searches for certificates.
 * @returns A promise that resolves to an array of certificates.
 */
export async function fetchCertificates(query?: string): Promise<Certificate[]> {
  const url = query ? `${APPS_SCRIPT_URL}?query=${encodeURIComponent(query)}` : APPS_SCRIPT_URL;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Apps Script. Status: ${response.status}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();

    // Check for errors returned from the Apps Script itself
    if (data.error) {
      console.error("Google Apps Script Error:", data.details);
      throw new Error(`เกิดข้อผิดพลาดจากฝั่งเซิร์ฟเวอร์: ${data.error}`);
    }

    return data as Certificate[];
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
