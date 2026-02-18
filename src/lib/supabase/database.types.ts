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
      questions: {
        Row: {
          question_code: string
          question_text: string
          category: string | null
          created_at: string | null
        }
        Insert: {
          question_code: string
          question_text: string
          category?: string | null
          created_at?: string | null
        }
        Update: {
          question_code?: string
          question_text?: string
          category?: string | null
          created_at?: string | null
        }
      }
      options: {
        Row: {
          id: string
          question_code: string
          option_text: string
          score: number
          display_order: number
          created_at: string | null
        }
        Insert: {
          id?: string
          question_code: string
          option_text: string
          score?: number
          display_order?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          question_code?: string
          option_text?: string
          score?: number
          display_order?: number
          created_at?: string | null
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          scoring_rules: Json
          created_at: string | null
          is_public: boolean
          creator_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          scoring_rules: Json
          created_at?: string | null
          is_public?: boolean
          creator_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          scoring_rules?: Json
          created_at?: string | null
          is_public?: boolean
          creator_id?: string | null
        }
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          question_code: string
          display_order: number
          created_at: string | null
        }
        Insert: {
          id?: string
          quiz_id: string
          question_code: string
          display_order?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          quiz_id?: string
          question_code?: string
          display_order?: number
          created_at?: string | null
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string | null
          quiz_id: string | null
          score: number
          tag: string
          answers: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          quiz_id?: string | null
          score: number
          tag: string
          answers: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          quiz_id?: string | null
          score?: number
          tag?: string
          answers?: Json
          created_at?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          requester_id: string | null
          receiver_id: string | null
          quiz_id: string | null
          requester_agreed: boolean | null
          receiver_agreed: boolean | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          requester_id?: string | null
          receiver_id?: string | null
          quiz_id?: string | null
          requester_agreed?: boolean | null
          receiver_agreed?: boolean | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          requester_id?: string | null
          receiver_id?: string | null
          quiz_id?: string | null
          requester_agreed?: boolean | null
          receiver_agreed?: boolean | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          nickname: string | null
          bio: string | null
          contact_info: string | null
          avatar_url: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          nickname?: string | null
          bio?: string | null
          contact_info?: string | null
          avatar_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          nickname?: string | null
          bio?: string | null
          contact_info?: string | null
          avatar_url?: string | null
          created_at?: string | null
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
