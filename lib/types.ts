/**
 * Supabase Database type — used to type the Supabase client.
 * Detailed row types live in lib/types/database.ts.
 */

export type OrderStatus = 'pending' | 'processing' | 'delivered'
export type UserRole = 'customer' | 'admin'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: UserRole
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: UserRole
        }
        Update: {
          email?: string
          role?: UserRole
        }
        Relationships: []
      }
      carriers: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          description?: string | null
          sort_order?: number
        }
        Update: {
          name?: string
          slug?: string
          logo_url?: string | null
          description?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      plans: {
        Row: {
          id: string
          carrier_id: string
          name: string
          data_label: string
          validity_days: number
          price_cents: number
          currency: string
          features: string[] | null
          badge: string | null
          is_featured: boolean
          is_active: boolean
          archived_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          carrier_id: string
          name: string
          data_label: string
          validity_days: number
          price_cents: number
          currency?: string
          features?: string[] | null
          badge?: string | null
          is_featured?: boolean
          is_active?: boolean
          archived_at?: string | null
        }
        Update: {
          carrier_id?: string
          name?: string
          data_label?: string
          validity_days?: number
          price_cents?: number
          currency?: string
          features?: string[] | null
          badge?: string | null
          is_featured?: boolean
          is_active?: boolean
          archived_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'plans_carrier_id_fkey'
            columns: ['carrier_id']
            isOneToOne: false
            referencedRelation: 'carriers'
            referencedColumns: ['id']
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: OrderStatus
          full_name: string
          email: string
          phone_model: string
          state: string
          zip_code: string
          imei: string
          payment_reference: string | null
          payment_receipt_path: string | null
          imei_screenshot_path: string | null
          delivery_proof_path: string | null
          admin_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: OrderStatus
          full_name: string
          email: string
          phone_model: string
          state: string
          zip_code: string
          imei: string
          payment_reference?: string | null
          payment_receipt_path?: string | null
          imei_screenshot_path?: string | null
          delivery_proof_path?: string | null
          admin_note?: string | null
        }
        Update: {
          status?: OrderStatus
          payment_reference?: string | null
          payment_receipt_path?: string | null
          imei_screenshot_path?: string | null
          delivery_proof_path?: string | null
          admin_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
