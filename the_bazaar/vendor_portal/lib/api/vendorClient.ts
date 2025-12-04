/**
 * Vendor API Client
 * 
 * Typed API functions for vendor operations
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface VendorRegisterData {
  business_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface VendorRegisterResponse {
  vendor: {
    vendor_id: string;
    business_name: string;
    email: string;
    phone: string;
    created_at: string;
  };
  token: string;
}

export interface KYCStatusResponse {
  status: "unverified" | "in_review" | "verified" | "rejected";
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthly_kes: number;
  annual_discount_pct: number;
  sku_limit: number | "unlimited";
  features: string[];
}

export interface SubscriptionIntentResponse {
  intent_id: string;
  payment_url?: string;
  mpesa_checkout_request_id?: string;
}

export interface SubscriptionResponse {
  subscription: {
    id: string;
    plan_id: string;
    plan_name: string;
    status: "inactive" | "active" | "expired" | "cancelled" | "grace_period";
    billing_cycle: "monthly" | "annual";
    current_period_end: string;
    next_billing_date: string;
    auto_renew: boolean;
    sku_limit: number | "unlimited";
  };
}

export const vendorClient = {
  /**
   * Register a new vendor
   */
  register: async (data: VendorRegisterData): Promise<VendorRegisterResponse> => {
    const response = await apiClient.post<VendorRegisterResponse>("/vendor/register", data);
    return response.data;
  },

  /**
   * Upload KYC documents
   */
  uploadKYC: async (vendorId: string, documents: FormData): Promise<void> => {
    await apiClient.post(`/vendor/kyc/upload?vendor_id=${vendorId}`, documents, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Get KYC status
   */
  getKYCStatus: async (vendorId: string): Promise<KYCStatusResponse> => {
    const response = await apiClient.get<KYCStatusResponse>(`/vendor/kyc/status?vendor_id=${vendorId}`);
    return response.data;
  },

  /**
   * List subscription plans
   */
  listPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get<SubscriptionPlan[]>("/vendor/subscriptions/plans");
    return response.data;
  },

  /**
   * Create subscription payment intent
   */
  createSubscriptionIntent: async (data: {
    vendor_id: string;
    plan_id: string;
    billing_cycle: "monthly" | "annual";
  }): Promise<SubscriptionIntentResponse> => {
    const response = await apiClient.post<SubscriptionIntentResponse>(
      "/vendor/subscriptions/intent",
      data
    );
    return response.data;
  },

  /**
   * Confirm subscription payment
   */
  confirmSubscription: async (data: {
    vendor_id: string;
    payment_ref: string;
  }): Promise<SubscriptionResponse> => {
    const response = await apiClient.post<SubscriptionResponse>(
      "/vendor/subscriptions/confirm",
      data
    );
    return response.data;
  },

  /**
   * Get current subscription
   */
  getSubscription: async (vendorId: string): Promise<SubscriptionResponse> => {
    const response = await apiClient.get<SubscriptionResponse>(
      `/vendor/subscriptions?vendor_id=${vendorId}`
    );
    return response.data;
  },
};
