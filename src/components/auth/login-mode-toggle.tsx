'use client';

import { cn } from '@/lib/utils';

export type LoginMode = 'student' | 'admin';

interface LoginModeToggleProps {
  mode: LoginMode;
  onModeChange: (mode: LoginMode) => void;
}

export function LoginModeToggle({ mode, onModeChange }: LoginModeToggleProps) {
  return (
    <div className="flex rounded-xl bg-muted/70 p-1">
      <button
        type="button"
        onClick={() => onModeChange('student')}
        className={cn(
          'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
          mode === 'student'
            ? 'bg-white text-foreground shadow-sm shadow-black/[0.06]'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        학생
      </button>
      <button
        type="button"
        onClick={() => onModeChange('admin')}
        className={cn(
          'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
          mode === 'admin'
            ? 'bg-white text-foreground shadow-sm shadow-black/[0.06]'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        선생님
      </button>
    </div>
  );
}
