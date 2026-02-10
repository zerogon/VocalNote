'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { AudioPlayer } from './audio-player';
import { RecordingUpload } from './recording-upload';
import { removeRecording } from '@/actions/lessons';

interface RecordingSectionProps {
  lessonId: number;
  recordingId: string | null;
  canUpload: boolean;
}

export function RecordingSection({
  lessonId,
  recordingId,
  canUpload,
}: RecordingSectionProps) {
  const router = useRouter();
  const [isRemoving, startTransition] = useTransition();
  const [showReplace, setShowReplace] = useState(false);

  const handleRemove = () => {
    startTransition(async () => {
      await removeRecording(lessonId);
      router.refresh();
    });
  };

  if (recordingId) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">녹음</h3>
        <AudioPlayer fileId={recordingId} />
        {canUpload && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplace(!showReplace)}
            >
              교체
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? '삭제 중...' : '녹음 삭제'}
            </Button>
          </div>
        )}
        {showReplace && (
          <RecordingUpload lessonId={lessonId} label="새 녹음 파일 선택" />
        )}
      </div>
    );
  }

  if (canUpload) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">녹음</h3>
        <RecordingUpload lessonId={lessonId} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">녹음</h3>
      <p className="text-sm text-muted-foreground">녹음 파일이 없습니다.</p>
    </div>
  );
}
