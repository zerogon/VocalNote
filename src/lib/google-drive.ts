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

async function findOrCreateFolder(
  name: string,
  parentId: string
): Promise<string> {
  const query = `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const list = await drive.files.list({
    q: query,
    fields: 'files(id)',
    spaces: 'drive',
  });

  if (list.data.files && list.data.files.length > 0 && list.data.files[0].id) {
    return list.data.files[0].id;
  }

  const created = await drive.files.create({
    requestBody: {
      name,
      parents: [parentId],
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  if (!created.data.id) {
    throw new Error(`폴더 생성에 실패했습니다: ${name}`);
  }

  return created.data.id;
}

export async function resolveUploadFolder(
  year: string,
  studentName: string
): Promise<string> {
  const yearFolderId = await findOrCreateFolder(year, FOLDER_ID);
  const studentFolderId = await findOrCreateFolder(studentName, yearFolderId);
  return studentFolderId;
}

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  parentFolderId?: string
): Promise<string> {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [parentFolderId || FOLDER_ID],
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
