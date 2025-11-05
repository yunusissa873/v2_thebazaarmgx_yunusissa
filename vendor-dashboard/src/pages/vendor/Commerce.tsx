import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  Upload,
  Plus,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Search,
  Filter,
  FileDown,
  Truck,
} from "lucide-react";
import { Product } from "@/types";
import mockProductsData from "@/data/products.json";
import ordersData from "@/data/orders.json";

interface RawProduct {
  product_id: string;
  title: string;
  description: string;
  price_kes: number;
  stock: number;
  image_urls: string[];
  vendor_id: string;
  category_id: number;
  slug: string;
  price_usd: number;
  seo_metadata?: {
    seo_title?: string;
    seo_description?: string;
  };
}

interface Order {
  order_id: string;
  customer_name: string;
  customer_email: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  date: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
  }>;
}

const transformMockProduct = (mockProduct: RawProduct): Product => ({
  ...mockProduct,
  id: mockProduct.product_id,
  name: mockProduct.title,
  price: mockProduct.price_kes,
  image: mockProduct.image_urls?.[0] || "https://via.placeholder.com/40",
  brand: "Unknown",
  seo_title: mockProduct.seo_metadata?.seo_title || mockProduct.title,
  seo_description: mockProduct.seo_metadata?.seo_description || mockProduct.description,
});

const CommercePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"products" | "inventory" | "orders" | "messages">("products");
  const [products] = useState<Product[]>((mockProductsData as unknown as RawProduct[]).map(transformMockProduct));
  const [orders] = useState<Order[]>(ordersData as Order[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const lowStockProducts = products.filter(p => p.stock < 10);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const tabs = [
    { id: "products" as const, label: "Products", icon: Package },
    { id: "inventory" as const, label: "Inventory", icon: Package },
    { id: "orders" as const, label: "Orders", icon: ShoppingCart },
    { id: "messages" as const, label: "Messages", icon: MessageSquare },
  ];

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (searchQuery && !order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: Order["status"]) => {
    const config = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      processing: { label: "Processing", className: "bg-blue-100 text-blue-800" },
      shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800" },
      delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
    };
    const { label, className } = config[status];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{label}</span>;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Commerce</h1>
          <p className="text-sm text-netflix-light-gray mt-1">
            Your commerce command center — everything you sell and fulfill
          </p>
        </div>
        {activeTab === "products" && (
          <Button
            onClick={() => navigate("/vendor/commerce/products/add")}
            className="bg-netflix-red hover:bg-[#c11119] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-netflix-medium-gray">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-netflix-red text-netflix-red"
                    : "border-transparent text-netflix-light-gray hover:text-white hover:border-netflix-medium-gray"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
                {tab.id === "inventory" && lowStockProducts.length > 0 && (
                  <span className="bg-netflix-red text-white text-xs px-2 py-0.5 rounded-full">
                    {lowStockProducts.length}
                  </span>
                )}
                {tab.id === "orders" && orders.filter(o => o.status === "pending").length > 0 && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {orders.filter(o => o.status === "pending").length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray justify-start"
              onClick={() => navigate("/vendor/commerce/products/add")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button
              variant="outline"
              className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray justify-start"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button
              variant="outline"
              className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray justify-start"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Products Table */}
          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray overflow-hidden">
            <div className="p-4 border-b border-netflix-medium-gray flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-netflix-light-gray" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-netflix-light-gray" />
                <select className="px-3 py-2 bg-netflix-medium-gray border border-netflix-medium-gray rounded-md text-white text-sm">
                  <option>All Categories</option>
                  <option>Published</option>
                  <option>Draft</option>
                </select>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-netflix-medium-gray">
                  <TableHead className="text-white w-[80px]">Image</TableHead>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">SKU</TableHead>
                  <TableHead className="text-white">Price</TableHead>
                  <TableHead className="text-white">Stock</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.slice(0, 10).map((product) => (
                  <TableRow key={product.id} className="border-netflix-medium-gray">
                    <TableCell>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-white">{product.name}</TableCell>
                    <TableCell className="text-netflix-light-gray">{product.id}</TableCell>
                    <TableCell className="text-white">KES {product.price.toLocaleString()}</TableCell>
                    <TableCell className={product.stock < 10 ? "text-yellow-400" : "text-white"}>
                      {product.stock}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-500 text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {/* Alerts */}
          {outOfStockProducts.length > 0 && (
            <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="font-semibold text-red-300">Out of Stock ({outOfStockProducts.length})</h3>
              </div>
              <p className="text-sm text-red-200">
                These products are currently out of stock and disabled from your storefront.
              </p>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="bg-yellow-900/30 border border-yellow-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <h3 className="font-semibold text-yellow-300">Low Stock Alert ({lowStockProducts.length})</h3>
              </div>
              <p className="text-sm text-yellow-200">
                Consider restocking these products soon.
              </p>
            </div>
          )}

          {/* Inventory Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
              <div className="text-sm text-netflix-light-gray mb-1">Total Products</div>
              <div className="text-2xl font-bold text-white">{products.length}</div>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
              <div className="text-sm text-netflix-light-gray mb-1">In Stock</div>
              <div className="text-2xl font-bold text-green-400">{products.filter(p => p.stock > 0).length}</div>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
              <div className="text-sm text-netflix-light-gray mb-1">Total Stock Value</div>
              <div className="text-2xl font-bold text-white">
                KES {products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-netflix-medium-gray">
                  <TableHead className="text-white">Product</TableHead>
                  <TableHead className="text-white">SKU</TableHead>
                  <TableHead className="text-white">Current Stock</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="border-netflix-medium-gray">
                    <TableCell className="font-medium text-white">{product.name}</TableCell>
                    <TableCell className="text-netflix-light-gray">{product.id}</TableCell>
                    <TableCell className={product.stock === 0 ? "text-red-400" : product.stock < 10 ? "text-yellow-400" : "text-white"}>
                      {product.stock} units
                    </TableCell>
                    <TableCell>
                      {product.stock === 0 ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      ) : product.stock < 10 ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                        Restock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-netflix-light-gray" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-netflix-dark-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-netflix-medium-gray rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red bg-netflix-dark-gray text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-netflix-medium-gray">
                  <TableHead className="text-white">Order ID</TableHead>
                  <TableHead className="text-white">Customer</TableHead>
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Items</TableHead>
                  <TableHead className="text-white">Amount</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.order_id} className="border-netflix-medium-gray">
                    <TableCell className="font-medium text-white">{order.order_id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-white">{order.customer_name}</div>
                      <div className="text-sm text-netflix-light-gray">{order.customer_email}</div>
                    </TableCell>
                    <TableCell className="text-white">{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-white">{order.items.length} item(s)</TableCell>
                    <TableCell className="font-semibold text-white">
                      KES {order.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === "pending" && (
                          <Button size="sm" className="bg-netflix-red hover:bg-[#c11119] text-white">
                            <Truck className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="space-y-6">
          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Customer Messages</h2>
              <Button variant="outline" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                <MessageSquare className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
            <div className="space-y-3">
              {[
                { id: 1, customer: "John Doe", order: "ORD-001", message: "When will my order arrive?", time: "2 hours ago", unread: true },
                { id: 2, customer: "Jane Smith", order: "ORD-002", message: "Thank you for the quick delivery!", time: "1 day ago", unread: false },
              ].map((msg) => (
                <div key={msg.id} className={`p-4 rounded-lg border ${msg.unread ? "bg-netflix-medium-gray border-netflix-red" : "bg-netflix-dark-gray border-netflix-medium-gray"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{msg.customer}</span>
                        <span className="text-xs text-netflix-light-gray">Order: {msg.order}</span>
                        {msg.unread && <span className="bg-netflix-red text-white text-xs px-2 py-0.5 rounded-full">New</span>}
                      </div>
                      <p className="text-netflix-light-gray text-sm mb-2">{msg.message}</p>
                      <span className="text-xs text-netflix-light-gray">{msg.time}</span>
                    </div>
                    <Button variant="outline" size="sm" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                      Reply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Reply Templates */}
          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Reply Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Thank you for your order!",
                "Your order has been shipped.",
                "We'll process your refund shortly.",
                "Thanks for your feedback!",
              ].map((template, idx) => (
                <button
                  key={idx}
                  className="text-left p-3 bg-netflix-medium-gray hover:bg-netflix-red/20 rounded-lg text-white text-sm transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommercePage;
