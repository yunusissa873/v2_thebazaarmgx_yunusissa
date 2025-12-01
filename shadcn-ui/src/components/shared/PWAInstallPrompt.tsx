/**
 * PWA Install Prompt Component
 * Handles install prompts for Android/Chrome and iOS
 */

import { useEffect, useState } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function PWAInstallPrompt() {
  const { isInstallable, isIOS, isInstalled, showPrompt, promptInstall, dismissPrompt } = usePWAInstall();
  const [showIOSSheet, setShowIOSSheet] = useState(false);

  // Don't show if already installed or not installable
  if (isInstalled || !showPrompt) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSSheet(true);
    } else if (isInstallable) {
      await promptInstall();
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setShowIOSSheet(false);
  };

  return (
    <>
      {/* Android/Chrome Install Banner */}
      {isInstallable && !isIOS && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-netflix-medium-gray bg-netflix-dark-gray p-4 shadow-lg">
          <div className="container-custom flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Install The Bazaar</h3>
              <p className="text-sm text-gray-400">
                Install our app for a faster, more convenient shopping experience
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleInstall}
                className="bg-netflix-red hover:bg-netflix-red/90 text-white"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Install Banner */}
      {isIOS && !isInstalled && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-netflix-medium-gray bg-netflix-dark-gray p-4 shadow-lg">
          <div className="container-custom flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Add to Home Screen</h3>
              <p className="text-sm text-gray-400">
                Get the full app experience on your iPhone or iPad
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowIOSSheet(true)}
                className="bg-netflix-red hover:bg-netflix-red/90 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Learn How
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Instructions Sheet */}
      <Sheet open={showIOSSheet} onOpenChange={setShowIOSSheet}>
        <SheetContent className="bg-netflix-black border-netflix-dark-gray text-white w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-white">Add The Bazaar to Home Screen</SheetTitle>
            <SheetDescription className="text-gray-400">
              Follow these simple steps to install our app on your iOS device
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-netflix-red flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">Tap the Share Button</h4>
                  <p className="text-gray-400 text-sm">
                    Look for the share icon in Safari&apos;s bottom navigation bar
                  </p>
                  <div className="mt-2 p-3 bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray flex items-center gap-2">
                    <Share className="h-4 w-4 text-gray-300" />
                    <p className="text-xs text-gray-300">
                      Share icon (square with arrow pointing up)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-netflix-red flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">Select &quot;Add to Home Screen&quot;</h4>
                  <p className="text-gray-400 text-sm">
                    Scroll down in the share menu and tap &quot;Add to Home Screen&quot;
                  </p>
                  <div className="mt-2 p-3 bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Plus className="h-4 w-4" />
                      <span>Add to Home Screen option</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-netflix-red flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">Confirm Installation</h4>
                  <p className="text-gray-400 text-sm">
                    Tap &quot;Add&quot; in the top-right corner. The app will appear on your home screen!
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Guide */}
            <div className="mt-6 p-4 bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray">
              <p className="text-sm text-gray-300 mb-2">
                <strong className="text-white">Tip:</strong> After installation, you can launch The Bazaar directly from your home screen, just like any other app!
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1 border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
              >
                Got it!
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

