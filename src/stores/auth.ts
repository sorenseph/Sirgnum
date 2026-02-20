import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

const REFRESH_INTERVAL_MS = 25 * 60 * 1000 // 25 minutos para mantener sesión activa
let refreshTimerId: ReturnType<typeof setInterval> | null = null

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const isSuperAdmin = computed(() => profile.value?.role === 'super_admin')
  const isAdmin = computed(
    () =>
      profile.value?.role === 'super_admin' || profile.value?.role === 'admin'
  )
  const isEditor = computed(
    () =>
      profile.value?.role === 'super_admin' ||
      profile.value?.role === 'admin' ||
      profile.value?.role === 'editor'
  )
  const canAccessAdmin = computed(
    () =>
      profile.value?.role === 'super_admin' ||
      profile.value?.role === 'admin' ||
      profile.value?.role === 'editor'
  )
  const canManageUsers = computed(
    () =>
      profile.value?.role === 'super_admin' || profile.value?.role === 'admin'
  )

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error) profile.value = data as Profile
    return profile.value
  }

  function clearRefreshTimer() {
    if (refreshTimerId) {
      clearInterval(refreshTimerId)
      refreshTimerId = null
    }
  }

  function startRefreshTimer() {
    clearRefreshTimer()
    refreshTimerId = setInterval(async () => {
      if (!user.value) {
        clearRefreshTimer()
        return
      }
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession()
        if (!error && session) {
          user.value = session.user
          await fetchProfile(session.user.id)
        } else {
          clearRefreshTimer()
        }
      } catch {
        clearRefreshTimer()
      }
    }, REFRESH_INTERVAL_MS)
  }

  async function init() {
    loading.value = true
    try {
      const initPromise = (async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        user.value = session?.user ?? null
        if (user.value) {
          await fetchProfile(user.value.id)
          startRefreshTimer()
        } else {
          profile.value = null
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            user.value = session.user
            await fetchProfile(session.user.id)
            startRefreshTimer()
          } else if (event === 'SIGNED_OUT') {
            clearRefreshTimer()
            user.value = null
            profile.value = null
          } else {
            const { data: { session: refreshed } } = await supabase.auth.getSession()
            if (refreshed?.user) {
              user.value = refreshed.user
              await fetchProfile(refreshed.user.id)
              startRefreshTimer()
            } else {
              clearRefreshTimer()
              user.value = null
              profile.value = null
            }
          }
        })
      })()
      const timeoutPromise = new Promise<void>((resolve) =>
        setTimeout(resolve, 8000)
      )
      await Promise.race([initPromise, timeoutPromise])
    } catch (e) {
      console.warn('Auth init error:', e)
      user.value = null
      profile.value = null
    } finally {
      loading.value = false
    }

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState !== 'visible' || !user.value) return
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession()
        if (!error && session) {
          user.value = session.user
          await fetchProfile(session.user.id)
        }
      } catch (_) {
      }
    })
  }

  async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    if (data.user) {
      user.value = data.user
      const profileData = await fetchProfile(data.user.id)
      if (!profileData) {
        profile.value = {
          id: data.user.id,
          email: data.user.email ?? '',
          full_name: (data.user.user_metadata?.full_name as string) ?? data.user.email ?? '',
          role: 'editor',
          avatar_url: null,
          is_active: true,
          can_read: true,
          subscription_expires_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
    }
    return data
  }

  async function signUpWithEmail(
    email: string,
    password: string,
    fullName?: string
  ) {
    const redirectTo = `${window.location.origin}/confirmacion`
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: redirectTo,
      },
    })
    if (error) throw error
    if (data.user) await fetchProfile(data.user.id)
    return data
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) throw error
    return data
  }

  async function signInWithFacebook() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
    })
    if (error) throw error
    return data
  }

  async function signOut() {
    clearRefreshTimer()
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  async function resetPasswordEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?recovery=true`,
    })
    if (error) throw error
  }

  async function checkEmailExists(email: string): Promise<boolean> {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()
    return !!data
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isEditor,
    canAccessAdmin,
    canManageUsers,
    init,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    updatePassword,
    resetPasswordEmail,
    fetchProfile,
    checkEmailExists,
  }
})
