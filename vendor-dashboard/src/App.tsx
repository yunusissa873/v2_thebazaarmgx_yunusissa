import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ProfilePage from "./pages/vendor/Profile";
import CommercePage from "./pages/vendor/Commerce";
import AddProductPage from "./pages/vendor/AddProduct";
import AnalyticsPage from "./pages/vendor/Analytics";
import FinancePage from "./pages/vendor/Finance";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected Routes - Vendor Portal v3.0 */}
        <Route
          path="/vendor/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/commerce"
          element={
            <ProtectedRoute>
              <Layout>
                <CommercePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/commerce/products/add"
          element={
            <ProtectedRoute>
              <Layout>
                <AddProductPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <AnalyticsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/finance"
          element={
            <ProtectedRoute>
              <Layout>
                <FinancePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Legacy Routes - Redirect to new structure */}
        <Route path="/dashboard" element={<Navigate to="/vendor/profile" replace />} />
        <Route path="/profile" element={<Navigate to="/vendor/profile" replace />} />
        <Route path="/products" element={<Navigate to="/vendor/commerce" replace />} />
        <Route path="/orders" element={<Navigate to="/vendor/commerce" replace />} />
        <Route path="/analytics" element={<Navigate to="/vendor/analytics" replace />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/vendor/profile" replace />} />
        <Route path="/vendor" element={<Navigate to="/vendor/profile" replace />} />
      </Routes>
    </Router>
  );
}

export default App;