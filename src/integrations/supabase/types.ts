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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      artwork_prices: {
        Row: {
          artwork_id: string
          price: number | null
          updated_at: string
        }
        Insert: {
          artwork_id: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          artwork_id?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      artworks: {
        Row: {
          catalogue_only: boolean
          categories: string[]
          category: string
          genre: string | null
          height: number
          hidden: boolean
          id: string
          image_url: string
          interior_enabled: boolean | null
          medium_en: string
          medium_ru: string
          project_id: string | null
          size: string
          sort_order: number
          source: string
          source_availability: string | null
          style: string | null
          title_en: string
          title_ru: string
          updated_at: string
          width: number
          year: string
        }
        Insert: {
          catalogue_only?: boolean
          categories?: string[]
          category: string
          genre?: string | null
          height?: number
          hidden?: boolean
          id: string
          image_url: string
          interior_enabled?: boolean | null
          medium_en?: string
          medium_ru?: string
          project_id?: string | null
          size?: string
          sort_order?: number
          source?: string
          source_availability?: string | null
          style?: string | null
          title_en?: string
          title_ru: string
          updated_at?: string
          width?: number
          year?: string
        }
        Update: {
          catalogue_only?: boolean
          categories?: string[]
          category?: string
          genre?: string | null
          height?: number
          hidden?: boolean
          id?: string
          image_url?: string
          interior_enabled?: boolean | null
          medium_en?: string
          medium_ru?: string
          project_id?: string | null
          size?: string
          sort_order?: number
          source?: string
          source_availability?: string | null
          style?: string | null
          title_en?: string
          title_ru?: string
          updated_at?: string
          width?: number
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "artworks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          artwork_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          artwork_id: string
          created_at?: string
          user_id?: string
        }
        Update: {
          artwork_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          body_en: string
          body_ru: string
          created_at: string
          event_date: string
          id: string
          image_url: string
          kind: string
          published: boolean
          title_en: string
          title_ru: string
        }
        Insert: {
          body_en?: string
          body_ru?: string
          created_at?: string
          event_date?: string
          id?: string
          image_url?: string
          kind?: string
          published?: boolean
          title_en?: string
          title_ru: string
        }
        Update: {
          body_en?: string
          body_ru?: string
          created_at?: string
          event_date?: string
          id?: string
          image_url?: string
          kind?: string
          published?: boolean
          title_en?: string
          title_ru?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number | null
          artwork_id: string
          artwork_title: string
          comment: string
          company: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          method: string
          payment_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          artwork_id: string
          artwork_title: string
          comment?: string
          company?: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          method: string
          payment_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          artwork_id?: string
          artwork_title?: string
          comment?: string
          company?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          method?: string
          payment_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          device: string
          id: string
          path: string
          referrer: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          device?: string
          id?: string
          path: string
          referrer?: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          device?: string
          id?: string
          path?: string
          referrer?: string
          visitor_id?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          id: number
          updated_at: string
          yookassa_secret_key: string
          yookassa_shop_id: string
        }
        Insert: {
          id?: number
          updated_at?: string
          yookassa_secret_key?: string
          yookassa_shop_id?: string
        }
        Update: {
          id?: number
          updated_at?: string
          yookassa_secret_key?: string
          yookassa_shop_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          cover_artwork_id: string | null
          description_en: string
          description_ru: string
          id: string
          interior_enabled: boolean
          kind: string
          sort_order: number
          source: string
          title_en: string
          title_ru: string
          updated_at: string
          year: string
        }
        Insert: {
          cover_artwork_id?: string | null
          description_en?: string
          description_ru?: string
          id: string
          interior_enabled?: boolean
          kind?: string
          sort_order?: number
          source?: string
          title_en?: string
          title_ru: string
          updated_at?: string
          year?: string
        }
        Update: {
          cover_artwork_id?: string | null
          description_en?: string
          description_ru?: string
          id?: string
          interior_enabled?: boolean
          kind?: string
          sort_order?: number
          source?: string
          title_en?: string
          title_ru?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          collection_directions: Json
          collection_menu_position: string
          cv: Json | null
          genres: Json
          id: number
          online_payment_enabled: boolean
          show_prices: boolean
          show_style_filter: boolean
          styles: Json
          updated_at: string
        }
        Insert: {
          collection_directions?: Json
          collection_menu_position?: string
          cv?: Json | null
          genres?: Json
          id?: number
          online_payment_enabled?: boolean
          show_prices?: boolean
          show_style_filter?: boolean
          styles?: Json
          updated_at?: string
        }
        Update: {
          collection_directions?: Json
          collection_menu_position?: string
          cv?: Json | null
          genres?: Json
          id?: number
          online_payment_enabled?: boolean
          show_prices?: boolean
          show_style_filter?: boolean
          styles?: Json
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          lang: string
          subscribed: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          lang?: string
          subscribed?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          lang?: string
          subscribed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          last_sign_in_at: string
          roles: string[]
        }[]
      }
      admin_set_role: {
        Args: {
          _on: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reserved_artworks: { Args: never; Returns: string[] }
      set_my_subscription: { Args: { _on: boolean }; Returns: undefined }
      subscribe: {
        Args: { _email: string; _lang?: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
    },
  },
} as const
