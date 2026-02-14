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
            <Label htmlFor="sessionNumber">회차</Label>
            <select
              id="sessionNumber"
              name="sessionNumber"
              defaultValue={lesson?.sessionNumber ?? 1}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}회차
                </option>
              ))}
            </select>
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
      </DialogContent>
    </Dialog>
  );
}
