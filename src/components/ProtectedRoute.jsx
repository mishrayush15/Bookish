import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Show a simple loading state while we check auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F6F3C2' }}>
        <div className="flex flex-col items-center gap-3">
          <div 
            className="h-6 w-6 rounded-full border-2 border-t-transparent animate-spin" 
            style={{ borderColor: '#4B9DA9' }}
          />
          <span className="text-sm font-serif" style={{ color: '#5C4033' }}>Checking authentication…</span>
        </div>
      </div>
    )
  }

  // Not logged in → redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in → render children
  return children
}

export default ProtectedRoute
