import { supabase } from './client';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  product_name: string;
  variant_name?: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  vendor_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  currency: string;
  shipping_address: Record<string, any>;
  billing_address?: Record<string, any> | null;
  notes?: string | null;
  tracking_number?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CreateOrderData {
  cartItems: Array<{
    product_id: string;
    variant_id?: string | null;
    quantity: number;
    unit_price: number;
  }>;
  vendor_id: string;
  shipping_address: Record<string, any>;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount?: number;
  currency?: string;
  notes?: string;
}

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create a new order
 */
export async function createOrder(data: CreateOrderData): Promise<{ data: Order | null; error: any }> {
  try {
    const orderNumber = generateOrderNumber();
    const total = data.subtotal + data.tax + data.shipping_cost - (data.discount || 0);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        buyer_id: user.id,
        vendor_id: data.vendor_id,
        subtotal: data.subtotal,
        tax: data.tax,
        shipping_cost: data.shipping_cost,
        discount: data.discount || 0,
        total,
        currency: data.currency || 'KES',
        shipping_address: data.shipping_address,
        notes: data.notes,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      return { data: null, error: orderError };
    }

    // Get product details for order items
    const productIds = data.cartItems.map(item => item.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    const productMap = new Map(products?.map(p => [p.id, p.name]) || []);

    // Get variant details if any
    const variantIds = data.cartItems
      .map(item => item.variant_id)
      .filter((id): id is string => !!id);
    
    const variantMap = new Map<string, string>();
    if (variantIds.length > 0) {
      const { data: variants } = await supabase
        .from('product_variants')
        .select('id, name')
        .in('id', variantIds);
      
      variants?.forEach(v => variantMap.set(v.id, v.name));
    }

    // Create order items
    const orderItems = data.cartItems.map(item => {
      const productName = productMap.get(item.product_id) || 'Unknown Product';
      const variantName = item.variant_id ? variantMap.get(item.variant_id) : null;
      const itemSubtotal = item.unit_price * item.quantity;
      const itemTax = itemSubtotal * (data.tax / data.subtotal); // Proportional tax
      const itemTotal = itemSubtotal + itemTax;

      return {
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        product_name: productName,
        variant_name: variantName,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: itemSubtotal,
        tax: itemTax,
        total: itemTotal,
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id);
      return { data: null, error: itemsError };
    }

    // Fetch complete order with items
    const { data: completeOrder, error: fetchError } = await getOrder(order.id);

    return { data: completeOrder, error: fetchError };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get a single order by ID
 */
export async function getOrder(orderId: string): Promise<{ data: Order | null; error: any }> {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return { data: null, error: orderError };
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (itemsError) {
      return { data: null, error: itemsError };
    }

    return {
      data: {
        ...order,
        items: items || [],
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get all orders for the current user
 */
export async function getUserOrders(): Promise<{ data: Order[] | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      return { data: null, error: ordersError };
    }

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)
          .order('created_at', { ascending: true });

        return {
          ...order,
          items: items || [],
        };
      })
    );

    return { data: ordersWithItems, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<{ data: Order | null; error: any }> {
  try {
    const updateData: any = { status, updated_at: new Date().toISOString() };

    if (status === 'shipped') {
      updateData.shipped_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Add tracking number to order
 */
export async function addTrackingNumber(
  orderId: string,
  trackingNumber: string
): Promise<{ data: Order | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}


