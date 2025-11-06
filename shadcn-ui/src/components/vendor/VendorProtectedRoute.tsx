/**
 * Vendor Protected Route Component
 * 
 * Protects vendor routes, ensuring only authenticated vendors can access
 * 
 * @author The Bazaar Development Team
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVendorProfile } from '@/hooks/useVendorProfile';

interface VendorProtectedRouteProps {
  children: React.ReactNode;
}

export default function VendorProtectedRoute({ children }: VendorProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const { vendorProfile, isLoading: vendorLoading } = useVendorProfile();

  if (loading || vendorLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#141414]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E50914] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/vendor/login" replace />;
  }

  // Check if user has vendor role
  // Note: This will be enhanced once we have profile data
  if (!vendorProfile) {
    return <Navigate to="/vendor/register" replace />;
  }

  return <>{children}</>;
}
