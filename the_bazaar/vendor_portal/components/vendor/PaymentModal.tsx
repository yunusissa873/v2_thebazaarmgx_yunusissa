/**
 * Payment Modal Component
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

"use client";

import { useState } from "react";
import { X, CreditCard, Smartphone } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  onSuccess: (paymentRef: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  currency,
  onSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "stripe">("mpesa");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      onSuccess(`mock_payment_${Date.now()}`);
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Complete Payment</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-2xl font-bold">
            {currency} {amount.toLocaleString()}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <div className="flex gap-4">
            <button
              onClick={() => setPaymentMethod("mpesa")}
              className={`flex-1 p-4 border-2 rounded-lg ${
                paymentMethod === "mpesa" ? "border-[#E50914]" : "border-gray-200"
              }`}
            >
              <Smartphone className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm">M-Pesa</span>
            </button>
            <button
              onClick={() => setPaymentMethod("stripe")}
              className={`flex-1 p-4 border-2 rounded-lg ${
                paymentMethod === "stripe" ? "border-[#E50914]" : "border-gray-200"
              }`}
            >
              <CreditCard className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm">Card</span>
            </button>
          </div>
        </div>

        {paymentMethod === "mpesa" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="+254 700 000 000"
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
        )}

        {paymentMethod === "stripe" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Card Number</label>
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-[#E50914] text-white py-2 px-4 rounded-md hover:bg-[#c11119] disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : `Pay ${currency} ${amount.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}
