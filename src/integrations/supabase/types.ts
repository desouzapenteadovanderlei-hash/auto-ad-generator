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
      alert_preferences: {
        Row: {
          canal_email: boolean
          created_at: string
          notif_oferta_semana: boolean
          notif_promocao: boolean
          notif_queda_preco: boolean
          notif_ultima_unidade: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          canal_email?: boolean
          created_at?: string
          notif_oferta_semana?: boolean
          notif_promocao?: boolean
          notif_queda_preco?: boolean
          notif_ultima_unidade?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          canal_email?: boolean
          created_at?: string
          notif_oferta_semana?: boolean
          notif_promocao?: boolean
          notif_queda_preco?: boolean
          notif_ultima_unidade?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      financing_leads: {
        Row: {
          created_at: string
          down_payment: number
          email: string
          id: string
          interest_rate: number
          monthly_payment: number
          name: string
          notes: string | null
          phone: string
          term_months: number
          total_amount: number
          total_interest: number
          vehicle: string | null
          vehicle_price: number
        }
        Insert: {
          created_at?: string
          down_payment: number
          email: string
          id?: string
          interest_rate: number
          monthly_payment: number
          name: string
          notes?: string | null
          phone: string
          term_months: number
          total_amount: number
          total_interest: number
          vehicle?: string | null
          vehicle_price: number
        }
        Update: {
          created_at?: string
          down_payment?: number
          email?: string
          id?: string
          interest_rate?: number
          monthly_payment?: number
          name?: string
          notes?: string | null
          phone?: string
          term_months?: number
          total_amount?: number
          total_interest?: number
          vehicle?: string | null
          vehicle_price?: number
        }
        Relationships: []
      }
      offer_notifications: {
        Row: {
          created_at: string
          enviada_email: boolean
          id: string
          lida: boolean
          mensagem: string
          preco_antigo: number | null
          preco_novo: number | null
          tipo: Database["public"]["Enums"]["offer_type"]
          titulo: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          enviada_email?: boolean
          id?: string
          lida?: boolean
          mensagem: string
          preco_antigo?: number | null
          preco_novo?: number | null
          tipo: Database["public"]["Enums"]["offer_type"]
          titulo: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          enviada_email?: boolean
          id?: string
          lida?: boolean
          mensagem?: string
          preco_antigo?: number | null
          preco_novo?: number | null
          tipo?: Database["public"]["Enums"]["offer_type"]
          titulo?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_notifications_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_price_history: {
        Row: {
          changed_at: string
          id: string
          preco_antigo: number
          preco_novo: number
          vehicle_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          preco_antigo: number
          preco_novo: number
          vehicle_id: string
        }
        Update: {
          changed_at?: string
          id?: string
          preco_antigo?: number
          preco_novo?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_price_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          ano: number
          cambio: string | null
          combustivel: string | null
          cor: string | null
          created_at: string
          descricao: string | null
          fotos: string[]
          id: string
          km: number
          marca: string
          modelo: string
          oferta_semana: boolean
          preco: number
          preco_anterior: number | null
          promocao: boolean
          status: Database["public"]["Enums"]["vehicle_status"]
          ultima_unidade: boolean
          updated_at: string
        }
        Insert: {
          ano: number
          cambio?: string | null
          combustivel?: string | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          fotos?: string[]
          id?: string
          km?: number
          marca: string
          modelo: string
          oferta_semana?: boolean
          preco: number
          preco_anterior?: number | null
          promocao?: boolean
          status?: Database["public"]["Enums"]["vehicle_status"]
          ultima_unidade?: boolean
          updated_at?: string
        }
        Update: {
          ano?: number
          cambio?: string | null
          combustivel?: string | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          fotos?: string[]
          id?: string
          km?: number
          marca?: string
          modelo?: string
          oferta_semana?: boolean
          preco?: number
          preco_anterior?: number | null
          promocao?: boolean
          status?: Database["public"]["Enums"]["vehicle_status"]
          ultima_unidade?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      offer_type:
        | "queda_preco"
        | "promocao"
        | "oferta_semana"
        | "ultima_unidade"
      vehicle_status: "disponivel" | "reservado" | "vendido"
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
      app_role: ["admin", "user"],
      offer_type: [
        "queda_preco",
        "promocao",
        "oferta_semana",
        "ultima_unidade",
      ],
      vehicle_status: ["disponivel", "reservado", "vendido"],
    },
  },
} as const
