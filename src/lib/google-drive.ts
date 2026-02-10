import { google } from 'googleapis';
import { Readable } from 'stream';

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);
auth.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({ version: 'v3', auth });

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [FOLDER_ID],
    },
    media: {
      mimeType,
      body: readable,
    },
    fields: 'id',
  });

  if (!response.data.id) {
    throw new Error('파일 업로드에 실패했습니다.');
  }

  return response.data.id;
}

export async function getFileStream(
  fileId: string
): Promise<{ stream: Readable; mimeType: string; size: number }> {
  const meta = await drive.files.get({
    fileId,
    fields: 'mimeType,size',
  });

  const mimeType = meta.data.mimeType || 'application/octet-stream';
  const size = parseInt(meta.data.size || '0', 10);

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return {
    stream: response.data as unknown as Readable,
    mimeType,
    size,
  };
}

export async function deleteFile(fileId: string): Promise<void> {
  await drive.files.delete({ fileId });
}
