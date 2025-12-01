import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SecurityMiddleware } from './lib/security/middleware';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Vendors from './pages/Vendors';
import Users from './pages/Users';
import Finance from './pages/Finance';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Security from './pages/Security';
import Settings from './pages/Settings';
import Content from './pages/Content';
import Categories from './pages/Categories';
import Payments from './pages/Payments';
import Analytics from './pages/Analytics';
import Support from './pages/Support';
import AdminStaffManagement from './pages/AdminStaff/AdminStaffManagement';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vendors/*" element={<Vendors />} />
                <Route path="/users/*" element={<Users />} />
                <Route path="/products/*" element={<Products />} />
                <Route path="/categories/*" element={<Categories />} />
                <Route path="/orders/*" element={<Orders />} />
                <Route path="/payments/*" element={<Payments />} />
                <Route path="/finance/*" element={<Finance />} />
                <Route path="/analytics/*" element={<Analytics />} />
                <Route path="/content/*" element={<Content />} />
                <Route path="/settings/*" element={<Settings />} />
                <Route path="/security/*" element={<Security />} />
                <Route path="/support/*" element={<Support />} />
                <Route path="/admin-staff/*" element={<AdminStaffManagement />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SecurityMiddleware>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </SecurityMiddleware>
    </AuthProvider>
  );
}

export default App;

