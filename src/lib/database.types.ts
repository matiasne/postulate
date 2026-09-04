// Hand-maintained schema types. Keep in sync with supabase/migrations.

export type Stance = "favor" | "contra";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      positions: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          parent_id: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          parent_id?: string | null;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["positions"]["Insert"]>;
        Relationships: [];
      };
      candidacies: {
        Row: {
          id: string;
          position_id: string;
          user_id: string;
          photo_path: string | null;
          cv_path: string | null;
          cv_name: string | null;
          location_label: string | null;
          location_lat: number | null;
          location_lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          position_id: string;
          user_id: string;
          photo_path?: string | null;
          cv_path?: string | null;
          cv_name?: string | null;
          location_label?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["candidacies"]["Insert"]>;
        Relationships: [];
      };
      candidate_references: {
        Row: {
          id: string;
          candidacy_id: string;
          author_id: string;
          body: string;
          stance: Stance;
          hidden: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidacy_id: string;
          author_id: string;
          body: string;
          stance: Stance;
          hidden?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["candidate_references"]["Insert"]>;
        Relationships: [];
      };
      reference_reports: {
        Row: {
          id: string;
          reference_id: string;
          reporter_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reference_id: string;
          reporter_id: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reference_reports"]["Insert"]>;
        Relationships: [];
      };
      ai_summaries: {
        Row: {
          candidacy_id: string;
          positive: string | null;
          negative: string | null;
          based_on_count: number;
          source: string;
          generated_at: string;
        };
        Insert: {
          candidacy_id: string;
          positive?: string | null;
          negative?: string | null;
          based_on_count?: number;
          source?: string;
          generated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_summaries"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
