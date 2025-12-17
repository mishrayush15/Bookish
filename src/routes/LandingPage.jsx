import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LandingPage = () => {
  const { user, loading } = useAuth()

  // Get user info from Google metadata
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'

  return (
    <div 
      className="h-screen w-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: '#F6F3C2' }}
    >
      {/* Navbar */}
      <header className="w-full px-6 md:px-12 py-4 flex items-center justify-between border-b-2" style={{ borderColor: '#91C6BC' }}>
        <span className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: '#3D2B1F', fontFamily: 'Georgia, serif' }}>
          bookish<span style={{ color: '#E37434' }}>.ink</span>
        </span>
        
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
              <div className="hidden sm:flex items-center gap-2">
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
                    className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm"
                    style={{ borderColor: '#91C6BC', backgroundColor: '#FFFEF5', color: '#3D2B1F', fontFamily: 'Georgia, serif' }}
                  >
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm max-w-[80px] truncate" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>
                  {fullName.split(' ')[0]}
                </span>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row px-6 md:px-12 py-4 md:py-0 overflow-hidden">
        {/* Left Section - Text Content */}
        <div className="w-full md:w-[45%] flex flex-col justify-center md:pr-8">
          {/* Circular video badge with curved text */}
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="relative h-20 w-20 cursor-pointer hover:scale-105 transition-transform"
            >
              {/* SVG with curved text */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                {/* Define the circular path for text */}
                <defs>
                  <path
                    id="textCurve"
                    d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                    fill="none"
                  />
                </defs>
                {/* Curved text */}
                <text 
                  className="uppercase"
                  style={{ 
                    fontSize: '9px', 
                    letterSpacing: '3px',
                    fill: '#5C4033'
                  }}
                >
                  <textPath href="#textCurve" startOffset="0%">
                    • learn about us through this video •
                  </textPath>
                </text>
              </svg>
              {/* Center circle with play icon */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: '#3D2B1F', backgroundColor: '#F6F3C2' }}
              >
                <span className="text-base ml-0.5" style={{ color: '#3D2B1F' }}>▶</span>
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
            style={{ color: '#3D2B1F', fontFamily: 'Georgia, serif' }}
          >
            Write Your Story
            <br />
            <span style={{ color: '#4B9DA9' }}>Page by Page</span>
          </h1>

          {/* Subtext */}
          <p 
            className="mt-4 text-sm md:text-base max-w-md leading-relaxed"
            style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}
          >
            A distraction-free writing space where every page matters. 
            Create books, organize chapters, and let your creativity flow.
          </p>

          {/* CTA Button */}
          <Link
            to={user ? "/dashboard" : "/login"}
            className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all hover:scale-105 hover:shadow-lg w-fit"
            style={{ backgroundColor: '#4B9DA9', color: '#F6F3C2' }}
          >
            {user ? "Continue Writing" : "Start Writing"}
            <span className="text-lg">↗</span>
          </Link>

          {/* Testimonial Quote */}
          <div className="mt-8 md:mt-12">
            <div className="text-5xl md:text-6xl leading-none" style={{ color: '#91C6BC', fontFamily: 'Georgia, serif' }}>"</div>
            <p 
              className="text-sm md:text-base lg:text-lg italic max-w-sm leading-relaxed -mt-6"
              style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}
            >
              bookish helped me finish my first novel. The page-by-page approach 
              kept me focused and motivated every single day.
            </p>
            <p 
              className="mt-3 text-base md:text-lg"
              style={{ color: '#E37434' }}
            >
              Manasi ❤️
            </p>
          </div>
        </div>

        {/* Right Section - Visual Grid */}
        <div className="w-full md:w-[55%] flex items-center justify-center mt-6 md:mt-0 overflow-hidden">
          <div className="relative w-full max-w-xl h-[50vh] md:h-[75vh]">
            {/* Grid of colorful book cards */}
            
            {/* Card 1 - Top Left - Orange */}
            <div 
              className="absolute rounded-2xl overflow-hidden shadow-lg"
              style={{ 
                backgroundColor: '#E37434',
                width: '35%',
                height: '45%',
                top: '0%',
                left: '0%',
              }}
            >
              <div className="h-full w-full flex flex-col items-center justify-center p-4">
                <span className="text-6xl md:text-7xl">📖</span>
                <span className="mt-2 text-xs text-white/90 uppercase tracking-wider">Create</span>
              </div>
            </div>

            {/* Card 2 - Top Center - Teal */}
            <div 
              className="absolute rounded-2xl overflow-hidden shadow-lg"
              style={{ 
                backgroundColor: '#4B9DA9',
                width: '30%',
                height: '50%',
                top: '5%',
                left: '38%',
              }}
            >
              <div className="h-full w-full flex flex-col items-center justify-center p-4">
                <span className="text-5xl md:text-6xl">✍️</span>
                <span className="mt-2 text-xs text-white/90 uppercase tracking-wider">Write</span>
              </div>
            </div>

            {/* Card 3 - Top Right - Light Green */}
            <div 
              className="absolute rounded-2xl overflow-hidden shadow-lg"
              style={{ 
                backgroundColor: '#91C6BC',
                width: '28%',
                height: '40%',
                top: '0%',
                right: '0%',
              }}
            >
              <div className="h-full w-full flex flex-col items-center justify-center p-4">
                <span className="text-5xl md:text-6xl">📚</span>
                <span className="mt-2 text-xs uppercase tracking-wider" style={{ color: '#3D2B1F' }}>Collect</span>
              </div>
            </div>

            {/* Card 4 - Bottom Left - Cream */}
            <div 
              className="absolute rounded-2xl overflow-hidden shadow-lg"
              style={{ 
                backgroundColor: '#FFFEF5',
                width: '32%',
                height: '42%',
                bottom: '5%',
                left: '3%',
                border: '2px solid #91C6BC'
              }}
            >
              <div className="h-full w-full flex flex-col items-center justify-center p-4">
                <span className="text-5xl md:text-6xl">💡</span>
                <span className="mt-2 text-xs uppercase tracking-wider" style={{ color: '#5C4033' }}>Inspire</span>
              </div>
            </div>

            {/* Card 5 - Center - Featured Card */}
            <div 
              className="absolute rounded-2xl overflow-hidden shadow-2xl z-10"
              style={{ 
                backgroundColor: '#FFFEF5',
                width: '34%',
                height: '38%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: '2px solid #91C6BC'
              }}
            >
              <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
                <div 
                  className="text-3xl md:text-4xl font-bold"
                  style={{ color: '#3D2B1F', fontFamily: 'Georgia, serif' }}
                >
                  1000+
                </div>
                <span className="mt-1 text-xs uppercase tracking-wider" style={{ color: '#5C4033' }}>Stories Written</span>
                <div className="mt-3 flex -space-x-2">
                  <div className="h-6 w-6 rounded-full" style={{ backgroundColor: '#E37434' }} />
                  <div className="h-6 w-6 rounded-full" style={{ backgroundColor: '#4B9DA9' }} />
                  <div className="h-6 w-6 rounded-full" style={{ backgroundColor: '#91C6BC' }} />
                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: '#FFFEF5', border: '2px solid #91C6BC', color: '#5C4033' }}>+</div>
                </div>
              </div>
            </div>

            {/* Card 6 - Bottom Right - Dark Brown */}
            <div 
              className="absolute rounded-2xl overflow-hidden shadow-lg"
              style={{ 
                backgroundColor: '#3D2B1F',
                width: '30%',
                height: '45%',
                bottom: '0%',
                right: '0%',
              }}
            >
              <div className="h-full w-full flex flex-col items-center justify-center p-4">
                <span className="text-5xl md:text-6xl">🚀</span>
                <span className="mt-2 text-xs uppercase tracking-wider" style={{ color: '#F6F3C2' }}>Publish</span>
              </div>
            </div>

            {/* Floating decorative elements */}
            <div 
              className="absolute h-8 w-8 rounded-full animate-pulse"
              style={{ backgroundColor: '#E37434', top: '48%', left: '25%', opacity: 0.6 }}
            />
            <div 
              className="absolute h-4 w-4 rounded-full"
              style={{ backgroundColor: '#4B9DA9', bottom: '30%', right: '35%', opacity: 0.4 }}
            />
          </div>
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="w-full px-6 md:px-12 py-3 flex items-center justify-center border-t-2" style={{ borderColor: '#91C6BC' }}>
        <p className="text-md" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>
          Build with <span style={{ color: '#E37434' }}>❤️</span> of Manasi
        </p>
      </footer>
    </div>
  )
}

export default LandingPage
