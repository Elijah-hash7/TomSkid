'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/lib/supabase/auth'

// ---------------------------------------------------------------------------
// ensureProfile
// Uses the caller's authenticated Supabase client to upsert a profile row.
// Requires the "Users can insert own profile" RLS policy on public.profiles
// (see supabase/fix-signup.sql).  Called as a safety net — the DB trigger
// should already handle this, but guards against missing/broken triggers.
// ---------------------------------------------------------------------------
async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string,
) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, email, role: 'customer' },
      { onConflict: 'id', ignoreDuplicates: true },
    )
    .select()
    .single()

  if (error) {
    console.error('[auth] ensureProfile failed', { userId, error: error.message, code: error.code })
  } else {
    console.log('[auth] ensureProfile ok', { userId, role: data?.role })
  }
  return { data, error }
}

// ---------------------------------------------------------------------------
// signUp
// ---------------------------------------------------------------------------
export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string

  console.log('[auth/signUp] attempting signup for', email)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback?next=/profile`,
    },
  })

  console.log('[auth/signUp] supabase.auth.signUp response', {
    userId: data.user?.id ?? null,
    hasSession: !!data.session,
    emailConfirmedAt: data.user?.email_confirmed_at ?? null,
    error: error?.message ?? null,
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (!data.user) {
    // Shouldn't happen without an error, but guard anyway.
    redirect('/signup?error=Signup+failed.+Please+try+again.')
  }

  if (data.session) {
    // Email confirmation is DISABLED — user is signed in immediately.
    // Ensure a profile row exists (DB trigger should handle this, but be safe).
    console.log('[auth/signUp] session returned — email confirmation disabled')
    await ensureProfile(supabase, data.user.id, email)
    redirect('/profile')
  }

  // Email confirmation is ENABLED — the user must verify before signing in.
  // The DB trigger on auth.users INSERT creates the profiles row at this point.
  console.log('[auth/signUp] no session — email confirmation required, redirecting to login')
  redirect('/login?message=Account+created!+Check+your+email+to+verify+before+signing+in.')
}

// ---------------------------------------------------------------------------
// signIn
// ---------------------------------------------------------------------------
export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string
  const next = (formData.get('next') as string | null) || null

  console.log('[auth/signIn] attempting sign in for', email)

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('[auth/signIn] signInWithPassword error', error.message)
    const msg = error.message.includes('Invalid login credentials')
      ? 'Invalid email or password.'
      : error.message.includes('Email not confirmed')
      ? 'Please confirm your email before signing in. Check your inbox.'
      : error.message
    redirect(`/login?error=${encodeURIComponent(msg)}`)
  }

  if (!user) {
    redirect('/login?error=Unable+to+sign+in')
  }

  console.log('[auth/signIn] auth user ok', { userId: user.id })

  // Fetch profile (the session cookie was set by signInWithPassword above).
  let { profile } = await getServerUser()
  console.log('[auth/signIn] profile lookup', { found: !!profile, role: profile?.role ?? null })

  if (!profile) {
    // Profile is missing — this happens when the DB trigger was not active when
    // the user was created (e.g., manually created account, or trigger was added
    // later).  Create the profile now using the authenticated client.
    // Requires the "Users can insert own profile" RLS policy — see fix-signup.sql.
    console.warn('[auth/signIn] profile missing for', user.id, '— creating now')
    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: user.id, email: user.email ?? email, role: 'customer' })
      .select()
      .single()

    if (insertError) {
      console.error('[auth/signIn] failed to create missing profile', {
        userId: user.id,
        error: insertError.message,
        code: insertError.code,
      })
      redirect(
        `/login?error=${encodeURIComponent(
          'Account setup is incomplete. Please contact support or try signing up again.',
        )}`,
      )
    }

    console.log('[auth/signIn] created missing profile', { userId: user.id, role: created?.role })
    profile = created
  }

  const destination = next ?? (profile?.role === 'admin' ? '/admin/dashboard' : '/profile')
  console.log('[auth/signIn] redirecting to', destination)
  redirect(destination)
}

// ---------------------------------------------------------------------------
// signInWithGoogle
// ---------------------------------------------------------------------------
export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback?next=/profile`,
    },
  })

  if (error) {
    console.error('[auth/signInWithGoogle] error', error.message)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

// ---------------------------------------------------------------------------
// signOut
// ---------------------------------------------------------------------------
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.delete('dev_admin_session')
  redirect('/login')
}
