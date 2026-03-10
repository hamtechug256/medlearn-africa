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
      semesters: {
        Row: {
          id: string
          name: string
          short_name: string
          description: string
          color: string
          gradient: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          short_name: string
          description: string
          color: string
          gradient: string
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_name?: string
          description?: string
          color?: string
          gradient?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      course_units: {
        Row: {
          id: string
          semester_id: string
          code: string
          name: string
          description: string
          icon: string
          color: string
          keywords: string[]
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          semester_id: string
          code: string
          name: string
          description: string
          icon: string
          color: string
          keywords?: string[]
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          semester_id?: string
          code?: string
          name?: string
          description?: string
          icon?: string
          color?: string
          keywords?: string[]
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          icon?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          title: string
          slug: string
          category_id: string | null
          course_unit_id: string | null
          semester_id: string | null
          description: string
          content: string | null
          word_count: number
          images: string[]
          featured_image: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          category_id?: string | null
          course_unit_id?: string | null
          semester_id?: string | null
          description?: string
          content?: string | null
          word_count?: number
          images?: string[]
          featured_image?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          category_id?: string | null
          course_unit_id?: string | null
          semester_id?: string | null
          description?: string
          content?: string | null
          word_count?: number
          images?: string[]
          featured_image?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Semester = Database['public']['Tables']['semesters']['Row']
export type CourseUnit = Database['public']['Tables']['course_units']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Topic = Database['public']['Tables']['topics']['Row']
export type SiteSetting = Database['public']['Tables']['site_settings']['Row']

// Extended types with relationships
export interface TopicWithRelations extends Topic {
  category?: Category | null
  course_unit?: CourseUnit | null
  semester?: Semester | null
}

export interface CourseUnitWithTopics extends CourseUnit {
  topics?: Topic[]
  semester?: Semester
}

export interface SemesterWithCourseUnits extends Semester {
  course_units?: CourseUnit[]
}
