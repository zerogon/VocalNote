'use client';

import { useTransition, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Button,
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import { addLesson, updateLesson } from '@/actions/lessons';
import type { Lesson } from '@/lib/db';
import { RecordingSection } from '@/components/recordings/recording-section';

interface LessonFormProps {
  studentId: number;
  lesson?: Lesson;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function LessonForm({
  studentId,
  lesson,
  open,
  onOpenChange,
}: LessonFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState(lesson?.sessionNumber ?? 1);

  const isEditing = !!lesson;

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = isEditing
        ? await updateLesson(lesson.id, formData)
        : await addLesson(studentId, formData);

      if (result.error) {
        setError(result.error);
      } else {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? '레슨 수정' : '레슨 추가'}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">날짜</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={formatDateForInput(lesson?.date ?? new Date())}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="songTitle">노래 제목</Label>
            <Input
              id="songTitle"
              name="songTitle"
              placeholder="노래 제목을 입력해주세요."
              defaultValue={lesson?.songTitle ?? ''}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>회차</Label>
            <input type="hidden" name="sessionNumber" value={selectedSession} />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSelectedSession(n)}
                  className={`rounded-md border px-2 py-2 text-sm font-medium transition-colors
                    ${selectedSession === n
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                    }`}
                >
                  {n}회차
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">레슨 내용</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="레슨 내용을 입력해주세요."
              defaultValue={lesson?.content ?? ''}
              rows={8}
              required
            />
          </div>
          {isEditing && lesson.studentMemo && (
            <div className="rounded-lg border-l-2 border-primary/30 bg-accent/40 px-4 py-3">
              <p className="mb-1.5 text-xs font-semibold tracking-wide text-accent-foreground">
                학생 메모
              </p>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
                {lesson.studentMemo}
              </p>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                취소
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
        {isEditing && lesson.recordingId && (
          <div className="border-t border-border/40 pt-4">
            <RecordingSection
              lessonId={lesson.id}
              recordingId={lesson.recordingId}
              canUpload={false}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
