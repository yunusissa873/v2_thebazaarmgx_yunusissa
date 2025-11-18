import { supabase } from './client';

export interface Payment {
  id: string;
  order_id?: string | null;
  subscription_id?: string | null;
  payment_type: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_method: 'paystack' | 'flutterwave' | 'mpesa' | 'paypal' | 'stripe';
  provider_transaction_id?: string | null;
  provider_response?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  paid_at?: string | null;
  refunded_at?: string | null;
  refund_amount?: number | null;
  refund_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  order_id: string;
  amount: number;
  currency?: string;
  payment_method: 'paystack' | 'flutterwave' | 'mpesa' | 'paypal' | 'stripe';
  customer_phone?: string; // Required for M-Pesa
  metadata?: Record<string, any>;
}

/**
 * Create a payment record and initialize payment with provider
 */
export async function createPayment(
  data: CreatePaymentData
): Promise<{ data: Payment | null; error: any; redirect_url?: string }> {
  try {
    // Create payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: data.order_id,
        payment_type: 'order',
        amount: data.amount,
        currency: data.currency || 'KES',
        status: 'pending',
        payment_method: data.payment_method,
        metadata: data.metadata,
      })
      .select()
      .single();

    if (paymentError || !payment) {
      return { data: null, error: paymentError };
    }

    // Call Edge Function to initialize payment with provider
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data: initData, error: initError } = await supabase.functions.invoke('create-payment', {
      body: {
        payment_id: payment.id,
        order_id: data.order_id,
        amount: data.amount,
        currency: data.currency || 'KES',
        payment_method: data.payment_method,
        customer_phone: data.customer_phone,
        metadata: data.metadata,
      },
    });

    if (initError) {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id);

      return { data: null, error: initError };
    }

    // Update payment with provider transaction ID if provided
    if (initData?.transaction_id) {
      await supabase
        .from('payments')
        .update({
          provider_transaction_id: initData.transaction_id,
          provider_response: initData,
        })
        .eq('id', payment.id);
    }

    return {
      data: payment,
      error: null,
      redirect_url: initData?.redirect_url,
    };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get a payment by ID
 */
export async function getPayment(paymentId: string): Promise<{ data: Payment | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get payments for an order
 */
export async function getOrderPayments(orderId: string): Promise<{ data: Payment[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get user payments
 */
export async function getUserPayments(): Promise<{ data: Payment[] | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Get user's orders first
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('buyer_id', user.id);

    if (!orders || orders.length === 0) {
      return { data: [], error: null };
    }

    const orderIds = orders.map(o => o.id);

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .in('order_id', orderIds)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Verify payment status with provider
 */
export async function verifyPayment(paymentId: string): Promise<{ data: Payment | null; error: any }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
      body: { payment_id: paymentId },
    });

    if (verifyError) {
      return { data: null, error: verifyError };
    }

    // Update payment status
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: verifyData.status,
        provider_response: verifyData,
        paid_at: verifyData.status === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    return { data: payment, error: updateError };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Poll payment status (for M-Pesa and other async payments)
 */
export async function pollPaymentStatus(
  paymentId: string,
  maxAttempts: number = 30,
  interval: number = 2000
): Promise<{ data: Payment | null; error: any }> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const { data: payment, error } = await getPayment(paymentId);

    if (error) {
      return { data: null, error };
    }

    if (payment && (payment.status === 'completed' || payment.status === 'failed')) {
      return { data: payment, error: null };
    }

    attempts++;
    if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  return { data: null, error: { message: 'Payment verification timeout' } };
}

