import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOffline } from '@thebazaar/hooks/useOffline';
import { setupBackgroundSync } from '@/utils/backgroundSync';

/**
 * Component that detects offline status and redirects to offline page
 * Also sets up background sync for cart/wishlist
 */
export function OfflineDetector() {
  const isOffline = useOffline();
  const navigate = useNavigate();

  useEffect(() => {
    // Setup background sync when component mounts
    setupBackgroundSync();
  }, []);

  useEffect(() => {
    // Redirect to offline page when going offline
    // (But allow navigation away from offline page when coming back online)
    if (isOffline && window.location.pathname !== '/offline') {
      navigate('/offline', { replace: true });
    }
  }, [isOffline, navigate]);

  return null; // This component doesn't render anything
}

