export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          email: string
          gstin: string | null
          id: string
          name: string
          organization_id: string
          pan: string | null
          phone: string | null
          progress: number
          state_code: string | null
          status: string
          technologies: string[]
          user_id: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          email: string
          gstin?: string | null
          id?: string
          name: string
          organization_id?: string
          pan?: string | null
          phone?: string | null
          progress?: number
          state_code?: string | null
          status?: string
          technologies?: string[]
          user_id?: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string
          gstin?: string | null
          id?: string
          name?: string
          organization_id?: string
          pan?: string | null
          phone?: string | null
          progress?: number
          state_code?: string | null
          status?: string
          technologies?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          active_clients: number
          communication: number
          created_at: string
          email: string | null
          experience: string | null
          feedback: Json
          hourly_rate: number | null
          id: string
          initials: string | null
          knowledge_score: number
          languages: string | null
          level: string | null
          monthly_earnings: number
          name: string
          on_time_rate: number
          organization_id: string
          phone: string | null
          rating: number
          response_time: string | null
          salary: number
          schedule: string | null
          skills: string[]
          status: string
          user_id: string
          utilization: number
        }
        Insert: {
          active_clients?: number
          communication?: number
          created_at?: string
          email?: string | null
          experience?: string | null
          feedback?: Json
          hourly_rate?: number | null
          id?: string
          initials?: string | null
          knowledge_score?: number
          languages?: string | null
          level?: string | null
          monthly_earnings?: number
          name: string
          on_time_rate?: number
          organization_id?: string
          phone?: string | null
          rating?: number
          response_time?: string | null
          salary?: number
          schedule?: string | null
          skills?: string[]
          status?: string
          user_id?: string
          utilization?: number
        }
        Update: {
          active_clients?: number
          communication?: number
          created_at?: string
          email?: string | null
          experience?: string | null
          feedback?: Json
          hourly_rate?: number | null
          id?: string
          initials?: string | null
          knowledge_score?: number
          languages?: string | null
          level?: string | null
          monthly_earnings?: number
          name?: string
          on_time_rate?: number
          organization_id?: string
          phone?: string | null
          rating?: number
          response_time?: string | null
          salary?: number
          schedule?: string | null
          skills?: string[]
          status?: string
          user_id?: string
          utilization?: number
        }
        Relationships: [
          {
            foreignKeyName: "developers_org_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          asset_tag: string | null
          category: string
          created_at: string
          date: string | null
          description: string | null
          gst_amount: number
          hsn: string | null
          id: string
          is_asset: boolean
          itc_eligible: boolean
          organization_id: string
          payment_method: string | null
          reverse_charge: boolean
          tds_deducted: number | null
          total: number
          user_id: string
          vendor: string | null
          vendor_gstin: string | null
          vendor_pan: string | null
        }
        Insert: {
          amount?: number
          asset_tag?: string | null
          category?: string
          created_at?: string
          date?: string | null
          description?: string | null
          gst_amount?: number
          hsn?: string | null
          id?: string
          is_asset?: boolean
          itc_eligible?: boolean
          organization_id?: string
          payment_method?: string | null
          reverse_charge?: boolean
          tds_deducted?: number | null
          total?: number
          user_id?: string
          vendor?: string | null
          vendor_gstin?: string | null
          vendor_pan?: string | null
        }
        Update: {
          amount?: number
          asset_tag?: string | null
          category?: string
          created_at?: string
          date?: string | null
          description?: string | null
          gst_amount?: number
          hsn?: string | null
          id?: string
          is_asset?: boolean
          itc_eligible?: boolean
          organization_id?: string
          payment_method?: string | null
          reverse_charge?: boolean
          tds_deducted?: number | null
          total?: number
          user_id?: string
          vendor?: string | null
          vendor_gstin?: string | null
          vendor_pan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_org_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string
          description: string
          hsn: string | null
          id: string
          invoice_id: string
          organization_id: string
          quantity: number
          rate: number
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          hsn?: string | null
          id?: string
          invoice_id: string
          organization_id?: string
          quantity?: number
          rate?: number
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string
          hsn?: string | null
          id?: string
          invoice_id?: string
          organization_id?: string
          quantity?: number
          rate?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_org_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          cgst: number
          client_id: string | null
          created_at: string
          due_date: string | null
          gst_amount: number
          id: string
          igst: number
          interstate: boolean
          issue_date: string | null
          notes: string | null
          number: string
          organization_id: string
          paid_date: string | null
          place_of_supply: string | null
          po_number: string | null
          project_id: string | null
          reverse_charge: boolean
          round_off: number | null
          sgst: number
          status: string
          subtotal: number
          tax_rate: number
          tds_deducted: number | null
          total: number
          user_id: string
        }
        Insert: {
          cgst?: number
          client_id?: string | null
          created_at?: string
          due_date?: string | null
          gst_amount?: number
          id?: string
          igst?: number
          interstate?: boolean
          issue_date?: string | null
          notes?: string | null
          number: string
          organization_id?: string
          paid_date?: string | null
          place_of_supply?: string | null
          po_number?: string | null
          project_id?: string | null
          reverse_charge?: boolean
          round_off?: number | null
          sgst?: number
          status?: string
          subtotal?: number
          tax_rate?: number
          tds_deducted?: number | null
          total?: number
          user_id?: string
        }
        Update: {
          cgst?: number
          client_id?: string | null
          created_at?: string
          due_date?: string | null
          gst_amount?: number
          id?: string
          igst?: number
          interstate?: boolean
          issue_date?: string | null
          notes?: string | null
          number?: string
          organization_id?: string
          paid_date?: string | null
          place_of_supply?: string | null
          po_number?: string | null
          project_id?: string | null
          reverse_charge?: boolean
          round_off?: number | null
          sgst?: number
          status?: string
          subtotal?: number
          tax_rate?: number
          tds_deducted?: number | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_org_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: string | null
          client: string | null
          client_id: string | null
          created_at: string
          date: string | null
          developer: string | null
          developer_id: string | null
          duration: number
          id: string
          organization_id: string
          priority: string
          project_id: string | null
          status: string
          technology: string | null
          time: string | null
          title: string
          user_id: string
          zoom: boolean
        }
        Insert: {
          agenda?: string | null
          client?: string | null
          client_id?: string | null
          created_at?: string
          date?: string | null
          developer?: string | null
          developer_id?: string | null
          duration?: number
          id?: string
          organization_id?: string
          priority?: string
          project_id?: string | null
          status?: string
          technology?: string | null
          time?: string | null
          title: string
          user_id?: string
          zoom?: boolean
        }
        Update: {
          agenda?: string | null
          client?: string | null
          client_id?: string | null
          created_at?: string
          date?: string | null
          developer?: string | null
          developer_id?: string | null
          duration?: number
          id?: string
          organization_id?: string
          priority?: string
          project_id?: string | null
          status?: string
          technology?: string | null
          time?: string | null
          title?: string
          user_id?: string
          zoom?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_org_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string | null
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          base: number
          client: string | null
          company: string | null
          created_at: string
          developer: string | null
          due: string | null
          gst: number
          id: string
          initials: string | null
          invoice: string | null
          method: string | null
          organization_id: string
          overdue_days: number | null
          sessions: number
          status: string
          technology: string | null
          total: number
          user_id: string
        }
        Insert: {
          base?: number
          client?: string | null
          company?: string | null
          created_at?: string
          developer?: string | null
          due?: string | null
          gst?: number
          id?: string
          initials?: string | null
          invoice?: string | null
          method?: string | null
          organization_id?: string
          overdue_days?: number | null
          sessions?: number
          status?: string
          technology?: string | null
          total?: number
          user_id?: string
        }
        Update: {
          base?: number
          client?: string | null
          company?: string | null
          created_at?: string
          developer?: string | null
          due?: string | null
          gst?: number
          id?: string
          initials?: string | null
          invoice?: string | null
          method?: string | null
          organization_id?: string
          overdue_days?: number | null
          sessions?: number
          status?: string
          technology?: string | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_org_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          initials: string | null
          name: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          initials?: string | null
          name?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          initials?: string | null
          name?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          assigned_developer_id: string | null
          client_id: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          organization_id: string
          satisfaction_rating: number
          start_date: string | null
          status: string
          technology: string | null
          user_id: string
        }
        Insert: {
          assigned_developer_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          organization_id?: string
          satisfaction_rating?: number
          start_date?: string | null
          status?: string
          technology?: string | null
          user_id?: string
        }
        Update: {
          assigned_developer_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          satisfaction_rating?: number
          start_date?: string | null
          status?: string
          technology?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_assigned_developer_id_fkey"
            columns: ["assigned_developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_org_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          amount: number
          created_at: string
          date: string | null
          id: string
          invoice_id: string | null
          mode: string | null
          notes: string | null
          organization_id: string
          reference: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string | null
          id?: string
          invoice_id?: string | null
          mode?: string | null
          notes?: string | null
          organization_id?: string
          reference?: string | null
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string | null
          id?: string
          invoice_id?: string | null
          mode?: string | null
          notes?: string | null
          organization_id?: string
          reference?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_org_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_settings: {
        Row: {
          cgst_rate: number
          company: Json
          created_at: string
          gst_rate: number
          id: string
          igst_rate: number
          organization_id: string
          sgst_rate: number
          tds_rate: number
          user_id: string
        }
        Insert: {
          cgst_rate?: number
          company?: Json
          created_at?: string
          gst_rate?: number
          id?: string
          igst_rate?: number
          organization_id?: string
          sgst_rate?: number
          tds_rate?: number
          user_id?: string
        }
        Update: {
          cgst_rate?: number
          company?: Json
          created_at?: string
          gst_rate?: number
          id?: string
          igst_rate?: number
          organization_id?: string
          sgst_rate?: number
          tds_rate?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_settings_org_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_pending_invitations: { Args: never; Returns: undefined }
      current_org_id: { Args: never; Returns: string }
      is_active_member: { Args: { _org: string }; Returns: boolean }
      is_org_manager: { Args: { _org: string }; Returns: boolean }
      is_org_owner: { Args: { _org: string }; Returns: boolean }
      shares_my_org: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "admin" | "ca"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "ca"],
    },
  },
} as const
