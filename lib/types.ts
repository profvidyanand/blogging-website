export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Language = "english" | "hindi" | "sanskrit" | "marathi" | "gujarati";

export const SUPPORTED_LANGUAGES: { value: Language; label: string }[] = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "sanskrit", label: "Sanskrit" },
  { value: "marathi", label: "Marathi" },
  { value: "gujarati", label: "Gujarati" },
];

export const DEFAULT_LANGUAGE: Language = "english";

export function getLanguageLabel(language: Language): string {
  return (
    SUPPORTED_LANGUAGES.find((option) => option.value === language)?.label ??
    "English"
  );
}

export function normalizeLanguage(language: string | null | undefined): Language {
  if (
    language &&
    SUPPORTED_LANGUAGES.some((option) => option.value === language)
  ) {
    return language as Language;
  }
  return DEFAULT_LANGUAGE;
}

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
          status?: "draft" | "scheduled" | "published" | "unpublished";
          scheduled_at?: string | null;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
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

export type FaqItem = { question: string; answer: string };
