export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      ranking_history: {
        Row: {
          id: string;
          player_id: string;
          snapshot_date: string;
          snapshot_at: string;
          points: number;
          penalty_points: number;
          matches: number;
          wins: number;
          blowout_wins: number;
          draws: number;
          losses: number;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          snapshot_date?: string;
          snapshot_at?: string;
          points: number;
          penalty_points: number;
          matches: number;
          wins: number;
          blowout_wins: number;
          draws: number;
          losses: number;
          position: number;
          created_at?: string;
        };
        Update: {
          points?: number;
          penalty_points?: number;
          matches?: number;
          wins?: number;
          blowout_wins?: number;
          draws?: number;
          losses?: number;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "ranking_history_player_id_fkey";
            columns: ["player_id"];
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };

      cash_entries: {
        Row: {
          amount: number;
          comment: string | null;
          created_at: string;
          date: string;
          id: string;
          movement_type: string;
          player_or_recipient: string | null;
          type: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          comment?: string | null;
          created_at?: string;
          date?: string;
          id?: string;
          movement_type: string;
          player_or_recipient?: string | null;
          type: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          comment?: string | null;
          created_at?: string;
          date?: string;
          id?: string;
          movement_type?: string;
          player_or_recipient?: string | null;
          type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          created_at: string;
          date: string;
          goals_team_a: number;
          goals_team_b: number;
          id: string;
          team_a: string[];
          team_b: string[];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          goals_team_a?: number;
          goals_team_b?: number;
          id?: string;
          team_a?: string[];
          team_b?: string[];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          goals_team_a?: number;
          goals_team_b?: number;
          id?: string;
          team_a?: string[];
          team_b?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      penalties: {
        Row: {
          created_at: string;
          date: string;
          id: string;
          player_id: string;
          reason: string;
          updated_at: string;
          value: number;
        };
        Insert: {
          created_at?: string;
          date?: string;
          id?: string;
          player_id: string;
          reason: string;
          updated_at?: string;
          value: number;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: string;
          player_id?: string;
          reason?: string;
          updated_at?: string;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "penalties_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      players: {
        Row: {
          active: boolean;
          created_at: string;
          deleted_at: string | null;
          id: string;
          membership_type: string;
          name: string;
          position: string;
          updated_at: string;
          numero_camisa: number | null;
          celular: string | null;
          data_nascimento: string | null;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          membership_type?: string;
          name: string;
          position?: string;
          updated_at?: string;
          numero_camisa?: number | null;
          celular?: string | null;
          data_nascimento?: string | null;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          membership_type?: string;
          name?: string;
          position?: string;
          updated_at?: string;
          numero_camisa?: number | null;
          celular?: string | null;
          data_nascimento?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      save_ranking_snapshot: {
        Args: {
          ranking_data: any;
        };
        Returns: void;
      };
    };
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const;
