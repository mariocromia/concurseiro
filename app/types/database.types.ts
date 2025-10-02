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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_type: 'freemium' | 'plus' | 'pro'
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_type?: 'freemium' | 'plus' | 'pro'
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_type?: 'freemium' | 'plus' | 'pro'
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_goals: {
        Row: {
          id: string
          user_id: string
          goal_name: string
          target_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_name: string
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_name?: string
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          started_at: string
          ended_at: string | null
          duration: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          started_at: string
          ended_at?: string | null
          duration?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string | null
          started_at?: string
          ended_at?: string | null
          duration?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string | null
          total_study_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          icon?: string | null
          total_study_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string | null
          total_study_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      revisions: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          page_id: string | null
          revision_number: number
          scheduled_date: string
          completed_at: string | null
          status: 'pending' | 'completed' | 'skipped'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          page_id?: string | null
          revision_number: number
          scheduled_date: string
          completed_at?: string | null
          status?: 'pending' | 'completed' | 'skipped'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          page_id?: string | null
          revision_number?: number
          scheduled_date?: string
          completed_at?: string | null
          status?: 'pending' | 'completed' | 'skipped'
          created_at?: string
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
