'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { AudioPlayer } from './audio-player';
import { RecordingUpload } from './recording-upload';
import { deleteRecording, renameRecording } from '@/actions/recordings';
import type { Recording } from '@/lib/db';

interface RecordingSectionProps {
  lessonId: number;
  recordings: Recording[];
  canUpload: boolean;
  onMutated?: () => void;
}

interface RecordingRowProps {
  recording: Recording;
  canUpload: boolean;
  onMutated?: () => void;
}

function RecordingRow({ recording, canUpload, onMutated }: RecordingRowProps) {
  const router = useRouter();
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(recording.displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRenameStart = () => {
    setNameValue(recording.displayName);
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleRenameSave = async () => {
    if (nameValue.trim() === recording.displayName) {
      setIsRenaming(false);
      return;
    }
    setIsSaving(true);
    await renameRecording(recording.id, nameValue);
    setIsSaving(false);
    setIsRenaming(false);
    onMutated?.();
    router.refresh();
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSave();
    } else if (e.key === 'Escape') {
      setNameValue(recording.displayName);
      setIsRenaming(false);
    }
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      await deleteRecording(recording.id);
      onMutated?.();
      router.refresh();
    });
  };

  return (
    <div className={`flex flex-col gap-2 rounded-md border border-border/40 p-3 transition-opacity ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2">
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleRenameSave}
            onKeyDown={handleRenameKeyDown}
            disabled={isSaving}
            className={`flex-1 rounded border border-primary/50 bg-background px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${isSaving ? 'opacity-50' : ''}`}
          />
        ) : (
          <span className="flex-1 truncate text-sm font-medium">{recording.displayName}</span>
        )}
        {canUpload && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleRenameStart}
              disabled={isRenaming || isDeleting}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
              title="이름 변경"
            >
              ✎
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
              title="삭제"
            >
              🗑
            </button>
          </div>
        )}
      </div>
      <AudioPlayer fileId={recording.fileId} />
    </div>
  );
}

export function RecordingSection({
  lessonId,
  recordings,
  canUpload,
  onMutated,
}: RecordingSectionProps) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">녹음</h3>
          <span className="text-xs text-muted-foreground/60">(재생 시작까지 잠시 지연될 수 있습니다)</span>
        </div>
        {canUpload && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUpload((prev) => !prev)}
          >
            + 녹음 추가
          </Button>
        )}
      </div>

      {recordings.length === 0 && !canUpload && (
        <p className="text-sm text-muted-foreground">녹음 파일이 없습니다.</p>
      )}

      {recordings.length > 0 && (
        <div className="space-y-2">
          {recordings.map((recording) => (
            <RecordingRow
              key={recording.id}
              recording={recording}
              canUpload={canUpload}
              onMutated={onMutated}
            />
          ))}
        </div>
      )}

      {canUpload && showUpload && (
        <div className="rounded-md border border-dashed border-border/60 p-3">
          <RecordingUpload
            lessonId={lessonId}
            label="녹음 파일 선택"
            onUploaded={() => { setShowUpload(false); onMutated?.(); }}
          />
        </div>
      )}
    </div>
  );
}
