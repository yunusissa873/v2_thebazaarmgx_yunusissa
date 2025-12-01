export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'buyer' | 'vendor' | 'admin'
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'buyer' | 'vendor' | 'admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'buyer' | 'vendor' | 'admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          profile_id: string
          business_name: string
          slug: string
          description: string | null
          logo_url: string | null
          banner_url: string | null
          business_type: string | null
          business_registration_number: string | null
          tax_id: string | null
          phone: string | null
          email: string | null
          website: string | null
          address: string | null
          city: string | null
          country: string
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          rating: number
          total_reviews: number
          is_verified: boolean
          is_mega_brand: boolean
          kyc_status: string
          kyc_documents: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          business_name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          business_type?: string | null
          business_registration_number?: string | null
          tax_id?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          country?: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          rating?: number
          total_reviews?: number
          is_verified?: boolean
          is_mega_brand?: boolean
          kyc_status?: string
          kyc_documents?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          business_name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          business_type?: string | null
          business_registration_number?: string | null
          tax_id?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          country?: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          rating?: number
          total_reviews?: number
          is_verified?: boolean
          is_mega_brand?: boolean
          kyc_status?: string
          kyc_documents?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed - this is a starter
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'buyer' | 'vendor' | 'admin'
      subscription_tier: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum'
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
      payment_method: 'paystack' | 'stripe' | 'mpesa' | 'card' | 'paypal'
      currency: 'KES' | 'USD'
      staff_role: 'manager' | 'staff' | 'viewer'
    }
  }
}