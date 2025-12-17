import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // If already logged in, redirect to dashboard
  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    const redirectTo = `${window.location.origin}/dashboard`
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F6F3C2' }}>
      {/* Decorative corner elements */}
      <div className="fixed top-0 left-0 w-32 h-32 opacity-20" style={{ backgroundColor: '#91C6BC', borderRadius: '0 0 100% 0' }} />
      <div className="fixed bottom-0 right-0 w-32 h-32 opacity-20" style={{ backgroundColor: '#91C6BC', borderRadius: '100% 0 0 0' }} />
      
      <div 
        className="w-full max-w-md rounded-xl border-2 px-6 py-8 shadow-lg relative"
        style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5' }}
      >
        {/* Logo */}
        <Link to="/" className="block text-center mb-6">
          <span className="text-2xl font-serif font-bold" style={{ color: '#3D2B1F' }}>
            bookish<span style={{ color: '#E37434' }}>.ink</span>
          </span>
        </Link>

        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] font-sans" style={{ color: '#E37434' }}>
            Welcome back
          </p>
          <h1 className="mt-2 text-2xl font-serif font-bold" style={{ color: '#3D2B1F' }}>
            Sign in to continue writing
          </h1>
          <p className="mt-2 text-sm font-serif" style={{ color: '#5C4033' }}>
            Use your Google account to save your books and pick up exactly where you left off.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-full text-sm font-medium py-3 transition-all hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#4B9DA9', color: '#F6F3C2' }}
        >
          <span 
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
            style={{ backgroundColor: '#F6F3C2', color: '#3D2B1F' }}
          >
            G
          </span>
          <span>{loading ? 'Redirecting…' : 'Continue with Google'}</span>
        </button>

        <p className="mt-4 text-xs text-center font-serif" style={{ color: '#8B7355' }}>
          We only use your email to keep your books synced. No clutter, no spam.
        </p>
        
        {error && (
          <p className="mt-3 text-xs text-center font-medium" style={{ color: '#E37434' }}>
            {error}
          </p>
        )}

        {/* Decorative line */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: '#91C6BC' }} />
          <span className="text-[10px] uppercase tracking-widest font-sans" style={{ color: '#8B7355' }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#91C6BC' }} />
        </div>

        <Link 
          to="/"
          className="mt-4 block text-center text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: '#4B9DA9' }}
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}

export default LoginPage
