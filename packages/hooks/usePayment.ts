import { useState } from 'react';
import { toast } from 'sonner';
import { createPayment, verifyPayment, pollPaymentStatus, type CreatePaymentData } from '@thebazaar/supabase/payments';

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);

  const initializePayment = async (data: CreatePaymentData) => {
    setIsProcessing(true);
    try {
      const { data: payment, error, redirect_url } = await createPayment(data);

      if (error) {
        toast.error(error.message || 'Failed to initialize payment');
        return { data: null, error };
      }

      if (redirect_url) {
        // Redirect to payment gateway
        window.location.href = redirect_url;
        return { data: payment, error: null, redirect_url };
      }

      // For M-Pesa, start polling
      if (data.payment_method === 'mpesa' && payment) {
        toast.info('Please complete the payment on your phone');
        return { data: payment, error: null };
      }

      return { data: payment, error: null };
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize payment');
      return { data: null, error };
    } finally {
      setIsProcessing(false);
    }
  };

  const verify = async (paymentId: string) => {
    setIsProcessing(true);
    try {
      const { data: payment, error } = await verifyPayment(paymentId);

      if (error) {
        toast.error(error.message || 'Failed to verify payment');
        return { data: null, error };
      }

      if (payment?.status === 'completed') {
        toast.success('Payment completed successfully');
      } else if (payment?.status === 'failed') {
        toast.error('Payment failed');
      }

      return { data: payment, error: null };
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify payment');
      return { data: null, error };
    } finally {
      setIsProcessing(false);
    }
  };

  const pollStatus = async (paymentId: string) => {
    setIsProcessing(true);
    try {
      const { data: payment, error } = await pollPaymentStatus(paymentId);

      if (error) {
        toast.error(error.message || 'Payment verification timeout');
        return { data: null, error };
      }

      if (payment?.status === 'completed') {
        toast.success('Payment completed successfully');
      } else if (payment?.status === 'failed') {
        toast.error('Payment failed');
      }

      return { data: payment, error: null };
    } catch (error: any) {
      toast.error(error.message || 'Failed to poll payment status');
      return { data: null, error };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    initializePayment,
    verify,
    pollStatus,
    isProcessing,
  };
}

