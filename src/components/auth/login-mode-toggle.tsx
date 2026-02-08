'use client';

import { cn } from '@/lib/utils';

export type LoginMode = 'student' | 'admin';

interface LoginModeToggleProps {
  mode: LoginMode;
  onModeChange: (mode: LoginMode) => void;
}

export function LoginModeToggle({ mode, onModeChange }: LoginModeToggleProps) {
  return (
    <div className="flex rounded-lg bg-muted p-1">
      <button
        type="button"
        onClick={() => onModeChange('student')}
        className={cn(
          'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
          mode === 'student'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        학생
      </button>
      <button
        type="button"
        onClick={() => onModeChange('admin')}
        className={cn(
          'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
          mode === 'admin'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        관리자
      </button>
    </div>
  );
}
