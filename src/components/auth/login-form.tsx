'use client';

import { useActionState } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { loginStudent, loginAdmin, type ActionState } from '@/actions/auth';
import type { LoginMode } from './login-mode-toggle';

interface LoginFormProps {
  mode: LoginMode;
}

const initialState: ActionState = {};

export function LoginForm({ mode }: LoginFormProps) {
  const [studentState, studentAction, studentPending] = useActionState(
    loginStudent,
    initialState
  );
  const [adminState, adminAction, adminPending] = useActionState(
    loginAdmin,
    initialState
  );

  const state = mode === 'student' ? studentState : adminState;
  const action = mode === 'student' ? studentAction : adminAction;
  const pending = mode === 'student' ? studentPending : adminPending;

  return (
    <form action={action} className="space-y-4">
      {mode === 'student' ? (
        <div className="space-y-2">
          <Label htmlFor="phone">휴대폰 번호</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="01012345678"
            autoComplete="tel"
            required
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
      )}

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
}
