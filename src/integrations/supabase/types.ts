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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      batches: {
        Row: {
          age_hours: number | null
          brix: number | null
          cabinet_temp_c: number | null
          created_at: string | null
          draw_temp_c: number | null
          hardness_score: number | null
          id: string
          machine: string | null
          meltdown_min: number | null
          notes: string | null
          overrun_pct: number | null
          panel_score: number | null
          ph: number | null
          recipe_id: string | null
          scoop_temp_c: number | null
        }
        Insert: {
          age_hours?: number | null
          brix?: number | null
          cabinet_temp_c?: number | null
          created_at?: string | null
          draw_temp_c?: number | null
          hardness_score?: number | null
          id?: string
          machine?: string | null
          meltdown_min?: number | null
          notes?: string | null
          overrun_pct?: number | null
          panel_score?: number | null
          ph?: number | null
          recipe_id?: string | null
          scoop_temp_c?: number | null
        }
        Update: {
          age_hours?: number | null
          brix?: number | null
          cabinet_temp_c?: number | null
          created_at?: string | null
          draw_temp_c?: number | null
          hardness_score?: number | null
          id?: string
          machine?: string | null
          meltdown_min?: number | null
          notes?: string | null
          overrun_pct?: number | null
          panel_score?: number | null
          ph?: number | null
          recipe_id?: string | null
          scoop_temp_c?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_access_log: {
        Row: {
          accessed_at: string | null
          action: string | null
          id: string
          ingredient_id: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          action?: string | null
          id?: string
          ingredient_id?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          action?: string | null
          id?: string
          ingredient_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_access_log_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_access_log_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          category: string
          cost_per_kg: number | null
          created_at: string | null
          fat_pct: number | null
          id: string
          msnf_pct: number | null
          name: string
          notes: string | null
          other_solids_pct: number | null
          pac_coeff: number | null
          sp_coeff: number | null
          sugar_split: Json | null
          sugars_pct: number | null
          tags: string[] | null
          updated_at: string | null
          water_pct: number | null
        }
        Insert: {
          category: string
          cost_per_kg?: number | null
          created_at?: string | null
          fat_pct?: number | null
          id?: string
          msnf_pct?: number | null
          name: string
          notes?: string | null
          other_solids_pct?: number | null
          pac_coeff?: number | null
          sp_coeff?: number | null
          sugar_split?: Json | null
          sugars_pct?: number | null
          tags?: string[] | null
          updated_at?: string | null
          water_pct?: number | null
        }
        Update: {
          category?: string
          cost_per_kg?: number | null
          created_at?: string | null
          fat_pct?: number | null
          id?: string
          msnf_pct?: number | null
          name?: string
          notes?: string | null
          other_solids_pct?: number | null
          pac_coeff?: number | null
          sp_coeff?: number | null
          sugar_split?: Json | null
          sugars_pct?: number | null
          tags?: string[] | null
          updated_at?: string | null
          water_pct?: number | null
        }
        Relationships: []
      }
      pairing_feedback: {
        Row: {
          a_id: string | null
          b_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          rating: number | null
        }
        Insert: {
          a_id?: string | null
          b_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
        }
        Update: {
          a_id?: string | null
          b_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pairing_feedback_a_id_fkey"
            columns: ["a_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pairing_feedback_a_id_fkey"
            columns: ["a_id"]
            isOneToOne: false
            referencedRelation: "ingredients_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pairing_feedback_b_id_fkey"
            columns: ["b_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pairing_feedback_b_id_fkey"
            columns: ["b_id"]
            isOneToOne: false
            referencedRelation: "ingredients_public"
            referencedColumns: ["id"]
          },
        ]
      }
      pastes: {
        Row: {
          category: string
          comp_cached: Json | null
          components_json: Json
          cost_per_kg: number | null
          created_at: string | null
          id: string
          lab_json: Json | null
          name: string
          preservation_json: Json | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          comp_cached?: Json | null
          components_json: Json
          cost_per_kg?: number | null
          created_at?: string | null
          id?: string
          lab_json?: Json | null
          name: string
          preservation_json?: Json | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          comp_cached?: Json | null
          components_json?: Json
          cost_per_kg?: number | null
          created_at?: string | null
          id?: string
          lab_json?: Json | null
          name?: string
          preservation_json?: Json | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          created_at: string | null
          id: string
          metrics: Json | null
          name: string
          product_type: string | null
          profile_id: string | null
          profile_version: string | null
          rows_json: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metrics?: Json | null
          name: string
          product_type?: string | null
          profile_id?: string | null
          profile_version?: string | null
          rows_json: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          product_type?: string | null
          profile_id?: string | null
          profile_version?: string | null
          rows_json?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      ingredients_public: {
        Row: {
          category: string | null
          fat_pct: number | null
          id: string | null
          msnf_pct: number | null
          name: string | null
          notes: string | null
          other_solids_pct: number | null
          pac_coeff: number | null
          sp_coeff: number | null
          sugar_split: Json | null
          sugars_pct: number | null
          tags: string[] | null
          water_pct: number | null
        }
        Insert: {
          category?: string | null
          fat_pct?: number | null
          id?: string | null
          msnf_pct?: number | null
          name?: string | null
          notes?: string | null
          other_solids_pct?: number | null
          pac_coeff?: number | null
          sp_coeff?: number | null
          sugar_split?: Json | null
          sugars_pct?: number | null
          tags?: string[] | null
          water_pct?: number | null
        }
        Update: {
          category?: string | null
          fat_pct?: number | null
          id?: string | null
          msnf_pct?: number | null
          name?: string | null
          notes?: string | null
          other_solids_pct?: number | null
          pac_coeff?: number | null
          sp_coeff?: number | null
          sugar_split?: Json | null
          sugars_pct?: number | null
          tags?: string[] | null
          water_pct?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
