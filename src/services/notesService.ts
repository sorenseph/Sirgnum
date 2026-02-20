import { supabase } from '@/lib/supabase'
import type { Note } from '@/types/database'

export const categoryLabels: Record<string, string> = {
  equity: 'Equity',
  valuacion: 'Valuación',
  fibras: 'Fibras',
  economicos: 'Análisis Económicos',
  sectoriales: 'Sectoriales',
  especiales: 'Especiales',
  nota_tecnica: 'Nota Técnica',
}

export async function fetchPublishedNotes(category?: string) {
  let query = supabase
    .from('notes')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (category && category !== 'todos') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  return { data: (data || []) as Note[], error }
}

export async function fetchNoteById(id: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()
  return { data: data as Note | null, error }
}

export async function fetchLatestNotes(limit = 5) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data: (data || []) as Note[], error }
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

export function getPreviewText(content: string, maxChars: number): string {
  const plain = stripHtml(content).replace(/!?\[.*?\]\(.*?\)/g, '').replace(/[#*_~`]/g, '')
  return plain.length <= maxChars ? plain : plain.slice(0, maxChars) + '...'
}

export function canReadFullContent(
  isAuthenticated: boolean,
  canRead: boolean,
  isEditor: boolean
): boolean {
  return isAuthenticated && (canRead || isEditor)
}
