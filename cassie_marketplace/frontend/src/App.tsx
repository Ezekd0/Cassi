import { useState, useEffect } from 'react'

// Define interfaces for listings, reviews, and authentication state
interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Listing {
  id: number;
  title: string;
  slug: string;
  category: string;
  price: number;
  region: string;
  google_map_url: string;
  description: string;
  main_image: string | null;
  video_url: string | null;
  is_verified: boolean;
  is_approved: boolean;
  status: 'available' | 'sold';
  contact_phone: string;
  created_at: string;
  car_year?: number;
  car_transmission?: string;
  car_cracks_faults?: string;
  house_bedrooms?: number;
  house_condition_integrity?: string;
  house_document?: string;
  art_medium?: string;
  land_size?: string;
  suit_size?: string;
  suit_material?: string;
  suit_style?: string;
  average_rating: number;
  review_count: number;
}

interface UserSession {
  isAuthenticated: boolean;
  username?: string;
  role: 'superuser' | 'manager' | 'visitor';
}

function App() {
  // --- Router & Auth State ---
  const [path, setPath] = useState(window.location.pathname)
  const [user, setUser] = useState<UserSession>({ isAuthenticated: false, role: 'visitor' })
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  // --- Get Notified Subscription State ---
  const [subscribeVal, setSubscribeVal] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribeMsg, setSubscribeMsg] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscribeVal) return
    setSubscribing(true)
    setSubscribeMsg('')
    try {
      const res = await fetch('/api/subscribe/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_info: subscribeVal }),
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSubscribeMsg('✓ You are subscribed to new drops!')
        setSubscribeVal('')
      } else {
        setSubscribeMsg(data.error || 'Failed to subscribe.')
      }
    } catch (err) {
      setSubscribeMsg('Network error. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  // Listen to popstate event for back/forward browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (to: string) => {
    window.history.pushState(null, '', to)
    setPath(to)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Check auth session status on mount
  useEffect(() => {
    fetch('/api/auth/me/', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.isAuthenticated) {
          setUser({
            isAuthenticated: true,
            username: data.user.username,
            role: data.user.role
          })
        } else {
          setUser({ isAuthenticated: false, role: 'visitor' })
        }
        setLoadingAuth(false)
      })
      .catch(() => {
        setUser({ isAuthenticated: false, role: 'visitor' })
        setLoadingAuth(false)
      })
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout/', { method: 'POST', credentials: 'include' })
      setUser({ isAuthenticated: false, role: 'visitor' })
      navigate('/')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  // --- Header Announcement Slider ---
  const pitches = [
    { text: "🏠 Hot Deal: Prime commercial land plots available in Osongama, Uyo", icon: "✨" },
    { text: "🚘 Superb Deal: Tokunbo vehicles fully cleared in Lagos", icon: "🔥" },
    { text: "🎨 Original Fine Art: Premium gallery framed abstract canvases", icon: "🖼️" },
    { text: "👔 Bespoke Luxury: Elegantly tailored Italian 3-piece suits", icon: "✂️" }
  ]
  const [pitchIndex, setPitchIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPitchIndex((prevIndex) => (prevIndex + 1) % pitches.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [pitches.length])

  // --- Rendering Routing ---
  const renderRoute = () => {
    if (loadingAuth) {
      return (
        <div className="loading-indicator">
          <div>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            Loading Cassie's Hub...
          </div>
        </div>
      )
    }

    if (path === '/' || path === '') {
      return <Home navigate={navigate} />
    }
    if (path === '/sold') {
      return <SoldPortfolio navigate={navigate} />
    }
    if (path === '/hidden-admin-portal') {
      return <Login user={user} setUser={setUser} navigate={navigate} />
    }
    if (path === '/admin-dashboard') {
      return <Dashboard user={user} navigate={navigate} />
    }
    if (path.startsWith('/listings/')) {
      const slug = path.split('/')[2]
      return <Detail slug={slug} navigate={navigate} />
    }

    return (
      <div className="empty-state">
        <h2 className="empty-state-title">Page Not Found</h2>
        <p className="empty-state-text">The requested resource could not be found.</p>
        <button onClick={() => navigate('/')} className="btn-submit-form" style={{ marginTop: '20px' }}>
          Back to Showroom
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Dynamic Announcement Ticker */}
      <div className="ticker-banner">
        {pitches.map((pitch, idx) => (
          <div key={idx} className={`ticker-text ${idx === pitchIndex ? 'active' : ''}`}>
            <span>{pitch.icon}</span> {pitch.text}
          </div>
        ))}
      </div>

      {/* Main Header / Nav */}
      <header className="main-header">
        <div className="nav-container">
          <div className="logo-anchor" onClick={() => navigate('/')}>
            CASSIE<span className="logo-accent">HUB</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="nav-links desktop-only">
            <span 
              className={`nav-item ${path === '/' ? 'active-primary' : ''}`} 
              onClick={() => navigate('/')}
            >
              Showroom
            </span>
            <span 
              className={`nav-item ${path === '/sold' ? 'active-primary' : ''}`} 
              onClick={() => navigate('/sold')}
            >
              Delivered Showcase
            </span>
            
            {user.isAuthenticated && (
              <>
                <span 
                  className={`nav-item ${path === '/admin-dashboard' ? 'active-primary' : ''}`} 
                  onClick={() => navigate('/admin-dashboard')}
                >
                  Dashboard
                </span>
                <span className="nav-item" style={{ color: 'var(--primary)', cursor: 'default' }}>
                  👤 {user.username} ({user.role})
                </span>
                <button className="btn-login" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <button 
            className={`hamburger-btn mobile-only ${menuOpen ? 'open' : ''}`} 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="mobile-nav-drawer">
            <span 
              className={`mobile-nav-item ${path === '/' ? 'active' : ''}`} 
              onClick={() => navigate('/')}
            >
              Showroom
            </span>
            <span 
              className={`mobile-nav-item ${path === '/sold' ? 'active' : ''}`} 
              onClick={() => navigate('/sold')}
            >
              Delivered Showcase
            </span>
            {user.isAuthenticated && (
              <>
                <span 
                  className={`mobile-nav-item ${path === '/admin-dashboard' ? 'active' : ''}`} 
                  onClick={() => navigate('/admin-dashboard')}
                >
                  Dashboard
                </span>
                <div className="mobile-user-info">
                  👤 {user.username} ({user.role})
                </div>
                <button className="btn-login" onClick={handleLogout} style={{ width: '100%', marginTop: '12px' }}>
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Page Body */}
      <main style={{ flex: 1, paddingTop: '75px' }}>
        {renderRoute()}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-brand">
            CASSIE<span className="logo-accent">HUB</span>
          </div>
          <p className="footer-pitch">
            High-ticket asset sourcing, expert tailoring, fine arts, and luxury property marketing. Hand-vetted and custom delivered.
          </p>

          {/* "Get Notified" Premium Newsletter Capture Form */}
          <div className="footer-subscribe-box">
            <h3 className="subscribe-title">GET NOTIFIED ON NEW DROPS</h3>
            <p className="subscribe-desc">Subscribe to WhatsApp or Email alerts for exclusive properties, vehicles, and tailored suits.</p>
            <form onSubmit={handleSubscribe} className="subscribe-form">
              <input
                type="text"
                placeholder="Email or WhatsApp number"
                value={subscribeVal}
                onChange={e => setSubscribeVal(e.target.value)}
                className="subscribe-input"
                required
              />
              <button type="submit" className="subscribe-btn" disabled={subscribing}>
                {subscribing ? "Subscribing..." : "Notify Me"}
              </button>
            </form>
            {subscribeMsg && <p className="subscribe-msg">{subscribeMsg}</p>}
          </div>

          <div className="footer-social-nodes">
            <a href="https://facebook.com" className="social-node-btn" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>
            <a href="https://tiktok.com" className="social-node-btn" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.72-.01 2.92.01 5.84-.02 8.75-.18 1.96-1.11 3.86-2.73 5.01-1.63 1.2-3.79 1.7-5.81 1.4-2.02-.27-3.92-1.42-5.06-3.13-1.2-1.74-1.57-4.04-1.04-6.11.5-2.01 1.84-3.8 3.71-4.7 1.83-.93 4.07-1.01 5.97-.22V9.43c-1.39-.67-3.09-.59-4.39.26-1.35.84-2.23 2.38-2.31 3.97-.13 1.6.58 3.25 1.84 4.21 1.24.99 2.99 1.25 4.5 0.72 1.51-.5 2.62-1.92 2.76-3.52.09-1.97.03-3.95.05-5.92-.01-3.04-.01-6.08-.01-9.12z"/>
              </svg>
            </a>
            <a href="https://instagram.com" className="social-node-btn" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
          </div>
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Cassie Marketing & Creative Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

// ==========================================
// 1. HOME VIEW (Active Listings Showroom)
// ==========================================
interface PageProps {
  user?: UserSession;
  navigate: (to: string) => void;
}

function Home({ navigate }: PageProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [category, setCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = category ? `/api/listings/?category=${category}` : '/api/listings/'
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setListings(data.listings)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch listings', err)
        setLoading(false)
      })
  }, [category])

  // Map backend categorisation to frontend display names
  const tabs = [
    { label: 'All Showroom', value: '' },
    { label: 'Suits', value: 'suits' },
    { label: 'Soaked (Art)', value: 'soaked' },
    { label: 'Houses', value: 'property' },
    { label: 'Cars', value: 'vehicle' }
  ]

  const categories = [
    { id: 'suits', name: 'Exclusive Suits', icon: '👔' },
    { id: 'soaked', name: 'Soaked (Fine Art)', icon: '🎨' },
    { id: 'property', name: 'Houses & Plots', icon: '🏠' },
    { id: 'vehicle', name: 'Premium Cars', icon: '🚘' }
  ]

  const renderedCategories = category
    ? [{ id: category, name: tabs.find(t => t.value === category)?.label || category, icon: '' }]
    : categories;

  return (
    <div>
      <section className="hero-section">
        <h1 className="hero-title">CASSIE'S LUXURY SHOWROOM</h1>
        <p className="hero-subtitle">
          Curated collection of high-ticket assets and premium items.
        </p>
      </section>

      {/* Tabs Menu */}
      <div className="tabs-container">
        <div className="tabs-wrapper">
          {tabs.map(tab => (
            <button
              key={tab.value}
              className={`tab-btn ${category === tab.value ? 'active' : ''}`}
              onClick={() => setCategory(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-container">
        {loading ? (
          <div className="loading-indicator">
            <div>
              <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
              Fetching active listings...
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state-title">No Listings Found</h2>
            <p className="empty-state-text">There are currently no items available in this category.</p>
          </div>
        ) : (
          renderedCategories.map(cat => {
            const catListings = category ? listings : listings.filter(item => item.category === cat.id);
            if (catListings.length === 0) return null;
            return (
              <div key={cat.id} className="category-group-section">
                <h2 className="category-section-title">{cat.icon} {cat.name}</h2>
                <div className="listings-grid swipeable-row">
                  {catListings.map(item => (
                    <ListingCard key={item.id} listing={item} onClick={() => navigate(`/listings/${item.slug}`)} />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ==========================================
// 2. DELIVERED SHOWCASE (Sold Listings)
// ==========================================
function SoldPortfolio({ navigate }: PageProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [category, setCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = category ? `/api/listings/sold/?category=${category}` : '/api/listings/sold/'
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setListings(data.listings)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch sold showcase', err)
        setLoading(false)
      })
  }, [category])

  const tabs = [
    { label: 'All Delivered', value: '' },
    { label: 'Suits', value: 'suits' },
    { label: 'Soaked (Art)', value: 'soaked' },
    { label: 'Houses', value: 'property' },
    { label: 'Cars', value: 'vehicle' }
  ]

  const categories = [
    { id: 'suits', name: 'Exclusive Suits', icon: '👔' },
    { id: 'soaked', name: 'Soaked (Fine Art)', icon: '🎨' },
    { id: 'property', name: 'Houses & Plots', icon: '🏠' },
    { id: 'vehicle', name: 'Premium Cars', icon: '🚘' }
  ]

  const renderedCategories = category
    ? [{ id: category, name: tabs.find(t => t.value === category)?.label || category, icon: '' }]
    : categories;

  return (
    <div>
      <section className="hero-section">
        <h1 className="hero-title">DELIVERED SHOWCASE</h1>
        <p className="hero-subtitle">
          Social proof portfolio of premium assets sourced, cleared, and successfully delivered by Cassie.
        </p>
      </section>

      {/* Tabs Menu */}
      <div className="tabs-container">
        <div className="tabs-wrapper">
          {tabs.map(tab => (
            <button
              key={tab.value}
              className={`tab-btn ${category === tab.value ? 'active' : ''}`}
              onClick={() => setCategory(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-container">
        {loading ? (
          <div className="loading-indicator">
            <div>
              <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
              Fetching sold showcase...
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state-title">No Delivered Assets</h2>
            <p className="empty-state-text">No listings marked as sold in this category yet.</p>
          </div>
        ) : (
          renderedCategories.map(cat => {
            const catListings = category ? listings : listings.filter(item => item.category === cat.id);
            if (catListings.length === 0) return null;
            return (
              <div key={cat.id} className="category-group-section">
                <h2 className="category-section-title">{cat.icon} {cat.name}</h2>
                <div className="listings-grid swipeable-row">
                  {catListings.map(item => (
                    <ListingCard key={item.id} listing={item} onClick={() => navigate(`/listings/${item.slug}`)} />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ==========================================
// LISTING CARD COMPONENT (The Bend Layout)
// ==========================================
interface CardProps {
  listing: Listing;
  onClick: () => void;
}

function ListingCard({ listing, onClick }: CardProps) {
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'suits': return 'Suit';
      case 'soaked': return 'Art';
      case 'property': return 'House';
      case 'vehicle': return 'Car';
      default: return cat;
    }
  }

  // Formatting price beautifully with commas
  const formatPrice = (p: number) => {
    if (listing.category === 'suits' || listing.category === 'soaked') {
      return `₦${p.toLocaleString()}`;
    }
    return `₦${p.toLocaleString()}`;
  }

  return (
    <div className="listing-card" onClick={onClick}>
      <div className="card-media-wrapper">
        <img 
          src={listing.main_image || '/static/images/placeholder.jpg'} 
          className="card-img" 
          alt={listing.title} 
        />
        <div className="badge-overlay">
          <span className="badge-item badge-category">
            {getCategoryLabel(listing.category)}
          </span>
          {listing.is_verified && (
            <span className="badge-item badge-verified">
              ✓ Verified
            </span>
          )}
          {!listing.is_approved && (
            <span className="badge-item badge-draft">
              Draft / Pending
            </span>
          )}
        </div>
      </div>
      
      {/* "The Bend" organic details container */}
      <div className="card-details-soil">
        <div className="card-location">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {listing.region}
        </div>
        
        <h3 className="card-title">{listing.title}</h3>
        
        {listing.average_rating > 0 && (
          <div className="star-rating-display" style={{ marginBottom: '8px' }}>
            {"★".repeat(Math.round(listing.average_rating)) + "☆".repeat(5 - Math.round(listing.average_rating))}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
              ({listing.average_rating}*)
            </span>
          </div>
        )}
        
        <div className="card-footer">
          <span className="card-price">{formatPrice(Number(listing.price))}</span>
          <button className="btn-card-cta">
            View Details
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. DETAIL VIEW (Polymorphic Specs & Reviews)
// ==========================================
interface DetailProps {
  slug: string;
  navigate: (to: string) => void;
}

function Detail({ slug, navigate }: DetailProps) {
  const [data, setData] = useState<{
    listing: Listing;
    reviews: Review[];
    similar_deals: Listing[];
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Review form states
  const [reviewerName, setReviewerName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')

  // Fetch listing details
  const fetchDetails = () => {
    setLoading(true)
    fetch(`/api/listings/${slug}/`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Listing not found or unauthorized')
        }
        return res.json()
      })
      .then(resData => {
        setData(resData)
        setError(null)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch listing detail', err)
        setError(err.message || 'Asset details loading error.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchDetails()
  }, [slug])



  // --- Submit Customer Review ---
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment) return
    setSubmittingReview(true)
    setReviewMessage('')

    try {
      const res = await fetch(`/api/listings/${slug}/reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_name: reviewerName || 'Anonymous',
          rating: rating,
          comment: comment
        }),
        credentials: 'include'
      })
      const resData = await res.json()
      if (resData.success) {
        setReviewMessage("✓ Review submitted successfully!")
        setReviewerName('')
        setComment('')
        setRating(5)
        fetchDetails()
      } else {
        setReviewMessage("Error: " + (resData.error || "Failed to submit review"))
      }
    } catch (err) {
      setReviewMessage("Network request failed")
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-indicator">
        <div>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          Loading asset details...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="detail-container">
        <div className="back-nav-bar">
          <button onClick={() => navigate('/')} className="btn-back-nav">
            ← Back to Showroom
          </button>
        </div>
        <div className="empty-state">
          <h2 className="empty-state-title">Listing Not Found</h2>
          <p className="empty-state-text">{error || "The requested listing details could not be parsed."}</p>
        </div>
      </div>
    )
  }

  const { listing, reviews, similar_deals } = data

  // WhatsApp click query link builder
  const whatsappUrl = `https://wa.me/${listing.contact_phone}?text=${encodeURIComponent(
    `Hi Cassie! I saw the listing "${listing.title}" (₦${Number(listing.price).toLocaleString()}) in Uyo/Lagos on your Hub. Is this available? Here is the link: ${window.location.href}`
  )}`

  return (
    <div className="detail-container">
      {/* Persistent Universal Safe Back-Navigation Framework */}
      <div className="back-nav-bar">
        <button 
          onClick={() => {
            if (listing.status === 'sold') {
              navigate('/sold')
            } else {
              navigate('/')
            }
          }} 
          className="btn-back-nav"
        >
          ← Back to {listing.status === 'sold' ? 'Delivered Showcase' : 'Marketplace Catalog'}
        </button>
      </div>

      <div className="detail-layout">
        {/* Left column: media */}
        <div className="detail-media-card">
          <img 
            src={listing.main_image || '/static/images/placeholder.jpg'} 
            className="detail-main-img" 
            alt={listing.title} 
          />
          {listing.video_url && (
            <div style={{ padding: '20px', borderTop: '1px solid var(--border-glass)', textAlign: 'center' }}>
              <a 
                href={listing.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-card-cta"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                🎥 Watch Video Presentation
              </a>
            </div>
          )}
        </div>

        {/* Right column: specifications & actions */}
        <div className="detail-panel">
          <div className="detail-header">
            <h1 className="detail-title">{listing.title}</h1>
            
            <div className="detail-meta-row">
              <span className="badge-item badge-category" style={{ position: 'static' }}>
                {listing.category === 'property' ? 'House / Land' : listing.category === 'vehicle' ? 'Car' : listing.category === 'soaked' ? 'Art' : 'Suit'}
              </span>
              {listing.is_verified && (
                <span className="badge-item badge-verified" style={{ position: 'static' }}>
                  ✓ Hand-Vetted By Cassie
                </span>
              )}
              {listing.status === 'sold' ? (
                <span className="badge-item" style={{ background: '#EF4444', color: '#FFF', position: 'static' }}>
                  Sold & Delivered
                </span>
              ) : (
                <span className="badge-item" style={{ background: '#10B981', color: '#FFF', position: 'static' }}>
                  Available
                </span>
              )}
            </div>

            <span className="detail-price-tag">
              ₦{Number(listing.price).toLocaleString()}
            </span>
          </div>

          {/* POLYMORPHIC SPECIALIZATION DETAILS PANEL */}
          <div className="spec-box">
            <h3 className="spec-title">Technical Specifications</h3>
            <div className="spec-list">
              <div className="spec-item">
                <span className="spec-label">Location / Hub</span>
                <span className="spec-val">{listing.region}</span>
              </div>

              {/* Real Estate / Property Specs */}
              {listing.category === 'property' && (
                <>
                  {listing.house_bedrooms !== null && listing.house_bedrooms !== undefined && (
                    <div className="spec-item">
                      <span className="spec-label">Bedrooms</span>
                      <span className="spec-val">{listing.house_bedrooms} Rooms (En-suite)</span>
                    </div>
                  )}
                  {listing.land_size && (
                    <div className="spec-item">
                      <span className="spec-label">Land Size</span>
                      <span className="spec-val">{listing.land_size}</span>
                    </div>
                  )}
                  {listing.house_document && (
                    <div className="spec-item">
                      <span className="spec-label">Legal Titles</span>
                      <span className="spec-val">{listing.house_document}</span>
                    </div>
                  )}
                </>
              )}

              {/* Cars Specs */}
              {listing.category === 'vehicle' && (
                <>
                  {listing.car_year && (
                    <div className="spec-item">
                      <span className="spec-label">Model Year</span>
                      <span className="spec-val">{listing.car_year}</span>
                    </div>
                  )}
                  {listing.car_transmission && (
                    <div className="spec-item">
                      <span className="spec-label">Transmission</span>
                      <span className="spec-val" style={{ textTransform: 'capitalize' }}>
                        {listing.car_transmission}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Suit Specs */}
              {listing.category === 'suits' && (
                <>
                  {listing.suit_size && (
                    <div className="spec-item">
                      <span className="spec-label">Fit Size</span>
                      <span className="spec-val">{listing.suit_size}</span>
                    </div>
                  )}
                  {listing.suit_material && (
                    <div className="spec-item">
                      <span className="spec-label">Wool Material</span>
                      <span className="spec-val">{listing.suit_material}</span>
                    </div>
                  )}
                  {listing.suit_style && (
                    <div className="spec-item">
                      <span className="spec-label">Tailoring Cut</span>
                      <span className="spec-val">{listing.suit_style}</span>
                    </div>
                  )}
                </>
              )}

              {/* Original Fine Art Specs */}
              {listing.category === 'soaked' && listing.art_medium && (
                <div className="spec-item">
                  <span className="spec-label">Art Medium</span>
                  <span className="spec-val">{listing.art_medium}</span>
                </div>
              )}
            </div>

            {/* CRACKS & STRUCTURAL INTEGRITY AUDIT LOGS */}
            {listing.category === 'property' && listing.house_condition_integrity && (
              <div className="spec-text-block">
                <span className="spec-text-label">🏠 Structural Integrity & Wall Cracks Assessment:</span>
                <p className="spec-text-content">{listing.house_condition_integrity}</p>
              </div>
            )}

            {listing.category === 'vehicle' && listing.car_cracks_faults && (
              <div className="spec-text-block">
                <span className="spec-text-label">🚘 Body Cracks & Computer Diagnostics Report:</span>
                <p className="spec-text-content">{listing.car_cracks_faults}</p>
              </div>
            )}
          </div>

          <div className="description-box">
            <h3 className="description-title">Overview</h3>
            <p className="description-text">{listing.description}</p>
          </div>

          <div className="contact-actions">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-contact-whatsapp">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.233-1.371a9.936 9.936 0 004.777 1.22c5.507 0 9.99-4.477 9.991-9.985C22.002 6.478 17.519 2 12.012 2zm0 17.117a8.106 8.106 0 01-4.137-1.127l-.297-.177-3.076.806.82-3.001-.194-.31a8.108 8.108 0 01-1.246-4.326c.001-4.469 3.64-8.105 8.131-8.105 4.488 0 8.127 3.636 8.128 8.106-.002 4.47-3.64 8.107-8.129 8.107zm4.457-6.091c-.244-.122-1.44-.71-1.662-.792-.222-.081-.383-.122-.544.122-.161.243-.623.792-.763.953-.14.161-.28.18-.524.059-.244-.122-1.03-.38-1.962-1.212-.725-.647-1.214-1.447-1.356-1.69-.142-.243-.015-.375.107-.496.11-.11.244-.284.366-.426.122-.142.162-.243.243-.406.082-.162.041-.304-.02-.426-.062-.122-.544-1.31-.746-1.795-.197-.474-.397-.41-.544-.418h-.466c-.161 0-.423.061-.644.304-.221.243-.845.826-.845 2.013s.865 2.33 1.057 2.585c.192.256 1.703 2.6 4.126 3.646.576.249 1.026.398 1.378.509.578.184 1.103.158 1.518.096.463-.069 1.44-.588 1.642-1.157.202-.569.202-1.056.141-1.157-.061-.101-.223-.162-.466-.284z" />
              </svg>
              Inquire on WhatsApp
            </a>
            {listing.google_map_url && (
              <a href={listing.google_map_url} target="_blank" rel="noopener noreferrer" className="btn-contact-map" aria-label="Google Maps Location">
                📍 Map
              </a>
            )}
          </div>
        </div>
      </div>

      {/* REVIEWS & FEEDBACK SYSTEM (Sold listings only) */}
      {listing.status === 'sold' && (
        <section className="reviews-section">
          <div className="reviews-header">
            <h2 className="reviews-title">Buyer Reviews & Endorsements ({reviews.length})</h2>
            {listing.average_rating > 0 && (
              <div className="star-rating-display">
                {"★".repeat(Math.round(listing.average_rating)) + "☆".repeat(5 - Math.round(listing.average_rating))}
                <span style={{ marginLeft: '8px', fontWeight: 700 }}>{listing.average_rating} out of 5 stars</span>
              </div>
            )}
          </div>

          <div className="reviews-grid">
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                No testimonials submitted for this delivery yet.
              </p>
            ) : (
              reviews.map(rev => (
                <div key={rev.id} className="review-card">
                  <div className="review-meta">
                    <div>
                      <span className="reviewer-name">{rev.reviewer_name}</span>
                      <div className="star-rating-display" style={{ marginTop: '4px' }}>
                        {"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
                      </div>
                    </div>
                    <span className="review-date">
                      {new Date(rev.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <p className="review-comment">“{rev.comment}”</p>
                </div>
              ))
            )}
          </div>

          {/* Form to submit review */}
          <div className="review-form-box">
            <h3 className="review-form-title">Submit Your Verified Delivery Endorsement</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="reviewer-name">Your Full Name (or Corporate Title)</label>
                <input 
                  id="reviewer-name"
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Chief John or Executive Director, Uyo" 
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rating Score</label>
                <div className="star-input-wrapper">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-input-btn ${rating >= star ? 'selected' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="review-comment">Review Comment / Testimonial</label>
                <textarea 
                  id="review-comment"
                  className="form-input" 
                  rows={4} 
                  required
                  placeholder="Tell us about the delivery, sizing accuracy, structural pass, or car diagnostic match..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                ></textarea>
              </div>

              {reviewMessage && (
                <div style={{ 
                  margin: '12px 0', 
                  color: reviewMessage.startsWith('✓') ? '#10B981' : '#EF4444',
                  fontWeight: 600
                }}>
                  {reviewMessage}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-submit-form" 
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting Testimonial...' : 'Post Testimonial'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* DISCOVER MORE CROSS-SELLING FEEDS */}
      {similar_deals.length > 0 && (
        <section className="discover-section">
          <h2 className="discover-title">Discover More Premium Offers</h2>
          <div className="listings-grid">
            {similar_deals.map(item => (
              <ListingCard key={item.id} listing={item} onClick={() => navigate(`/listings/${item.slug}`)} />
            ))}
          </div>
        </section>
      )}

    </div>
  )
}

// ==========================================
// 3.5 ADMIN DASHBOARD VIEW
// ==========================================
interface DashboardProps {
  user: UserSession;
  navigate: (to: string) => void;
}

interface AnalyticsData {
  total_views: number;
  active_browsers: number;
  popular_listings: Array<{
    id: number;
    title: string;
    slug: string;
    category: string;
    price: number;
    status: 'available' | 'sold';
    view_count: number;
    is_approved: boolean;
  }>;
  all_listings: Listing[];
  all_reviews: Array<{
    id: number;
    listing_title: string;
    listing_slug: string;
    reviewer_name: string;
    rating: number;
    comment: string;
    created_at: string;
  }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  suits: 'Suits',
  soaked: 'Soaked (Art)',
  property: 'Houses',
  vehicle: 'Cars'
};

function Dashboard({ user, navigate }: DashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview')

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/', { credentials: 'include' })
      if (!res.ok) {
        if (res.status === 403) {
          navigate('/hidden-admin-portal')
          return
        }
        throw new Error('Failed to load analytics data')
      }
      const resData = await res.json()
      setData(resData)
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Analytics load failure')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user.isAuthenticated || user.role === 'visitor') {
      navigate('/hidden-admin-portal')
      return
    }
    fetchAnalytics()
  }, [user.isAuthenticated, user.role])

  const handleApproveListing = async (slug: string) => {
    if (!window.confirm("Approve this listing and publish it to the showroom?")) return
    try {
      const res = await fetch(`/api/listings/${slug}/approve/`, { method: 'POST', credentials: 'include' })
      const resData = await res.json()
      if (resData.success) {
        alert("Listing approved successfully!")
        fetchAnalytics()
      } else {
        alert("Error: " + (resData.error || "Failed to approve"))
      }
    } catch (err) {
      alert("Network request failed")
    }
  }

  const handleToggleStatus = async (slug: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available'
    const confirmMsg = newStatus === 'sold' 
      ? "Mark this listing as Sold & Delivered?" 
      : "Mark this listing as Available again?"
    if (!window.confirm(confirmMsg)) return
    
    try {
      const res = await fetch(`/api/listings/${slug}/toggle-status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      })
      const resData = await res.json()
      if (resData.success) {
        alert("Status updated successfully!")
        fetchAnalytics()
      } else {
        alert("Error: " + (resData.error || "Failed to update status"))
      }
    } catch (err) {
      alert("Network request failed")
    }
  }

  const handleCategoryChange = async (slug: string, newCat: string) => {
    try {
      const res = await fetch(`/api/listings/${slug}/change-category/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCat }),
        credentials: 'include'
      })
      const resData = await res.json()
      if (resData.success) {
        alert(`Category updated to ${newCat}!`)
        fetchAnalytics()
      } else {
        alert("Error: " + (resData.error || "Failed to change category"))
      }
    } catch (err) {
      alert("Network request failed")
    }
  }

  const handleDeleteListing = async (slug: string) => {
    if (!window.confirm("⚠️ WARNING: Are you sure you want to permanently delete this listing?")) return
    try {
      const res = await fetch(`/api/listings/${slug}/delete/`, { method: 'POST', credentials: 'include' })
      const resData = await res.json()
      if (resData.success) {
        alert("Listing deleted successfully.")
        fetchAnalytics()
      } else {
        alert("Error: " + (resData.error || "Failed to delete listing"))
      }
    } catch (err) {
      alert("Network request failed")
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) return
    try {
      const res = await fetch(`/api/reviews/${reviewId}/delete/`, { method: 'POST', credentials: 'include' })
      const resData = await res.json()
      if (resData.success) {
        alert("Review deleted successfully.")
        fetchAnalytics()
      } else {
        alert("Error: " + (resData.error || "Failed to delete review"))
      }
    } catch (err) {
      alert("Network request failed")
    }
  }

  if (loading) {
    return (
      <div className="loading-indicator">
        <div>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          Loading Admin Control Desk...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="catalog-container" style={{ marginTop: '40px' }}>
        <div className="empty-state">
          <h2 className="empty-state-title">Control Desk Error</h2>
          <p className="empty-state-text">{error || "Failed to initialize analytics console."}</p>
          <button onClick={fetchAnalytics} className="btn-submit-form" style={{ marginTop: '20px' }}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-bar">
        <div>
          <h1 className="dashboard-title">Private Management Console</h1>
          <p className="dashboard-subtitle">Super Admin / Manager Desk for Cassie's Showroom</p>
        </div>
        <div className="dashboard-quick-actions">
          <button onClick={fetchAnalytics} className="btn-admin-action btn-admin-success">
            🔄 Refresh Console
          </button>
        </div>
      </div>

      {/* Traffic Analytics Panel */}
      <section className="analytics-section">
        <h2 className="dashboard-section-title">📊 Live Traffic Analytics</h2>
        <div className="analytics-metrics-grid">
          <div className="metric-card">
            <span className="metric-title">Total Site Traffic</span>
            <span className="metric-value">{data.total_views.toLocaleString()}</span>
            <span className="metric-desc">Lifetime Page Views</span>
          </div>
          <div className="metric-card active-browsers">
            <span className="metric-title">Active Browsers Right Now</span>
            <span className="metric-value">{data.active_browsers}</span>
            <span className="metric-desc">Unique sessions in last 15 min</span>
          </div>
          <div className="metric-card">
            <span className="metric-title">Available Inventory</span>
            <span className="metric-value">
              {data.all_listings.filter(l => l.status === 'available').length}
            </span>
            <span className="metric-desc">Items in Showroom</span>
          </div>
          <div className="metric-card">
            <span className="metric-title">Delivered Assets</span>
            <span className="metric-value">
              {data.all_listings.filter(l => l.status === 'sold').length}
            </span>
            <span className="metric-desc">Successful transactions</span>
          </div>
        </div>

        {/* Popular Listings Subpanel */}
        <div className="dashboard-card">
          <h3 className="card-inner-title">🔥 Most Viewed Listings</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Views</th>
                </tr>
              </thead>
              <tbody>
                {data.popular_listings.map(item => (
                  <tr key={item.id}>
                    <td 
                      onClick={() => navigate(`/listings/${item.slug}`)} 
                      style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-light)' }}
                      className="hover-underline"
                    >
                      {item.title}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {CATEGORY_LABELS[item.category] || item.category}
                    </td>
                    <td>₦{Number(item.price).toLocaleString()}</td>
                    <td>
                      <span className={`status-pill ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      👁️ {item.view_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Navigation Submenu tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`dash-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Inventory & Control
        </button>
        <button 
          className={`dash-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Review Moderation ({data.all_reviews.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <section className="inventory-section">
          <div className="dashboard-card">
            <h3 className="card-inner-title">📦 Total Inventory & Status Control Desk</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Asset Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Public Visibility</th>
                    <th>Move Category</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.all_listings.map(item => (
                    <tr key={item.id}>
                      <td 
                        onClick={() => navigate(`/listings/${item.slug}`)} 
                        style={{ cursor: 'pointer', fontWeight: 600 }}
                        className="hover-underline"
                      >
                        {item.title}
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </td>
                      <td>₦{Number(item.price).toLocaleString()}</td>
                      <td>
                        <span className={`status-pill ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.is_approved ? (
                          <span style={{ color: '#10B981', fontWeight: 700 }}>✓ Pushed Live</span>
                        ) : (
                          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>⏳ Draft / Pending</span>
                        )}
                      </td>
                      <td>
                        <select
                          className="admin-select-sm"
                          value={item.category}
                          onChange={e => handleCategoryChange(item.slug, e.target.value)}
                        >
                          <option value="suits">Suits</option>
                          <option value="soaked">Soaked (Art)</option>
                          <option value="property">Houses</option>
                          <option value="vehicle">Cars</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {!item.is_approved && (
                            <button 
                              onClick={() => handleApproveListing(item.slug)}
                              className="btn-admin-action btn-admin-success"
                            >
                              🚀 Approve
                            </button>
                          )}
                          <button 
                            onClick={() => handleToggleStatus(item.slug, item.status)}
                            className="btn-admin-action"
                          >
                            {item.status === 'available' ? 'Mark Sold' : 'Mark Available'}
                          </button>
                          <button 
                            onClick={() => handleDeleteListing(item.slug)}
                            className="btn-admin-action btn-admin-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'reviews' && (
        <section className="reviews-moderation-section">
          <div className="dashboard-card">
            <h3 className="card-inner-title">💬 Customer Reviews Moderation</h3>
            {data.all_reviews.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>
                No testimonials/reviews have been submitted yet.
              </p>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Listing</th>
                      <th>Reviewer</th>
                      <th>Rating</th>
                      <th>Comment</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.all_reviews.map(rev => (
                      <tr key={rev.id}>
                        <td 
                          onClick={() => navigate(`/listings/${rev.listing_slug}`)}
                          style={{ cursor: 'pointer', fontWeight: 600 }}
                          className="hover-underline"
                        >
                          {rev.listing_title}
                        </td>
                        <td>{rev.reviewer_name}</td>
                        <td style={{ color: '#FFE600', fontSize: '1.1rem', letterSpacing: '2px' }}>
                          {"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
                        </td>
                        <td style={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          “{rev.comment}”
                        </td>
                        <td>
                          {new Date(rev.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteReview(rev.id)}
                            className="btn-admin-action btn-admin-danger"
                          >
                            Delete Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

// ==========================================
// 4. MANAGER LOGIN VIEW
// ==========================================
interface LoginProps {
  user: UserSession;
  setUser: (session: UserSession) => void;
  navigate: (to: string) => void;
}

function Login({ user, setUser, navigate }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (user.isAuthenticated) {
      navigate('/admin-dashboard')
    }
  }, [user.isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      })
      
      const data = await res.json()
      if (res.ok && data.success) {
        setUser({
          isAuthenticated: true,
          username: data.user.username,
          role: data.user.role
        })
        navigate('/admin-dashboard')
      } else {
        setError(data.error || 'Invalid manager credentials.')
      }
    } catch (err) {
      console.error(err)
      setError('Connection refused. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h1 className="login-title">Control Desk</h1>
      <p className="login-subtitle">Sign in with Cassie's Manager account or Admin credentials</p>

      {error && (
        <div style={{ color: '#EF4444', marginBottom: '16px', fontWeight: 600, fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-username">Username</label>
          <input 
            id="login-username"
            type="text" 
            className="form-input" 
            placeholder="cassie or admin" 
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '28px' }}>
          <label className="form-label" htmlFor="login-password">Password</label>
          <input 
            id="login-password"
            type="password" 
            className="form-input" 
            placeholder="••••••••" 
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          className="btn-submit-form" 
          style={{ width: '100%', padding: '14px' }}
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default App
