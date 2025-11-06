import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
const VendorLogin = lazy(() => import('./pages/vendor/Login'));
const VendorRegister = lazy(() => import('./pages/vendor/Register'));
const Vendors = lazy(() => import('./pages/Vendors'));
const VendorProfilePage = lazy(() => import('./pages/VendorProfilePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
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
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/faqs" element={<FAQsPage />} />
                    <Route path="/shipping" element={<ShippingPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/cookies" element={<CookiePolicyPage />} />
                    <Route path="/vendor-terms" element={<VendorTermsPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/resources" element={<ResourcesPage />} />
                    <Route path="/careers" element={<CareersPage />} />
                    <Route path="/press" element={<PressPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/vendors/register" element={<VendorRegisterPage />} />
                    {/* Vendor Portal Routes */}
                    <Route path="/vendor/login" element={<VendorLogin />} />
                    <Route path="/vendor/register" element={<VendorRegister />} />
                    <Route
                      path="/vendor"
                      element={
                        <VendorProtectedRoute>
                          <VendorPortalLayout />
                        </VendorProtectedRoute>
                      }
                    >
                      <Route path="dashboard" element={<VendorDashboard />} />
                      <Route path="products" element={<VendorProducts />} />
                      <Route path="orders" element={<VendorOrders />} />
                      <Route path="analytics" element={<VendorAnalytics />} />
                      <Route path="messages" element={<VendorMessages />} />
                      <Route path="financials" element={<VendorFinancials />} />
                      <Route path="profile" element={<VendorProfile />} />
                      <Route path="help" element={<VendorHelp />} />
                    </Route>
                    <Route path="/vendors" element={<Vendors />} />
                    <Route path="/vendors/:slug" element={<VendorProfilePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/offline" element={<OfflinePage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <PWAInstallPrompt />
              <OfflineDetector />
            </div>
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