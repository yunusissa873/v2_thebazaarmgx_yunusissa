import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    // Load stats from localStorage or calculate from data
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    
    const totalProducts = products.length || 150; // Fallback to mock count
    const totalOrders = orders.length || 5;
    const pendingOrders = orders.filter((o: any) => o.status === "pending" || o.status === "processing").length || 2;
    const totalRevenue = orders
      .filter((o: any) => o.status === "delivered" || o.status === "shipped")
      .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 25000;

    setStats({
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
    });
  }, []);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-400",
      bgColor: "bg-netflix-dark-gray",
      link: "/products",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-400",
      bgColor: "bg-netflix-dark-gray",
      link: "/orders",
    },
    {
      title: "Total Revenue",
      value: `KES ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-400",
      bgColor: "bg-netflix-dark-gray",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: "text-netflix-red",
      bgColor: "bg-netflix-dark-gray",
      link: "/orders?status=pending",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="text-sm text-netflix-light-gray">
          Welcome back! Here's what's happening with your store.
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg p-6 border border-netflix-medium-gray hover:border-netflix-red transition-all netflix-card`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-netflix-light-gray">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color} mt-2`}>
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            {stat.link && (
              <Link to={stat.link}>
                <Button variant="link" className="mt-4 p-0 h-auto text-sm text-netflix-red hover:text-[#c11119]">
                  View details →
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/products">
              <Button className="w-full justify-start bg-netflix-medium-gray hover:bg-netflix-red border-netflix-medium-gray text-white" variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </Link>
            <Link to="/orders">
              <Button className="w-full justify-start bg-netflix-medium-gray hover:bg-netflix-red border-netflix-medium-gray text-white" variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Orders
              </Button>
            </Link>
            <Link to="/profile">
              <Button className="w-full justify-start bg-netflix-medium-gray hover:bg-netflix-red border-netflix-medium-gray text-white" variant="outline">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-netflix-medium-gray rounded">
              <div>
                <p className="text-sm font-medium text-white">New order received</p>
                <p className="text-xs text-netflix-light-gray">2 hours ago</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-netflix-medium-gray rounded">
              <div>
                <p className="text-sm font-medium text-white">Product updated</p>
                <p className="text-xs text-netflix-light-gray">5 hours ago</p>
              </div>
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-netflix-medium-gray rounded">
              <div>
                <p className="text-sm font-medium text-white">Order shipped</p>
                <p className="text-xs text-netflix-light-gray">1 day ago</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Sales Overview</h2>
        <div className="h-64 flex items-center justify-center bg-netflix-medium-gray rounded">
          <div className="text-center text-netflix-light-gray">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-netflix-light-gray" />
            <p>Sales chart will be displayed here</p>
            <p className="text-sm mt-1">Last 30 days performance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
