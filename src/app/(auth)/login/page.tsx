'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  LoginForm,
  LoginModeToggle,
  type LoginMode,
} from '@/components/auth';

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('student');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-4">
          <CardTitle className="text-center">로그인</CardTitle>
          <LoginModeToggle mode={mode} onModeChange={setMode} />
        </CardHeader>
        <CardContent>
          <LoginForm mode={mode} />
        </CardContent>
      </Card>
    </div>
  );
}
