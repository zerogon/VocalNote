'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { validateAudioFile } from '@/lib/validations/recording';

interface RecordingUploadProps {
  lessonId: number;
  label?: string;
}

export function RecordingUpload({
  lessonId,
  label = '녹음 업로드',
}: RecordingUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateAudioFile(file);
    if (validationError) {
      setError(validationError.error);
      // input 초기화
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setError(null);
    uploadFile(file);
  };

  const uploadFile = (file: File) => {
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('lessonId', String(lessonId));

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';

      if (xhr.status >= 200 && xhr.status < 300) {
        router.refresh();
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setError(data.error || '업로드에 실패했습니다.');
        } catch {
          setError('업로드에 실패했습니다.');
        }
      }
    });

    xhr.addEventListener('error', () => {
      setIsUploading(false);
      setError('네트워크 오류가 발생했습니다.');
      if (inputRef.current) inputRef.current.value = '';
    });

    xhr.open('POST', '/api/recordings/upload');
    xhr.send(formData);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? `업로드 중... ${progress}%` : label}
      </Button>

      {isUploading && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
