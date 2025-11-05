import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Badge component is defined inline in this file
import { Search, Package, Eye, Truck } from "lucide-react";
import ordersData from "@/data/orders.json";

interface Order {
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  date: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
  shipping_address: string;
  tracking_number?: string;
  delivered_date?: string;
  cancellation_reason?: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>(ordersData as Order[]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.order_id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleMarkShipped = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleConfirmShipment = () => {
    if (selectedOrder && trackingNumber.trim()) {
      handleStatusChange(selectedOrder.order_id, "shipped");
      setOrders(
        orders.map((order) =>
          order.order_id === selectedOrder.order_id
            ? { ...order, tracking_number: trackingNumber, status: "shipped" as const }
            : order
        )
      );
      setIsDialogOpen(false);
      setTrackingNumber("");
      setSelectedOrder(null);
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      processing: { label: "Processing", className: "bg-blue-100 text-blue-800" },
      shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800" },
      delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <div className="text-sm text-netflix-light-gray">
          Manage and track your orders
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-netflix-light-gray" />
          <Input
            placeholder="Search by order ID, customer name, or email..."
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
          <option value="all">All Status ({statusCounts.all})</option>
          <option value="pending">Pending ({statusCounts.pending})</option>
          <option value="processing">Processing ({statusCounts.processing})</option>
          <option value="shipped">Shipped ({statusCounts.shipped})</option>
          <option value="delivered">Delivered ({statusCounts.delivered})</option>
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
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-netflix-light-gray">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.order_id} className="border-netflix-medium-gray">
                  <TableCell className="font-medium text-white">{order.order_id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{order.customer_name}</div>
                      <div className="text-sm text-netflix-light-gray">{order.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-netflix-light-gray" />
                      <span className="text-white">{order.items.length} item(s)</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-white">
                    KES {order.total_amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDialogOpen(true);
                        }}
                        className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {order.status === "pending" || order.status === "processing" ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleMarkShipped(order)}
                          className="bg-netflix-red hover:bg-[#c11119] text-white"
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Ship
                        </Button>
                      ) : null}
                      {order.status === "processing" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusChange(order.order_id, "shipped")}
                          className="bg-netflix-red hover:bg-[#c11119] text-white"
                        >
                          Mark Shipped
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_id}</DialogTitle>
            <DialogDescription>
              View and manage order information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span> {selectedOrder.customer_name}
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span> {selectedOrder.customer_email}
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span> {selectedOrder.customer_phone}
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span> {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <p className="text-sm">{selectedOrder.shipping_address}</p>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-gray-600">
                          Qty: {item.quantity} × KES {item.unit_price.toLocaleString()}
                        </div>
                      </div>
                      <div className="font-semibold">
                        KES {(item.quantity * item.unit_price).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-xl font-bold">KES {selectedOrder.total_amount.toLocaleString()}</span>
              </div>

              {/* Tracking Number */}
              {selectedOrder.tracking_number && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-semibold text-blue-900">Tracking Number:</div>
                  <div className="text-blue-700">{selectedOrder.tracking_number}</div>
                </div>
              )}

              {/* Ship Order Form */}
              {(selectedOrder.status === "pending" || selectedOrder.status === "processing") && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="tracking">Tracking Number</Label>
                    <Input
                      id="tracking"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleConfirmShipment}
                    disabled={!trackingNumber.trim()}
                    className="w-full"
                  >
                    Mark as Shipped
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
