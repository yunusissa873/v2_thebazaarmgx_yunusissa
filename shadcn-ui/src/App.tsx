import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BuildBadge from '@/components/shared/BuildBadge';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { PWAInstallPrompt } from '@/components/shared/PWAInstallPrompt';
import { OfflineDetector } from '@/components/shared/OfflineDetector';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import VendorPortalLayout from '@/components/vendor/VendorPortalLayout';
import VendorProtectedRoute from '@/components/vendor/VendorProtectedRoute';

// Import vendor login/register directly (not lazy) to avoid routing issues
import VendorLogin from './pages/vendor/Login';
import VendorRegister from './pages/vendor/Register';

// Import error capture utility (only in development)
if (import.meta.env.DEV) {
  import('@/utils/consoleErrorCapture');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});

// Lazy load pages
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const VendorDashboard = lazy(() => import('./pages/vendor/Dashboard'));
const VendorProducts = lazy(() => import('./pages/vendor/Products'));
const VendorOrders = lazy(() => import('./pages/vendor/Orders'));
const VendorAnalytics = lazy(() => import('./pages/vendor/Analytics'));
const VendorMessages = lazy(() => import('./pages/vendor/Messages'));
const VendorFinancials = lazy(() => import('./pages/vendor/Financials'));
const VendorProfile = lazy(() => import('./pages/vendor/Profile'));
const VendorHelp = lazy(() => import('./pages/vendor/Help'));
const Vendors = lazy(() => import('./pages/Vendors'));
const VendorProfilePage = lazy(() => import('./pages/VendorProfilePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetails = lazy(() => import('./components/orders/OrderDetails'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const FAQsPage = lazy(() => import('./pages/FAQsPage'));
const ShippingPage = lazy(() => import('./pages/ShippingPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const VendorTermsPage = lazy(() => import('./pages/VendorTermsPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const PressPage = lazy(() => import('./pages/PressPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const VendorRegisterPage = lazy(() => import('./pages/VendorRegisterPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const OfflinePage = lazy(() => import('./pages/OfflinePage'));

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                  <Routes>
                    {/* Vendor Portal Routes - No Navbar/Footer */}
                    {/* IMPORTANT: Public routes must be defined BEFORE the wildcard route */}
                    <Route path="/vendor/login" element={<VendorLogin />} />
                    <Route path="/vendor/register" element={<VendorRegister />} />
                    {/* Protected vendor routes - use wildcard for nested routes */}
                    <Route
                      path="/vendor/*"
                      element={
                        <VendorProtectedRoute>
                          <VendorPortalLayout />
                        </VendorProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="/vendor/dashboard" replace />} />
                      <Route path="dashboard" element={<VendorDashboard />} />
                      <Route path="products" element={<VendorProducts />} />
                      <Route path="orders" element={<VendorOrders />} />
                      <Route path="analytics" element={<VendorAnalytics />} />
                      <Route path="messages" element={<VendorMessages />} />
                      <Route path="financials" element={<VendorFinancials />} />
                      <Route path="profile" element={<VendorProfile />} />
                      <Route path="help" element={<VendorHelp />} />
                    </Route>

                    {/* Main App Routes - With Navbar/Footer */}
                    <Route
                      path="/"
                      element={
                        <div className="min-h-screen flex flex-col">
                          <Navbar />
                          <main className="flex-1">
                            <Index />
                          </main>
                          <Footer />
                          <PWAInstallPrompt />
                          <OfflineDetector />
                        </div>
                      }
                    />
                    {/* ...other main app routes remain unchanged */}
                  </Routes>
                </Suspense>
              </BrowserRouter>
              {import.meta.env.VITE_SHOW_BADGE === 'true' && <BuildBadge />}
            </TooltipProvider>
          </QueryClientProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
