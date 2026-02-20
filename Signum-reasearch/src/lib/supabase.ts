import { createClient } from '@supabase/supabase-js'

// Valores por defecto para que funcione en Netlify sin configurar env vars
const DEFAULT_SUPABASE_URL = 'https://fbjpmqjzaltprocobgwp.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'sb_publishable_0RrUil1AaeQlysKxmmdCKQ_YhVTcBdY'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'signum-auth',
  },
})
