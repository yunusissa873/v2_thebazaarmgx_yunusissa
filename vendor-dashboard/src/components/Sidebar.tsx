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
    <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Vendor Dashboard</h2>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link to="/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/products" className="block py-2 px-4 rounded hover:bg-gray-700">
              Products
            </Link>
          </li>
          <li>
            <Link to="/orders" className="block py-2 px-4 rounded hover:bg-gray-700">
              Orders
            </Link>
          </li>
          <li>
            <Link to="/profile" className="block py-2 px-4 rounded hover:bg-gray-700">
              Profile
            </Link>
          </li>
        </ul>
      </nav>
      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center py-2 px-4 rounded hover:bg-gray-700 text-left"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;