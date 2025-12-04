import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("vendorAuth");
    localStorage.removeItem("vendorEmail");
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-netflix-dark-gray text-white p-4 flex flex-col border-r border-netflix-medium-gray">
      <div className="mb-6">
        <div className="text-2xl font-bold">
          <span className="text-netflix-red">The</span> Bazaar
        </div>
        <div className="text-sm text-netflix-light-gray mt-1">Vendor Portal</div>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link to="/dashboard" className="block py-2 px-4 rounded hover:bg-netflix-medium-gray transition-colors">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/analytics" className="block py-2 px-4 rounded hover:bg-netflix-medium-gray transition-colors">
              Analytics
            </Link>
          </li>
          <li>
            <Link to="/products" className="block py-2 px-4 rounded hover:bg-netflix-medium-gray transition-colors">
              Products
            </Link>
          </li>
          <li>
            <Link to="/products/add" className="block py-2 px-4 rounded hover:bg-netflix-medium-gray transition-colors ml-4 text-sm">
              Add Product
            </Link>
          </li>
          <li>
            <Link to="/orders" className="block py-2 px-4 rounded hover:bg-netflix-medium-gray transition-colors">
              Orders
            </Link>
          </li>
          <li>
            <Link to="/profile" className="block py-2 px-4 rounded hover:bg-netflix-medium-gray transition-colors">
              Profile
            </Link>
          </li>
        </ul>
      </nav>
      <div className="pt-4 border-t border-netflix-medium-gray">
        <button
          onClick={handleLogout}
          className="w-full flex items-center py-2 px-4 rounded hover:bg-netflix-medium-gray text-left transition-colors text-red-400 hover:text-red-300"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;