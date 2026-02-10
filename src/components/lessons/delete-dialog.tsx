'use client';

import { useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Button,
} from '@/components/ui';
import { deleteLesson } from '@/actions/lessons';

interface DeleteDialogProps {
  lessonId: number;
  hasRecording?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDialog({
  lessonId,
  hasRecording = false,
  open,
  onOpenChange,
}: DeleteDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteLesson(lessonId);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>레슨 삭제</DialogTitle>
          <DialogDescription>
            정말 이 레슨을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
          {hasRecording && (
            <p className="mt-2 text-sm font-medium text-destructive">
              연결된 녹음 파일도 함께 삭제됩니다.
            </p>
          )}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              취소
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
