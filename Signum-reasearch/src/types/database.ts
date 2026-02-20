export type UserRole = 'super_admin' | 'admin' | 'editor' | 'reader'

export type NoteCategory =
  | 'equity'
  | 'valuacion'
  | 'fibras'
  | 'economicos'
  | 'sectoriales'
  | 'especiales'
  | 'nota_tecnica'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  can_read: boolean
  subscription_expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  author_id: string | null
  title: string
  content: string
  header_image_url: string | null
  category: NoteCategory
  is_published: boolean
  created_at: string
  updated_at: string
}

import type { DailyReportSections } from './dailyReport'

export interface DailyReport {
  id: string
  author_id: string | null
  title: string
  report_date: string
  client_id: string | null
  form_responses: Partial<DailyReportSections> | Record<string, unknown> | null
  diagram_config: Record<string, unknown> | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ReportClient {
  id: string
  company_name: string
  logo_url: string | null
  primary_color_hex: string
  secondary_color_hex: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ReportQuestion {
  id: string
  question_key: string
  question_text: string
  question_type: string
  options: unknown
  required: boolean
  display_order: number
}

// Supabase Database type (simplified)
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      notes: { Row: Note; Insert: Partial<Note>; Update: Partial<Note> }
      daily_reports: {
        Row: DailyReport
        Insert: Partial<DailyReport>
        Update: Partial<DailyReport>
      }
      report_clients: {
        Row: ReportClient
        Insert: Partial<ReportClient>
        Update: Partial<ReportClient>
      }
    }
  }
}
