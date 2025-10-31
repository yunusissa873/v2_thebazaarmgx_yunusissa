import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProductsPage from "./pages/Products";

// Placeholder pages for other routes
const Orders = () => <div>This is the Orders Page</div>;
const Profile = () => <div>This is the Profile Page</div>;

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;