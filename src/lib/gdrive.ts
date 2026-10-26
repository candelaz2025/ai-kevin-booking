/**
 * Google Drive API Client Service for Kevin AI Booking & CMS
 * Handles automated file uploads to Google Drive folders:
 * 1. Slips folder (slipcoursekevin)
 * 2. Articles media folder (article_media_kevin)
 */

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface DriveUploadResult {
  fileId: string;
  fileName: string;
  viewUrl: string;
  directDownloadUrl: string;
  thumbnailUrl: string;
}

let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Get a valid Google OAuth access token using Refresh Token
 */
export async function getGoogleDriveAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && now < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || '332949135824-1rt5lrjfe99jrlfpruenfcugu7120glq.apps.googleusercontent.com';
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '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';
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '1//0glw9ynxDHnZ5CgYIARAAGBASNwF-L9Ir1aykbC4aLy05d_feQUa95P06U31GI-iOrSsO2ohq5_-345Iw6QFR0Gbhl_wQaqWBrpc';

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  const data: GoogleTokenResponse = await tokenRes.json();
  if (!data.access_token) {
    throw new Error(`Failed to refresh Google Drive access token: ${JSON.stringify(data)}`);
  }

  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedAccessToken;
}

/**
 * Upload a file (Buffer or Base64 data URL) directly into Google Drive folder
 */
export async function uploadFileToGoogleDrive({
  fileName,
  mimeType,
  buffer,
  folderType = 'slip'
}: {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  folderType?: 'slip' | 'article' | 'course';
}): Promise<DriveUploadResult> {
  const token = await getGoogleDriveAccessToken();
  const folderId = folderType === 'slip' 
    ? (process.env.GOOGLE_DRIVE_SLIP_FOLDER_ID || '1Kh2jfeqLRqbgsAL-aPTUrWWMAqC2VJPY')
    : (process.env.GOOGLE_DRIVE_ARTICLE_FOLDER_ID || '16n_jlly_N23nig64V5XZTbzwjRAEeUZ9');

  const metadata = {
    name: fileName,
    parents: [folderId]
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([new Uint8Array(buffer)], { type: mimeType }));

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,thumbnailLink', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  const uploadData = await uploadRes.json();
  if (!uploadData.id) {
    throw new Error(`Google Drive upload failed: ${JSON.stringify(uploadData)}`);
  }

  // Grant public read permission so admin, user and web pages can view image immediately
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${uploadData.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' })
    });
  } catch (err) {
    console.warn('Failed to set public permission on Drive file:', err);
  }

  const fileId = uploadData.id;
  // High-compatibility direct image CDN URL (No 403, No attachment download prompt)
  const directDownloadUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
  const viewUrl = uploadData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
  const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;

  return {
    fileId,
    fileName: uploadData.name || fileName,
    viewUrl,
    directDownloadUrl,
    thumbnailUrl
  };
}

/**
 * Upload Base64 Data URL to Google Drive (e.g. data:image/png;base64,...)
 */
export async function uploadBase64ToGoogleDrive({
  dataUrl,
  fileName,
  folderType
}: {
  dataUrl: string;
  fileName: string;
  folderType?: 'slip' | 'article' | 'course';
}): Promise<DriveUploadResult> {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid Base64 Data URL format');
  }

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');

  return uploadFileToGoogleDrive({
    fileName,
    mimeType,
    buffer,
    folderType
  });
}

export { formatGoogleDriveImageUrl, compressImageFile } from './image-utils';
