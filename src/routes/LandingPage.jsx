import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LandingPage = () => {
  const { user, loading } = useAuth()

  // Get user info from Google metadata
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F6F3C2' }}>
      {/* Header */}
      <header className="w-full border-b-2" style={{ borderColor: '#91C6BC' }}>
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-serif font-bold tracking-tight" style={{ color: '#3D2B1F' }}>
            bookish<span style={{ color: '#E37434' }}>.ink</span>
          </span>
          
          {/* Show different content based on auth state */}
          {loading ? (
            <div className="h-8 w-20 rounded-full animate-pulse" style={{ backgroundColor: '#E8E4A8' }} />
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* User profile */}
              <div className="flex items-center gap-2">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="h-8 w-8 rounded-full border-2 object-cover"
                    style={{ borderColor: '#91C6BC' }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div 
                    className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-serif"
                    style={{ borderColor: '#91C6BC', backgroundColor: '#E8E4A8', color: '#3D2B1F' }}
                  >
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-serif max-w-[100px] truncate" style={{ color: '#5C4033' }}>
                  {fullName}
                </span>
              </div>
              <Link
                to="/dashboard"
                className="rounded-full px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: '#4B9DA9', color: '#F6F3C2' }}
              >
                My Books
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: '#4B9DA9', color: '#F6F3C2' }}
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center">
        <div className="mx-auto max-w-5xl px-4 py-10 grid gap-10 md:grid-cols-[1.2fr,1fr] items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] font-sans" style={{ color: '#E37434' }}>
              For everyday storytellers
            </p>
            <h1 className="mt-3 text-3xl md:text-5xl font-serif font-bold tracking-tight" style={{ color: '#3D2B1F' }}>
              Create your own <span style={{ color: '#4B9DA9' }}>books</span> and write{' '}
              <span style={{ color: '#E37434' }}>page by page</span>.
            </h1>
            <p className="mt-4 text-sm md:text-base font-serif leading-relaxed" style={{ color: '#5C4033' }}>
              A focused writing space where each page lives on its own. Add titles, thumbnails,
              and flip between pages only when you are ready to save.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={user ? "/dashboard" : "/login"}
                className="rounded-full px-5 py-2.5 text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: '#4B9DA9', color: '#F6F3C2' }}
              >
                {user ? "Go to Dashboard" : "Start writing"}
              </Link>
              <Link
                to={user ? "/dashboard" : "/login"}
                className="rounded-full px-4 py-2 text-sm font-medium border-2 transition-all hover:opacity-80"
                style={{ borderColor: '#91C6BC', color: '#3D2B1F', backgroundColor: 'transparent' }}
              >
                {user ? "View my books" : "Continue a book"}
              </Link>
            </div>
          </div>

          {/* Preview card */}
          <div 
            className="relative rounded-xl border-2 shadow-lg px-4 py-5"
            style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span 
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-xs border"
                  style={{ backgroundColor: '#91C6BC20', color: '#4B9DA9', borderColor: '#91C6BC' }}
                >
                  ✍
                </span>
                <span className="text-xs uppercase tracking-[0.18em] font-sans" style={{ color: '#8B7355' }}>
                  Page editor preview
                </span>
              </div>
              <span className="text-[11px] font-serif" style={{ color: '#8B7355' }}>Auto-saves</span>
            </div>
            <div className="space-y-3 text-xs">
              {/* Previous page preview */}
              <div 
                className="rounded-lg border px-3 py-2"
                style={{ borderColor: '#E8E4A8', backgroundColor: '#F6F3C2' }}
              >
                <div className="flex items-center justify-between text-[11px]" style={{ color: '#8B7355' }}>
                  <span>Previous page</span>
                  <span>Read-only</span>
                </div>
                <p className="mt-2 line-clamp-2 text-[11px] font-serif italic" style={{ color: '#5C4033' }}>
                  "Yesterday, I discovered a place between reality and dreams. I promised myself I would
                  return and write it down before it fades..."
                </p>
              </div>
              
              {/* Current page */}
              <div 
                className="rounded-lg border-2 px-3 py-3"
                style={{ borderColor: '#4B9DA9', backgroundColor: '#4B9DA910' }}
              >
                <div className="flex items-center justify-between text-[11px]" style={{ color: '#4B9DA9' }}>
                  <span className="font-medium">Current page</span>
                  <span 
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-[2px]"
                    style={{ borderColor: '#91C6BC' }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#E37434' }} />
                    <span>Writing</span>
                  </span>
                </div>
                <div 
                  className="mt-2 h-20 rounded-md border px-2.5 py-1.5 text-[11px] font-serif"
                  style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5', color: '#3D2B1F' }}
                >
                  Your cursor lives here—type, revise, and save before moving on to the next page.
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex justify-between items-center pt-1">
                <button className="text-[11px] transition-colors" style={{ color: '#8B7355' }}>
                  ← Previous
                </button>
                <button 
                  className="rounded-full px-3 py-1 text-[11px] font-medium transition-all"
                  style={{ backgroundColor: '#E37434', color: '#F6F3C2' }}
                >
                  Save page
                </button>
                <button className="text-[11px] transition-colors" style={{ color: '#8B7355' }}>
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t-2 py-4" style={{ borderColor: '#91C6BC' }}>
        <p className="text-center text-sm font-serif" style={{ color: '#5C4033' }}>
          Build with <span style={{ color: '#E37434' }}>❤️</span> of Manasi
        </p>
      </footer>
    </div>
  )
}

export default LandingPage
