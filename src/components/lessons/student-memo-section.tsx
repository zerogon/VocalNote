'use client';

import { useState, useTransition } from 'react';
import { saveStudentMemo } from '@/actions/lessons';

interface StudentMemoSectionProps {
  lessonId: number;
  initialMemo: string | null;
}

export function StudentMemoSection({ lessonId, initialMemo }: StudentMemoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialMemo ?? '');
  const [savedMemo, setSavedMemo] = useState(initialMemo);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleEdit() {
    setValue(savedMemo ?? '');
    setError(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setValue(savedMemo ?? '');
    setError(null);
    setIsEditing(false);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveStudentMemo(lessonId, value);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSavedMemo(value.trim() || null);
      setIsEditing(false);
      setError(null);
    });
  }

  return (
    <div className="rounded-lg border-l-2 border-primary/30 bg-accent/40 px-4 py-3">
      <p className="mb-2 text-xs font-semibold tracking-wide text-accent-foreground">
        내 메모
      </p>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            className="w-full rounded-md border border-primary/20 bg-card px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            rows={4}
            maxLength={2000}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="레슨에 대한 메모를 자유롭게 작성하세요."
            disabled={isPending}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      ) : savedMemo ? (
        <div className="space-y-2">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
            {savedMemo}
          </p>
          <button
            onClick={handleEdit}
            className="text-xs font-medium text-accent-foreground hover:text-primary"
          >
            수정
          </button>
        </div>
      ) : (
        <button
          onClick={handleEdit}
          className="text-sm text-accent-foreground/60 hover:text-accent-foreground"
        >
          + 메모 추가
        </button>
      )}
    </div>
  );
}
