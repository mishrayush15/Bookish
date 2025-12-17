import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

// Quill editor configuration
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ font: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['blockquote'],
    ['clean'],
  ],
}

const quillFormats = [
  'header',
  'font',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'list',
  'bullet',
  'align',
  'blockquote',
]

const BookEditorPage = () => {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Book and pages state
  const [book, setBook] = useState(null)
  const [pages, setPages] = useState([])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Editor state
  const [editorContent, setEditorContent] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Book settings modal state
  const [showSettings, setShowSettings] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editThumbnail, setEditThumbnail] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Page selector dropdown
  const [showPageSelector, setShowPageSelector] = useState(false)

  // Auto-save refs
  const autoSaveRef = useRef(null)
  const editorContentRef = useRef(editorContent)
  const currentPageRef = useRef(null)
  const hasUnsavedChangesRef = useRef(false)

  // Keep refs in sync
  useEffect(() => {
    editorContentRef.current = editorContent
  }, [editorContent])

  useEffect(() => {
    currentPageRef.current = pages[currentPageIndex] || null
  }, [pages, currentPageIndex])

  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges
  }, [hasUnsavedChanges])


  // Fetch book and pages
  useEffect(() => {
    const fetchBookData = async () => {
      if (!bookId || !user) return

      setLoading(true)
      setError(null)

      // Fetch book
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single()

      if (bookError) {
        console.error('Error fetching book:', bookError)
        setError('Book not found or you do not have access.')
        setLoading(false)
        return
      }

      setBook(bookData)

      // Fetch pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('book_pages')
        .select('*')
        .eq('book_id', bookId)
        .order('page_number', { ascending: true })

      if (pagesError) {
        console.error('Error fetching pages:', pagesError)
        setError('Failed to load pages.')
        setLoading(false)
        return
      }

      // If no pages exist, create the first page
      if (pagesData.length === 0) {
        const { data: newPage, error: newPageError } = await supabase
          .from('book_pages')
          .insert({
            book_id: bookId,
            page_number: 1,
            content: '',
          })
          .select()
          .single()

        if (newPageError) {
          console.error('Error creating first page:', newPageError)
          setError('Failed to create first page.')
          setLoading(false)
          return
        }

        setPages([newPage])
        setEditorContent('')
        setCurrentPageIndex(0)
      } else {
        setPages(pagesData)
        
        // Restore last edited page position
        const lastPage = bookData.last_page || 1
        const lastPageIndex = pagesData.findIndex(p => p.page_number === lastPage)
        const startIndex = lastPageIndex >= 0 ? lastPageIndex : 0
        
        setCurrentPageIndex(startIndex)
        setEditorContent(pagesData[startIndex]?.content || '')
      }

      setHasUnsavedChanges(false)
      setLoading(false)
    }

    fetchBookData()
  }, [bookId, user])

  // Current page
  const currentPage = pages[currentPageIndex]
  const previousPage = currentPageIndex > 0 ? pages[currentPageIndex - 1] : null
  const nextPage = currentPageIndex < pages.length - 1 ? pages[currentPageIndex + 1] : null

  // Auto-save function (uses refs to avoid stale closures)
  const performAutoSave = useCallback(async () => {
    if (!hasUnsavedChangesRef.current || !currentPageRef.current) return

    // Save page content
    const { error: saveError } = await supabase
      .from('book_pages')
      .update({
        content: editorContentRef.current,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentPageRef.current.id)

    if (saveError) {
      console.error('Auto-save error:', saveError)
      return
    }

    // Update last page in the book (for restoring position on next visit)
    await supabase
      .from('books')
      .update({ last_page: currentPageRef.current.page_number })
      .eq('id', bookId)

    // Update local state
    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPageRef.current.id
          ? { ...p, content: editorContentRef.current }
          : p
      )
    )
    setHasUnsavedChanges(false)
  }, [bookId])

  // Debounced auto-save: triggers 1.5 seconds after user stops typing
  const triggerDebouncedSave = useCallback(() => {
    // Clear any existing timeout
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current)
    }

    // Set new timeout
    autoSaveRef.current = setTimeout(() => {
      performAutoSave()
    }, 600) // 1.5 seconds after user stops typing
  }, [performAutoSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
    }
  }, [])

  // Handle editor change
  const handleEditorChange = useCallback(
    (content) => {
      setEditorContent(content)
      // Check if content changed from saved version
      if (currentPage && content !== currentPage.content) {
        setHasUnsavedChanges(true)
        // Trigger debounced auto-save
        triggerDebouncedSave()
      } else {
        setHasUnsavedChanges(false)
      }
    },
    [currentPage, triggerDebouncedSave]
  )

  // Navigate to a specific page
  const goToPage = async (index) => {
    if (hasUnsavedChanges) {
      alert('Please save your current page before navigating.')
      return
    }
    if (index < 0 || index >= pages.length) return

    const targetPage = pages[index]
    setCurrentPageIndex(index)
    setEditorContent(targetPage?.content || '')
    setHasUnsavedChanges(false)

    // Update last page in the book (for restoring position on next visit)
    if (targetPage) {
      await supabase
        .from('books')
        .update({ last_page: targetPage.page_number })
        .eq('id', bookId)
    }
  }

  // Add new page
  const handleAddPage = async () => {
    if (hasUnsavedChanges) {
      alert('Please save your current page before adding a new page.')
      return
    }

    const newPageNumber = pages.length + 1

    const { data: newPage, error: newPageError } = await supabase
      .from('book_pages')
      .insert({
        book_id: bookId,
        page_number: newPageNumber,
        content: '',
      })
      .select()
      .single()

    if (newPageError) {
      console.error('Error adding page:', newPageError)
      return
    }

    // Update last_page in the book
    await supabase
      .from('books')
      .update({ last_page: newPageNumber })
      .eq('id', bookId)

    setPages((prev) => [...prev, newPage])
    setCurrentPageIndex(pages.length) // Go to new page
    setEditorContent('')
    setHasUnsavedChanges(false)
  }

  // Open settings modal
  const openSettings = () => {
    setEditTitle(book?.title || '')
    setEditThumbnail(book?.thumbnail_url || '')
    setShowSettings(true)
    setShowDeleteConfirm(false)
  }

  // Save book settings
  const handleSaveSettings = async () => {
    if (savingSettings) return
    setSavingSettings(true)

    const { error: updateError } = await supabase
      .from('books')
      .update({
        title: editTitle.trim() || 'Untitled Book',
        thumbnail_url: editThumbnail.trim() || null,
      })
      .eq('id', bookId)

    if (updateError) {
      console.error('Error updating book:', updateError)
      setSavingSettings(false)
      return
    }

    // Update local state
    setBook((prev) => ({
      ...prev,
      title: editTitle.trim() || 'Untitled Book',
      thumbnail_url: editThumbnail.trim() || null,
    }))

    setSavingSettings(false)
    setShowSettings(false)
  }

  // Delete book
  const handleDeleteBook = async () => {
    if (deleting) return
    setDeleting(true)

    // Delete all pages first (cascade should handle this, but being explicit)
    await supabase.from('book_pages').delete().eq('book_id', bookId)

    // Delete the book
    const { error: deleteError } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)

    if (deleteError) {
      console.error('Error deleting book:', deleteError)
      setDeleting(false)
      return
    }

    // Redirect to dashboard
    navigate('/dashboard')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F6F3C2' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#4B9DA9' }} />
          <span className="text-sm font-serif" style={{ color: '#5C4033' }}>Loading book...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F6F3C2' }}>
        <div className="text-center">
          <p className="text-sm font-serif mb-4" style={{ color: '#E37434' }}>{error}</p>
          <Link
            to="/dashboard"
            className="text-sm font-medium underline"
            style={{ color: '#4B9DA9' }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#F6F3C2' }}>
      {/* Navbar */}
      <Navbar 
        variant="editor" 
        editorData={{
          bookTitle: book?.title,
          onTitleClick: openSettings,
          hasUnsavedChanges
        }}
      />

      {/* Main content - Book layout */}
      <main className="flex-1 w-full px-2 md:px-4 py-4 flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-6xl h-full flex items-center gap-2 md:gap-4">
          
          {/* Left navigation arrow */}
          <button
            onClick={() => goToPage(currentPageIndex - 1)}
            disabled={currentPageIndex === 0}
            className="hidden md:flex shrink-0 w-12 h-12 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5', color: '#5C4033' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Book pages container */}
          <div className="flex-1 h-full min-w-0 max-w-full flex items-stretch justify-center gap-0 relative overflow-hidden">
            
            {/* Previous page (left side peek) */}
            <div 
              className={`hidden md:flex w-16 lg:w-24 shrink-0 rounded-l-xl border-2 border-r-0 overflow-hidden cursor-pointer transition-colors ${!previousPage ? 'opacity-30 cursor-default' : 'hover:opacity-90'}`}
              style={{ borderColor: '#91C6BC', backgroundColor: '#E8E4A8' }}
              onClick={() => previousPage && goToPage(currentPageIndex - 1)}
            >
              {previousPage ? (
                <div className="w-full h-full p-2 overflow-hidden">
                  <div className="text-[9px] font-sans mb-1" style={{ color: '#8B7355' }}>Page {previousPage.page_number}</div>
                  <div 
                    className="text-[8px] font-serif leading-tight overflow-hidden"
                    style={{ 
                      color: '#5C4033',
                      display: '-webkit-box',
                      WebkitLineClamp: 20,
                      WebkitBoxOrient: 'vertical',
                    }}
                    dangerouslySetInnerHTML={{ __html: previousPage.content || '' }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[9px] font-serif -rotate-90 whitespace-nowrap" style={{ color: '#8B7355' }}>No previous</span>
                </div>
              )}
            </div>

            {/* Current page (center - main editor) */}
            <div 
              className="flex-1 min-w-0 max-w-full flex flex-col rounded-xl md:rounded-none border-2 shadow-xl z-10 overflow-hidden"
              style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5' }}
            >
              {/* Page header */}
              <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b-2" style={{ borderColor: '#E8E4A8' }}>
                <div className="flex items-center gap-2 text-[11px] relative">
                  <button
                    onClick={() => setShowPageSelector(!showPageSelector)}
                    className="rounded-full border-2 px-2.5 py-1 transition-colors flex items-center gap-1 font-medium"
                    style={{ borderColor: '#4B9DA9', color: '#4B9DA9', backgroundColor: '#4B9DA910' }}
                  >
                    Page {currentPage?.page_number || 1}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <span className="font-serif" style={{ color: '#8B7355' }}>of {pages.length}</span>

                  {/* Page selector dropdown */}
                  {showPageSelector && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowPageSelector(false)}
                      />
                      <div 
                        className="absolute top-full left-0 mt-1 z-20 border-2 rounded-lg shadow-xl py-1 max-h-48 overflow-y-auto min-w-[120px]"
                        style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5' }}
                      >
                        {pages.map((page, idx) => (
                          <button
                            key={page.id}
                            onClick={() => {
                              if (hasUnsavedChanges) {
                                alert('Please save your current page before navigating.')
                                return
                              }
                              goToPage(idx)
                              setShowPageSelector(false)
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs font-serif transition-colors"
                            style={{ 
                              color: idx === currentPageIndex ? '#4B9DA9' : '#5C4033',
                              backgroundColor: idx === currentPageIndex ? '#91C6BC20' : 'transparent'
                            }}
                          >
                            Page {page.page_number}
                            {idx === currentPageIndex && ' ←'}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <span className="text-[10px] font-serif" style={{ color: '#8B7355' }}>
                  Auto-saves when you pause
                </span>
              </div>

              {/* Rich text editor */}
              <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden quill-vintage">
                <ReactQuill
                  theme="snow"
                  value={editorContent}
                  onChange={handleEditorChange}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Start writing your story..."
                />
              </div>
            </div>

            {/* Next page OR Add new page (right side) */}
            {nextPage ? (
              <div 
                className="hidden md:flex w-16 lg:w-24 shrink-0 rounded-r-xl border-2 border-l-0 overflow-hidden cursor-pointer hover:opacity-90 transition-colors"
                style={{ borderColor: '#91C6BC', backgroundColor: '#E8E4A8' }}
                onClick={() => goToPage(currentPageIndex + 1)}
              >
                <div className="w-full h-full p-2 overflow-hidden">
                  <div className="text-[9px] font-sans mb-1" style={{ color: '#8B7355' }}>Page {nextPage.page_number}</div>
                  <div 
                    className="text-[8px] font-serif leading-tight overflow-hidden"
                    style={{ 
                      color: '#5C4033',
                      display: '-webkit-box',
                      WebkitLineClamp: 20,
                      WebkitBoxOrient: 'vertical',
                    }}
                    dangerouslySetInnerHTML={{ __html: nextPage.content || '' }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddPage}
                className="hidden md:flex w-16 lg:w-24 shrink-0 rounded-r-xl border-2 border-l-0 border-dashed items-center justify-center cursor-pointer transition-colors group hover:opacity-80"
                style={{ borderColor: '#4B9DA9', backgroundColor: '#4B9DA910' }}
              >
                <div className="flex flex-col items-center gap-1">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center transition-colors"
                    style={{ borderColor: '#4B9DA9' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: '#4B9DA9' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-medium" style={{ color: '#4B9DA9' }}>Add page</span>
                </div>
              </button>
            )}
          </div>

          {/* Right navigation arrow OR Add page button */}
          {nextPage ? (
            <button
              onClick={() => goToPage(currentPageIndex + 1)}
              className="hidden md:flex shrink-0 w-12 h-12 items-center justify-center rounded-full border-2 transition-colors"
              style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5', color: '#5C4033' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleAddPage}
              className="hidden md:flex shrink-0 w-12 h-12 items-center justify-center rounded-full border-2 border-dashed transition-colors hover:opacity-80"
              style={{ borderColor: '#4B9DA9', backgroundColor: '#4B9DA910', color: '#4B9DA9' }}
              title="Add new page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>

        {/* Mobile navigation - bottom bar */}
        <div 
          className="md:hidden fixed bottom-0 left-0 right-0 border-t-2 px-4 py-3 flex items-center justify-between gap-2 z-20"
          style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5' }}
        >
          <button
            onClick={() => goToPage(currentPageIndex - 1)}
            disabled={currentPageIndex === 0}
            className="flex-1 flex items-center justify-center gap-1 rounded-lg border-2 py-2 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: '#91C6BC', color: '#5C4033' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <button
            onClick={handleAddPage}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 border-dashed"
            style={{ borderColor: '#4B9DA9', backgroundColor: '#4B9DA910', color: '#4B9DA9' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => goToPage(currentPageIndex + 1)}
            disabled={!nextPage}
            className="flex-1 flex items-center justify-center gap-1 rounded-lg border-2 py-2 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: '#91C6BC', color: '#5C4033' }}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>

      {/* Book Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />

          {/* Modal */}
          <div 
            className="relative w-full max-w-md rounded-xl border-2 p-6 shadow-2xl"
            style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5' }}
          >
            {!showDeleteConfirm ? (
              <>
                <h2 className="text-lg font-serif font-bold mb-1" style={{ color: '#3D2B1F' }}>
                  Book Settings
                </h2>
                <p className="text-sm font-serif mb-5" style={{ color: '#5C4033' }}>
                  Update your book title and cover image.
                </p>

                <div className="space-y-4">
                  {/* Title input */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C4033' }}>Book Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Enter book title..."
                      className="w-full rounded-lg border-2 px-4 py-2.5 text-sm font-serif outline-none transition-colors"
                      style={{ borderColor: '#91C6BC', backgroundColor: '#F6F3C2', color: '#3D2B1F' }}
                    />
                  </div>

                  {/* Thumbnail URL input */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C4033' }}>Cover Image URL (optional)</label>
                    <input
                      type="url"
                      value={editThumbnail}
                      onChange={(e) => setEditThumbnail(e.target.value)}
                      placeholder="https://example.com/cover.jpg"
                      className="w-full rounded-lg border-2 px-4 py-2.5 text-sm font-serif outline-none transition-colors"
                      style={{ borderColor: '#91C6BC', backgroundColor: '#F6F3C2', color: '#3D2B1F' }}
                    />
                    {editThumbnail && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={editThumbnail}
                          alt="Cover preview"
                          className="h-16 w-12 rounded object-cover border-2"
                          style={{ borderColor: '#91C6BC' }}
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                        <span className="text-[10px] font-serif" style={{ color: '#8B7355' }}>Preview</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-xs font-medium transition-colors"
                    style={{ color: '#E37434' }}
                  >
                    Delete book
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowSettings(false)}
                      className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
                      style={{ color: '#5C4033' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={savingSettings}
                      className="rounded-full text-sm font-medium px-5 py-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#4B9DA9', color: '#F6F3C2' }}
                    >
                      {savingSettings ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-serif font-bold mb-1" style={{ color: '#E37434' }}>
                  Delete Book
                </h2>
                <p className="text-sm font-serif mb-5" style={{ color: '#5C4033' }}>
                  Are you sure you want to delete "{book?.title}"? This will permanently remove the book and all its pages. This action cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
                    style={{ color: '#5C4033' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteBook}
                    disabled={deleting}
                    className="rounded-full text-sm font-medium px-5 py-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#E37434', color: '#F6F3C2' }}
                  >
                    {deleting ? 'Deleting...' : 'Delete forever'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Custom styles for Quill - Vintage theme */}
      <style>{`
        .quill-vintage .ql-toolbar {
          background: #E8E4A8;
          border-color: #91C6BC !important;
          border-radius: 0;
          border-bottom: 2px solid #91C6BC !important;
        }
        .quill-vintage .ql-toolbar .ql-stroke {
          stroke: #5C4033;
        }
        .quill-vintage .ql-toolbar .ql-fill {
          fill: #5C4033;
        }
        .quill-vintage .ql-toolbar .ql-picker {
          color: #5C4033;
        }
        .quill-vintage .ql-toolbar .ql-picker-options {
          background: #FFFEF5;
          border-color: #91C6BC;
        }
        .quill-vintage .ql-toolbar .ql-picker-label {
          color: #5C4033;
        }
        .quill-vintage .ql-toolbar button:hover .ql-stroke,
        .quill-vintage .ql-toolbar button.ql-active .ql-stroke {
          stroke: #4B9DA9;
        }
        .quill-vintage .ql-toolbar button:hover .ql-fill,
        .quill-vintage .ql-toolbar button.ql-active .ql-fill {
          fill: #4B9DA9;
        }
        .quill-vintage .ql-container {
          border-color: #91C6BC !important;
          border-radius: 0;
          border-top: none !important;
          font-family: 'Georgia', 'Times New Roman', serif;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #FFFEF5;
        }
        .quill-vintage .quill {
          height: 100% !important;
          width: 100% !important;
          display: flex;
          flex-direction: column;
        }
        .quill-vintage .ql-editor {
          flex: 1;
          color: #3D2B1F;
          font-size: 1rem;
          line-height: 1.8;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
          white-space: pre-wrap;
          overflow-y: auto !important;
          overflow-x: hidden;
          padding: 1.5rem;
        }
        .quill-vintage .ql-editor::-webkit-scrollbar {
          width: 10px;
        }
        .quill-vintage .ql-editor::-webkit-scrollbar-track {
          background: #E8E4A8;
          border-radius: 5px;
        }
        .quill-vintage .ql-editor::-webkit-scrollbar-thumb {
          background: #91C6BC;
          border-radius: 5px;
        }
        .quill-vintage .ql-editor::-webkit-scrollbar-thumb:hover {
          background: #4B9DA9;
        }
        .quill-vintage {
          overflow: hidden;
          width: 100% !important;
          max-width: 100% !important;
          height: 100% !important;
          display: flex;
          flex-direction: column;
        }
        .quill-vintage .ql-toolbar {
          flex-shrink: 0;
        }
        .quill-vintage .ql-editor.ql-blank::before {
          color: #8B7355;
          font-style: italic;
        }
        .quill-vintage .ql-editor h1,
        .quill-vintage .ql-editor h2,
        .quill-vintage .ql-editor h3 {
          color: #3D2B1F;
          font-weight: bold;
        }
        .quill-vintage .ql-snow .ql-picker.ql-expanded .ql-picker-label {
          border-color: #91C6BC;
        }
        .quill-vintage .ql-snow .ql-picker-item:hover {
          color: #4B9DA9;
        }
      `}</style>
    </div>
  )
}

export default BookEditorPage
