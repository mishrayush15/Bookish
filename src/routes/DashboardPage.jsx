import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [creatingBook, setCreatingBook] = useState(false)
  const [books, setBooks] = useState([])
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [showNewBookModal, setShowNewBookModal] = useState(false)
  const [newBookTitle, setNewBookTitle] = useState('')

  // Fetch user's books on mount
  useEffect(() => {
    const fetchBooks = async () => {
      if (!user) return

      setLoadingBooks(true)

      // Fetch books with page count
      const { data, error } = await supabase
        .from('books')
        .select(`
          id,
          title,
          thumbnail_url,
          created_at,
          book_pages (count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching books:', error)
        setLoadingBooks(false)
        return
      }

      // Transform data to include page count
      const booksWithCount = data.map((book) => ({
        ...book,
        pageCount: book.book_pages?.[0]?.count || 0,
      }))

      setBooks(booksWithCount)
      setLoadingBooks(false)
    }

    fetchBooks()
  }, [user])

  // Get user info from Google metadata
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const openNewBookModal = () => {
    setNewBookTitle('')
    setShowNewBookModal(true)
  }

  const closeNewBookModal = () => {
    setShowNewBookModal(false)
    setNewBookTitle('')
  }

  const handleCreateBook = async (e) => {
    e.preventDefault()
    if (creatingBook) return
    
    const title = newBookTitle.trim() || 'Untitled Book'
    setCreatingBook(true)

    // Create a new book in Supabase
    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id: user.id,
        title: title,
        thumbnail_url: null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating book:', error)
      setCreatingBook(false)
      return
    }

    // Close modal and redirect to the book editor
    setShowNewBookModal(false)
    setNewBookTitle('')
    navigate(`/book/${data.id}`)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F3C2' }}>
      {/* Header */}
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
              <span className="hidden sm:block text-sm font-serif max-w-[120px] truncate" style={{ color: '#5C4033' }}>
                {fullName}
              </span>
            </div>
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

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-serif font-bold" style={{ color: '#3D2B1F' }}>Your books</h1>
          <p className="mt-1 text-sm font-serif" style={{ color: '#5C4033' }}>
            Start a new story or continue where you left off.
          </p>
        </div>

        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {/* Create new book card - always first */}
          <button
            onClick={openNewBookModal}
            className="aspect-[2/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-all duration-200 cursor-pointer group hover:shadow-lg"
            style={{ borderColor: '#4B9DA9', backgroundColor: '#4B9DA910' }}
          >
            <div 
              className="text-3xl mb-2 group-hover:scale-110 transition-transform w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#4B9DA920' }}
            >
              📖
            </div>
            <p className="text-sm font-serif font-medium" style={{ color: '#4B9DA9' }}>
              New Book
            </p>
            <p className="text-[10px] mt-1 font-serif" style={{ color: '#8B7355' }}>
              Click to start writing
            </p>
          </button>

          {/* Loading skeletons */}
          {loadingBooks && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] rounded-xl" style={{ backgroundColor: '#E8E4A8' }} />
                  <div className="mt-2.5 h-4 w-3/4 rounded" style={{ backgroundColor: '#E8E4A8' }} />
                  <div className="mt-1 h-3 w-1/2 rounded" style={{ backgroundColor: '#E8E4A880' }} />
                </div>
              ))}
            </>
          )}

          {/* User's books */}
          {!loadingBooks &&
            books.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
                className="group cursor-pointer"
              >
                {book.thumbnail_url ? (
                  <img
                    src={book.thumbnail_url}
                    alt={book.title}
                    className="aspect-[2/3] rounded-xl object-cover border-2 shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.02]"
                    style={{ borderColor: '#91C6BC' }}
                  />
                ) : (
                  <div 
                    className="aspect-[2/3] rounded-xl border-2 shadow-md flex flex-col items-center justify-center transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.02]"
                    style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5' }}
                  >
                    <span className="text-3xl mb-2">📚</span>
                    <span className="text-[10px] font-serif" style={{ color: '#8B7355' }}>No cover</span>
                  </div>
                )}
                <h2 
                  className="mt-2.5 text-sm font-serif font-medium truncate transition-colors"
                  style={{ color: '#3D2B1F' }}
                >
                  {book.title}
                </h2>
                <p className="mt-0.5 text-[11px] font-serif" style={{ color: '#8B7355' }}>
                  {book.pageCount} {book.pageCount === 1 ? 'page' : 'pages'}
                </p>
              </div>
            ))}
        </div>
      </main>

      {/* New Book Modal */}
      {showNewBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeNewBookModal}
          />

          {/* Modal */}
          <div 
            className="relative w-full max-w-md rounded-xl border-2 p-6 shadow-2xl"
            style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5' }}
          >
            <h2 className="text-lg font-serif font-bold mb-1" style={{ color: '#3D2B1F' }}>
              Create a new book
            </h2>
            <p className="text-sm font-serif mb-5" style={{ color: '#5C4033' }}>
              Give your book a title. You can always change it later.
            </p>

            <form onSubmit={handleCreateBook}>
              <input
                type="text"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="Enter book title..."
                autoFocus
                className="w-full rounded-lg border-2 px-4 py-2.5 text-sm font-serif outline-none transition-colors"
                style={{ 
                  borderColor: '#91C6BC', 
                  backgroundColor: '#F6F3C2', 
                  color: '#3D2B1F',
                }}
              />

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeNewBookModal}
                  className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
                  style={{ color: '#5C4033' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingBook}
                  className="rounded-full text-sm font-medium px-5 py-2 transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: '#4B9DA9', color: '#F6F3C2' }}
                >
                  {creatingBook ? (
                    <>
                      <div 
                        className="h-3 w-3 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: '#F6F3C2' }}
                      />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Book</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
