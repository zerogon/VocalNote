'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border border-border/60 bg-white p-4 shadow-lg shadow-black/[0.08]">
      <p className="mb-2 text-sm font-medium">
        홈 화면에 추가하면 앱처럼 사용할 수 있어요
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleInstall}>
          설치
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
          나중에
        </Button>
      </div>
    </div>
  );
}
