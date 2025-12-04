import { useState } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Users, Package } from "lucide-react";

interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
    period: string;
  };
  orders: {
    total: number;
    change: number;
    period: string;
  };
  customers: {
    total: number;
    change: number;
    period: string;
  };
  products: {
    total: number;
    change: number;
    period: string;
  };
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    sales: number;
    percentage: number;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    date: string;
  }>;
}

const Analytics = () => {
  const [analyticsData] = useState<AnalyticsData>({
    revenue: { total: 125000, change: 12.5, period: "vs last month" },
    orders: { total: 342, change: 8.3, period: "vs last month" },
    customers: { total: 1289, change: -2.1, period: "vs last month" },
    products: { total: 156, change: 15.2, period: "vs last month" },
    topProducts: [
      { name: "Artisan Handmade Mug", sales: 45, revenue: 45000 },
      { name: "Traditional Textile Art", sales: 32, revenue: 32000 },
      { name: "Wooden Carving Set", sales: 28, revenue: 28000 },
      { name: "Custom Jewelry Piece", sales: 25, revenue: 25000 },
    ],
    salesByCategory: [
      { category: "Handmade Crafts", sales: 45, percentage: 35 },
      { category: "Textiles", sales: 32, percentage: 25 },
      { category: "Jewelry", sales: 28, percentage: 22 },
      { category: "Home Decor", sales: 23, percentage: 18 },
    ],
    recentOrders: [
      { id: "ORD-001", customer: "John Doe", amount: 8500, date: "2025-11-05" },
      { id: "ORD-002", customer: "Jane Smith", amount: 12000, date: "2025-11-04" },
      { id: "ORD-003", customer: "Mike Johnson", amount: 6500, date: "2025-11-04" },
      { id: "ORD-004", customer: "Sarah Williams", amount: 15200, date: "2025-11-03" },
    ],
  });

  const [timeRange, setTimeRange] = useState("30d");

  const metricCards = [
    {
      title: "Total Revenue",
      value: `KES ${analyticsData.revenue.total.toLocaleString()}`,
      change: analyticsData.revenue.change,
      period: analyticsData.revenue.period,
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      title: "Total Orders",
      value: analyticsData.orders.total.toString(),
      change: analyticsData.orders.change,
      period: analyticsData.orders.period,
      icon: ShoppingCart,
      color: "text-blue-400",
    },
    {
      title: "Total Customers",
      value: analyticsData.customers.total.toLocaleString(),
      change: analyticsData.customers.change,
      period: analyticsData.customers.period,
      icon: Users,
      color: "text-purple-400",
    },
    {
      title: "Total Products",
      value: analyticsData.products.total.toString(),
      change: analyticsData.products.change,
      period: analyticsData.products.period,
      icon: Package,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-netflix-light-gray mt-1">
            Track your business performance and insights
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-netflix-medium-gray rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red bg-netflix-dark-gray text-white"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <div
            key={index}
            className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 hover:border-netflix-red transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-netflix-medium-gray ${metric.color}`}>
                <metric.icon className="h-5 w-5" />
              </div>
              <div className={`flex items-center text-sm ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metric.change >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <div>
              <p className="text-sm text-netflix-light-gray mb-1">{metric.title}</p>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
              <p className="text-xs text-netflix-light-gray mt-1">{metric.period}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Sales Overview</h2>
          <div className="h-64 flex items-center justify-center bg-netflix-medium-gray rounded">
            <div className="text-center text-netflix-light-gray">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-netflix-light-gray" />
              <p>Sales chart will be displayed here</p>
              <p className="text-sm mt-1">Revenue trends over time</p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Top Products</h2>
          <div className="space-y-4">
            {analyticsData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-netflix-medium-gray rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-netflix-red font-bold">#{index + 1}</span>
                    <span className="text-white font-medium">{product.name}</span>
                  </div>
                  <div className="text-sm text-netflix-light-gray mt-1">
                    {product.sales} sales • KES {product.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Sales & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Sales by Category</h2>
          <div className="space-y-4">
            {analyticsData.salesByCategory.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{category.category}</span>
                  <span className="text-netflix-light-gray">{category.percentage}%</span>
                </div>
                <div className="w-full bg-netflix-medium-gray rounded-full h-2">
                  <div
                    className="bg-netflix-red h-2 rounded-full transition-all"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <div className="text-sm text-netflix-light-gray">
                  {category.sales} orders
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Recent Orders</h2>
          <div className="space-y-3">
            {analyticsData.recentOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-netflix-medium-gray rounded">
                <div>
                  <div className="text-white font-medium">{order.id}</div>
                  <div className="text-sm text-netflix-light-gray">{order.customer}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">KES {order.amount.toLocaleString()}</div>
                  <div className="text-xs text-netflix-light-gray">{new Date(order.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
