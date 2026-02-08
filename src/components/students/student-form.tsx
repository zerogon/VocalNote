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
} from '@/components/ui';
import { addStudent, updateStudent } from '@/actions/students';
import type { User } from '@/lib/db';

interface StudentFormProps {
  student?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentForm({ student, open, onOpenChange }: StudentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!student;

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = isEditing
        ? await updateStudent(student.id, formData)
        : await addStudent(formData);

      if (result.error) {
        setError(result.error);
      } else {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? '학생 수정' : '학생 추가'}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              name="name"
              defaultValue={student?.name ?? ''}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">휴대폰 번호</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="01012345678"
              defaultValue={student?.phone ?? ''}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <DialogClose>
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
