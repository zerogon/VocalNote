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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/30 p-4">
      <Card className="w-full max-w-sm shadow-lg shadow-black/[0.06]">
        <CardHeader className="space-y-4 text-center">
          <div>
            <p className="text-2xl font-bold tracking-wide text-primary">VOCAL NOTE</p>
            <p className="mt-1 text-sm text-muted-foreground">보컬 레슨 관리</p>
          </div>
          <LoginModeToggle mode={mode} onModeChange={setMode} />
        </CardHeader>
        <CardContent>
          <LoginForm mode={mode} />
        </CardContent>
      </Card>
    </div>
  );
}
