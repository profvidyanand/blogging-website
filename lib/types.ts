export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Language code stored on categories (references public.languages.code). */
export type Language = string;

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          language: Language;
          status: "active" | "inactive";
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          language?: Language;
          status?: "active" | "inactive";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          language?: Language;
          status?: "active" | "inactive";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      category_assignments: {
        Row: {
          id: string;
          category_id: string;
          admin_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          admin_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          admin_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          id: string;
          category_id: string;
          topic: string;
          status: "pending" | "generated";
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          topic: string;
          status?: "pending" | "generated";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          topic?: string;
          status?: "pending" | "generated";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          topic_id: string | null;
          category_id: string;
          title: string;
          slug: string;
          seo_title: string | null;
          meta_description: string | null;
          summary: string | null;
          content: string;
          faq: Json;
          tags: string[];
          featured_image: string | null;
          featured_image_credit: string | null;
          author_name: string | null;
          view_count: number;
          status: "draft" | "scheduled" | "published" | "unpublished";
          scheduled_at: string | null;
          published_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          topic_id?: string | null;
          category_id: string;
          title: string;
          slug: string;
          seo_title?: string | null;
          meta_description?: string | null;
          summary?: string | null;
          content?: string;
          faq?: Json;
          tags?: string[];
          featured_image?: string | null;
          featured_image_credit?: string | null;
          author_name?: string | null;
          view_count?: number;
          status?: "draft" | "scheduled" | "published" | "unpublished";
          scheduled_at?: string | null;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string | null;
          category_id?: string;
          title?: string;
          slug?: string;
          seo_title?: string | null;
          meta_description?: string | null;
          summary?: string | null;
          content?: string;
          faq?: Json;
          tags?: string[];
          featured_image?: string | null;
          featured_image_credit?: string | null;
          author_name?: string | null;
          view_count?: number;
          status?: "draft" | "scheduled" | "published" | "unpublished";
          scheduled_at?: string | null;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      languages: {
        Row: {
          code: string;
          label: string;
          created_at: string;
        };
        Insert: {
          code: string;
          label: string;
          created_at?: string;
        };
        Update: {
          code?: string;
          label?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          facebook_url: string;
          instagram_url: string;
          twitter_url: string;
          youtube_url: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          facebook_url?: string;
          instagram_url?: string;
          twitter_url?: string;
          youtube_url?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          facebook_url?: string;
          instagram_url?: string;
          twitter_url?: string;
          youtube_url?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_assigned_to_category: {
        Args: { target_category_id: string };
        Returns: boolean;
      };
      increment_article_view_count: {
        Args: { article_slug: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Admin = Tables<"admins">;
export type Category = Tables<"categories">;
export type CategoryAssignment = Tables<"category_assignments">;
export type Topic = Tables<"topics">;
export type Article = Tables<"articles">;
export type ActivityLog = Tables<"activity_log">;
export type SiteSettingsRow = Tables<"site_settings">;

export type FaqItem = { question: string; answer: string };
