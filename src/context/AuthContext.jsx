import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const currentUserIdRef = useRef(null)

  useEffect(() => {
    // Get the current session on mount
    const getSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      currentUserIdRef.current = currentSession?.user?.id ?? null
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      const newUserId = newSession?.user?.id ?? null
      
      // Only update state if the user actually changed (not just token refresh)
      if (newUserId !== currentUserIdRef.current || event === 'SIGNED_OUT') {
        currentUserIdRef.current = newUserId
        setSession(newSession)
        setUser(newSession?.user ?? null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    session,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

