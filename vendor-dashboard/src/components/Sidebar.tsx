import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">Vendor Dashboard</h2>
      <nav>
        <ul>
          <li>
            <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-700">
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
    </div>
  );
};

export default Sidebar;