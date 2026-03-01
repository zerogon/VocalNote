'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios|edgios/i.test(ua);
  return isIos && isSafari;
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    const alreadyDismissed = localStorage.getItem('pwa-install-dismissed');
    if (alreadyDismissed) return;

    if (isIosSafari()) {
      setShowIosGuide(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', '1');
    setDismissed(true);
    setShowIosGuide(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (dismissed) return null;

  if (showIosGuide) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border border-border/60 bg-white p-4 shadow-lg shadow-black/[0.08]">
        <p className="mb-2 text-sm font-medium">앱으로 설치하기</p>
        <p className="mb-3 text-sm text-muted-foreground">
          하단의{' '}
          <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
            공유
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline h-3.5 w-3.5">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </span>{' '}
          버튼을 누른 후{' '}
          <span className="font-medium text-foreground">홈 화면에 추가</span>를
          선택하세요.
        </p>
        <Button size="sm" variant="ghost" onClick={handleDismiss}>
          닫기
        </Button>
      </div>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border border-border/60 bg-white p-4 shadow-lg shadow-black/[0.08]">
      <p className="mb-2 text-sm font-medium">
        홈 화면에 추가하면 앱처럼 사용할 수 있어요
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleInstall}>
          설치
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDismiss}>
          나중에
        </Button>
      </div>
    </div>
  );
}
