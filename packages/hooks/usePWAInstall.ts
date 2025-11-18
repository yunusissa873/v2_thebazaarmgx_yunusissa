/**
 * Hook for PWA Install functionality
 */

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PWAInstallState {
  isInstallable: boolean;
  isIOS: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  promptEvent: BeforeInstallPromptEvent | null;
  showPrompt: boolean;
}

export function usePWAInstall() {
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isIOS: false,
    isInstalled: false,
    isStandalone: false,
    promptEvent: null,
    showPrompt: false,
  });

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    // Check if iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    // Check if already dismissed from localStorage
    const dismissedPrompt = localStorage.getItem('pwa-install-dismissed');
    const dismissedDate = dismissedPrompt ? new Date(dismissedPrompt) : null;
    const daysSinceDismissed = dismissedDate
      ? Math.floor((Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;

    // Show prompt again if dismissed more than 7 days ago
    const shouldShowPrompt = daysSinceDismissed > 7 || !dismissedPrompt;

    setState((prev) => ({
      ...prev,
      isStandalone,
      isInstalled: isStandalone,
      isIOS,
      showPrompt: !isStandalone && shouldShowPrompt,
    }));

    // Handle beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setState((prev) => ({
        ...prev,
        isInstallable: true,
        promptEvent: installEvent,
        showPrompt: true,
      }));
    };

    // Handle appinstalled event
    const handleAppInstalled = () => {
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        showPrompt: false,
      }));
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (state.promptEvent) {
      await state.promptEvent.prompt();
      const choiceResult = await state.promptEvent.userChoice;
      
      setState((prev) => ({
        ...prev,
        isInstallable: false,
        promptEvent: null,
        showPrompt: choiceResult.outcome === 'dismissed',
      }));

      if (choiceResult.outcome === 'dismissed') {
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
      }

      return choiceResult;
    }
    return null;
  };

  const dismissPrompt = () => {
    setState((prev) => ({
      ...prev,
      showPrompt: false,
    }));
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  return {
    ...state,
    promptInstall,
    dismissPrompt,
  };
}

