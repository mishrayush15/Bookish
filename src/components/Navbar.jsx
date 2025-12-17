import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

/**
 * Reusable Navbar component that adapts based on page type
 * 
 * @param {Object} props
 * @param {string} props.variant - 'landing' | 'dashboard' | 'editor'
 * @param {Object} props.editorData - For editor variant: { bookTitle, onTitleClick, hasUnsavedChanges }
 * @param {Function} props.onSignOut - Custom sign out handler (optional)
 */
const Navbar = ({ 
  variant = 'landing', 
  editorData = null,
  onSignOut = null 
}) => {
  const { user, loading } = useAuth()
  const [signingOut, setSigningOut] = React.useState(false)

  // Get user info from Google metadata
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut()
      return
    }
    setSigningOut(true)
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // User Profile Component - reused across variants
  const UserProfile = ({ size = 'normal', showName = true, linkToDashboard = false }) => {
    const sizeClass = size === 'small' ? 'h-7 w-7' : 'h-8 w-8'
    const textSize = size === 'small' ? 'text-xs' : 'text-sm'
    
    const profileContent = (
      <div className="flex items-center gap-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className={`${sizeClass} rounded-full border-2 object-cover`}
            style={{ borderColor: '#91C6BC' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div 
            className={`${sizeClass} rounded-full border-2 flex items-center justify-center ${textSize} font-serif`}
            style={{ borderColor: '#91C6BC', backgroundColor: '#E8E4A8', color: '#3D2B1F' }}
          >
            {fullName.charAt(0).toUpperCase()}
          </div>
        )}
        {showName && (
          <span 
            className={`hidden sm:block ${textSize} font-serif max-w-[100px] truncate`} 
            style={{ color: '#5C4033' }}
          >
            {size === 'small' ? fullName : fullName.split(' ')[0]}
          </span>
        )}
      </div>
    )

    if (linkToDashboard) {
      return (
        <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
          {profileContent}
        </Link>
      )
    }

    return profileContent
  }

  // Landing Page Navbar
  if (variant === 'landing') {
    return (
      <header className="w-full px-6 md:px-12 py-4 flex items-center justify-between border-b-2" style={{ borderColor: '#91C6BC' }}>
        {/* Logo */}
        <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: '#3D2B1F', fontFamily: 'Georgia, serif' }}>
          bookish<span style={{ color: '#E37434' }}>.ink</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <span className="text-sm font-medium cursor-pointer hover:opacity-70 transition-opacity" style={{ color: '#3D2B1F' }}>Home</span>
          <span className="text-sm font-medium cursor-pointer hover:opacity-70 transition-opacity" style={{ color: '#5C4033' }}>Features</span>
          <span className="text-sm font-medium cursor-pointer hover:opacity-70 transition-opacity" style={{ color: '#5C4033' }}>About</span>
          <span className="text-sm font-medium cursor-pointer hover:opacity-70 transition-opacity" style={{ color: '#5C4033' }}>Contact</span>
        </nav>

        {/* Right side - Auth */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-20 rounded-full animate-pulse" style={{ backgroundColor: '#E8E4A8' }} />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex">
                <UserProfile showName={true} />
              </div>
              <Link
                to="/dashboard"
                className="rounded-full px-5 py-2 text-sm font-medium transition-all hover:scale-105"
                style={{ backgroundColor: '#4B9DA9', color: '#F6F3C2' }}
              >
                My Books
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full px-5 py-2 text-sm font-medium transition-all hover:scale-105"
              style={{ backgroundColor: '#4B9DA9', color: '#F6F3C2' }}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>
    )
  }

  // Dashboard Navbar
  if (variant === 'dashboard') {
    return (
      <header className="border-b-2" style={{ borderColor: '#91C6BC' }}>
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-lg font-serif font-bold tracking-tight" style={{ color: '#3D2B1F' }}>
              bookish<span style={{ color: '#E37434' }}>.ink</span>
            </Link>
            <span 
              className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
              style={{ borderColor: '#91C6BC', color: '#5C4033', backgroundColor: '#91C6BC20' }}
            >
              My library
            </span>
          </div>
          <div className="flex items-center gap-3">
            <UserProfile showName={true} />
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ borderColor: '#91C6BC', color: '#5C4033' }}
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>
    )
  }

  // Editor Navbar
  if (variant === 'editor') {
    const { bookTitle, onTitleClick, hasUnsavedChanges, onDownloadPdf, isDownloading } = editorData || {}
    
    return (
      <header className="border-b-2" style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5' }}>
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <Link
              to="/dashboard"
              className="transition-colors hover:opacity-70"
              title="Back to Dashboard"
              style={{ color: '#5C4033' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            {/* Book title */}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] font-sans" style={{ color: '#8B7355' }}>Writing</span>
              <button
                onClick={onTitleClick}
                className="text-sm font-serif font-medium transition-colors text-left flex items-center gap-1.5 hover:opacity-70"
                style={{ color: '#3D2B1F' }}
              >
                {bookTitle || 'Untitled'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" style={{ color: '#8B7355' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            {/* Download PDF button */}
            <button
              onClick={onDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 transition-all hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ borderColor: '#4B9DA9', color: '#4B9DA9' }}
              title="Download as PDF"
            >
              {isDownloading ? (
                <>
                  <div 
                    className="h-3 w-3 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: '#4B9DA9' }}
                  />
                  <span className="font-medium hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium hidden sm:inline">Download PDF</span>
                </>
              )}
            </button>

            {/* Save status */}
            <span
              className="inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1"
              style={{ 
                borderColor: hasUnsavedChanges ? '#E37434' : '#91C6BC',
                color: hasUnsavedChanges ? '#E37434' : '#4B9DA9'
              }}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${hasUnsavedChanges ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: hasUnsavedChanges ? '#E37434' : '#91C6BC' }}
              />
              <span className="font-medium">{hasUnsavedChanges ? 'Unsaved' : 'Saved'}</span>
            </span>

            {/* User profile */}
            <UserProfile size="small" showName={true} linkToDashboard={true} />
          </div>
        </div>
      </header>
    )
  }

  // Default fallback
  return null
}

export default Navbar

