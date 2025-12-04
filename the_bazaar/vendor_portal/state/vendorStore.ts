/**
 * Vendor Store - Zustand State Management
 * 
 * Manages vendor session, KYC status, subscription, and permissions
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type KYCStatus = "unverified" | "in_review" | "verified" | "rejected";
export type SubscriptionStatus = "inactive" | "active" | "expired" | "cancelled" | "grace_period";

export interface VendorSession {
  vendor_id: string;
  business_name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  plan_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  billing_cycle: "monthly" | "annual";
  current_period_end: string;
  next_billing_date: string;
  auto_renew: boolean;
  sku_limit: number | "unlimited";
}

export interface VendorState {
  // Session
  vendorSession: VendorSession | null;
  isAuthenticated: boolean;
  
  // KYC
  kycStatus: KYCStatus;
  kycSubmittedAt: string | null;
  
  // Subscription
  subscription: Subscription | null;
  
  // UI State
  activeOutlet: "profile" | "commerce" | "analytics" | "finance";
  permissions: string[];
  
  // Actions
  registerVendor: (data: {
    business_name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  
  submitKYC: (documents: FormData) => Promise<void>;
  fetchKYCStatus: () => Promise<void>;
  
  selectPlan: (planId: string, billingCycle: "monthly" | "annual") => void;
  createSubscriptionIntent: () => Promise<string>;
  confirmSubscription: (paymentRef: string) => Promise<void>;
  fetchSubscription: () => Promise<void>;
  
  setActiveOutlet: (outlet: "profile" | "commerce" | "analytics" | "finance") => void;
  logout: () => void;
}

export const useVendorStore = create<VendorState>()(
  persist(
    (set, get) => ({
      vendorSession: null,
      isAuthenticated: false,
      kycStatus: "unverified",
      kycSubmittedAt: null,
      subscription: null,
      activeOutlet: "profile",
      permissions: [],

      registerVendor: async (data) => {
        // Call API
        const response = await fetch("/api/vendor/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error("Registration failed");
        
        const result = await response.json();
        set({
          vendorSession: result.vendor,
          isAuthenticated: true,
        });
      },

      submitKYC: async (documents) => {
        const { vendorSession } = get();
        if (!vendorSession) throw new Error("Not authenticated");

        const response = await fetch("/api/vendor/kyc/upload", {
          method: "POST",
          body: documents,
        });

        if (!response.ok) throw new Error("KYC upload failed");

        set({
          kycStatus: "in_review",
          kycSubmittedAt: new Date().toISOString(),
        });
      },

      fetchKYCStatus: async () => {
        const { vendorSession } = get();
        if (!vendorSession) return;

        const response = await fetch(`/api/vendor/kyc/status?vendor_id=${vendorSession.vendor_id}`);
        if (!response.ok) return;

        const result = await response.json();
        set({ kycStatus: result.status });
      },

      selectPlan: (planId, billingCycle) => {
        set((state) => ({
          subscription: state.subscription
            ? { ...state.subscription, plan_id: planId, billing_cycle: billingCycle }
            : null,
        }));
      },

      createSubscriptionIntent: async () => {
        const { vendorSession, subscription } = get();
        if (!vendorSession || !subscription) throw new Error("Missing data");

        const response = await fetch("/api/vendor/subscriptions/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendor_id: vendorSession.vendor_id,
            plan_id: subscription.plan_id,
            billing_cycle: subscription.billing_cycle,
          }),
        });

        if (!response.ok) throw new Error("Intent creation failed");
        const result = await response.json();
        return result.intent_id;
      },

      confirmSubscription: async (paymentRef) => {
        const { vendorSession } = get();
        if (!vendorSession) throw new Error("Not authenticated");

        const response = await fetch("/api/vendor/subscriptions/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendor_id: vendorSession.vendor_id,
            payment_ref: paymentRef,
          }),
        });

        if (!response.ok) throw new Error("Subscription confirmation failed");

        const result = await response.json();
        set({ subscription: result.subscription });
      },

      fetchSubscription: async () => {
        const { vendorSession } = get();
        if (!vendorSession) return;

        const response = await fetch(`/api/vendor/subscriptions?vendor_id=${vendorSession.vendor_id}`);
        if (!response.ok) return;

        const result = await response.json();
        set({ subscription: result.subscription });
      },

      setActiveOutlet: (outlet) => {
        set({ activeOutlet: outlet });
      },

      logout: () => {
        set({
          vendorSession: null,
          isAuthenticated: false,
          kycStatus: "unverified",
          subscription: null,
        });
      },
    }),
    {
      name: "vendor-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : undefined)),
      partialize: (state) => ({
        vendorSession: state.vendorSession,
        isAuthenticated: state.isAuthenticated,
        kycStatus: state.kycStatus,
        subscription: state.subscription,
      }),
    }
  )
);
