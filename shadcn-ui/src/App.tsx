import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BuildBadge from '@/components/shared/BuildBadge';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

const queryClient = new QueryClient();

// Lazy load pages
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const Vendors = lazy(() => import('./pages/Vendors'));
const VendorProfilePage = lazy(() => import('./pages/VendorProfilePage'));

const App = () => (
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
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/vendors/:slug" element={<VendorProfilePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
      {import.meta.env.VITE_SHOW_BADGE === 'true' && <BuildBadge />}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;