'use client';

import { useTransition } from 'react';
import { Switch } from '@/components/ui';
import { toggleUploadPermission } from '@/actions/students';

interface UploadToggleProps {
  studentId: number;
  canUpload: boolean;
}

export function UploadToggle({ studentId, canUpload }: UploadToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (checked: boolean) => {
    startTransition(async () => {
      await toggleUploadPermission(studentId, checked);
    });
  };

  return (
    <Switch
      checked={canUpload}
      onCheckedChange={handleChange}
      disabled={isPending}
    />
  );
}
