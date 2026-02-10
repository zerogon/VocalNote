const ALLOWED_MIME_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/webm',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export interface AudioValidationError {
  error: string;
}

export function validateAudioFile(
  file: File
): AudioValidationError | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      error: '지원하지 않는 오디오 형식입니다. (mp3, wav, m4a, aac, ogg, webm 지원)',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: '파일 크기는 50MB 이하여야 합니다.' };
  }

  return null;
}
