import { NextResponse } from 'next/server';
import { uploadBase64ToGoogleDrive, uploadFileToGoogleDrive } from '@/lib/gdrive';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Case 1: JSON payload with Base64 dataUrl
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { dataUrl, fileName, folderType } = body;

      if (!dataUrl) {
        return NextResponse.json({ success: false, error: 'Missing dataUrl parameter' }, { status: 400 });
      }

      const targetFolderType = folderType === 'slip' ? 'slip' : folderType === 'course' ? 'course' : 'article';
      const result = await uploadBase64ToGoogleDrive({
        dataUrl,
        fileName: fileName || `upload-${Date.now()}.png`,
        folderType: targetFolderType
      });

      return NextResponse.json({ success: true, data: result });
    }

    // Case 2: Multipart Form Data with File
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const rawFolderType = formData.get('folderType') as string;
      const folderType = rawFolderType === 'slip' ? 'slip' : rawFolderType === 'course' ? 'course' : 'article';

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await uploadFileToGoogleDrive({
        fileName: file.name || `file-${Date.now()}`,
        mimeType: file.type || 'application/octet-stream',
        buffer,
        folderType
      });

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (err: any) {
    console.error('Google Drive Upload Route Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
