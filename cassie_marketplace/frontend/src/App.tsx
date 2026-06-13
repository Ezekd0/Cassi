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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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



  // --- Rendering Routing ---
  const renderRoute = () => {
    if (loadingAuth) {
      return (
        <div className="loading-indicator">
          <div>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            Initializing Sourcing Desk...
          </div>
        </div>
      )
    }

    if (path === '/' || path === '') {
      return <Home navigate={navigate} />
    }
    if (path === '/properties') {
      return <Properties navigate={navigate} />
    }
    if (path === '/vehicles') {
      return <Vehicles navigate={navigate} />
    }
    if (path === '/collections') {
      return <CollectionsPage navigate={navigate} />
    }
    if (path === '/portfolio') {
      return <SoldPortfolio navigate={navigate} />
    }
    if (path === '/about') {
      return <About navigate={navigate} />
    }
    if (path === '/contact') {
      return <ContactPage navigate={navigate} />
    }
    if (path === '/sourcing-request') {
      return <SourcingRequest navigate={navigate} />
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
      {/* Main Header / Nav */}
      <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo-anchor" onClick={() => navigate('/')}>
            NOX<span className="logo-accent">HUB</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="nav-links desktop-only">
            <span 
              className={`nav-item ${path === '/' ? 'active-primary' : ''}`} 
              onClick={() => navigate('/')}
            >
              Home
            </span>
            <span 
              className={`nav-item ${path === '/properties' ? 'active-primary' : ''}`} 
              onClick={() => navigate('/properties')}
            >
              Properties
            </span>
            <span 
              className={`nav-item ${path === '/vehicles' ? 'active-primary' : ''}`} 
              onClick={() => navigate('/vehicles')}
            >
              Vehicles
            </span>
            <span 
              className={`nav-item ${path === '/collections' ? 'active-primary' : ''}`} 
              onClick={() => navigate('/collections')}
            >
              Collections
            </span>
            <span 
              className={`nav-item ${path === '/portfolio' ? 'active-primary' : ''}`} 
              onClick={() => navigate('/portfolio')}
            >
              Portfolio
            </span>
            <span 
              className={`nav-item ${path === '/about' ? 'active-primary' : ''}`} 
              onClick={() => navigate('/about')}
            >
              About
            </span>
            <span 
              className={`nav-item ${path === '/contact' ? 'active-primary' : ''}`} 
              onClick={() => navigate('/contact')}
            >
              Contact
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
                  👤 {user.username}
                </span>
                <button className="btn-login" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </nav>

          {/* Header Action Button on Desktop */}
          <div className="header-action desktop-only">
            <button 
              onClick={() => navigate('/sourcing-request')} 
              className="btn-header-contact"
            >
              Request Sourcing
            </button>
          </div>

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
              Home
            </span>
            <span 
              className={`mobile-nav-item ${path === '/properties' ? 'active' : ''}`} 
              onClick={() => navigate('/properties')}
            >
              Properties
            </span>
            <span 
              className={`mobile-nav-item ${path === '/vehicles' ? 'active' : ''}`} 
              onClick={() => navigate('/vehicles')}
            >
              Vehicles
            </span>
            <span 
              className={`mobile-nav-item ${path === '/collections' ? 'active' : ''}`} 
              onClick={() => navigate('/collections')}
            >
              Collections
            </span>
            <span 
              className={`mobile-nav-item ${path === '/portfolio' ? 'active' : ''}`} 
              onClick={() => navigate('/portfolio')}
            >
              Portfolio
            </span>
            <span 
              className={`mobile-nav-item ${path === '/about' ? 'active' : ''}`} 
              onClick={() => navigate('/about')}
            >
              About
            </span>
            <span 
              className={`mobile-nav-item ${path === '/contact' ? 'active' : ''}`} 
              onClick={() => navigate('/contact')}
            >
              Contact
            </span>
            <span 
              className={`mobile-nav-item ${path === '/sourcing-request' ? 'active' : ''}`} 
              onClick={() => navigate('/sourcing-request')}
            >
              Request Sourcing
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
      <main style={{ flex: 1, paddingTop: '80px' }}>
        {renderRoute()}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-brand">
            NOX<span className="logo-accent">HUB</span>
          </div>
          <p className="footer-pitch">
            Luxury Assets & Exclusive Sourcing. Curated Acquisition and Private Advisory.
          </p>

          {/* "Get Notified" Premium Capturer */}
          <div className="footer-subscribe-box">
            <h3 className="subscribe-title">GET NOTIFIED ON NEW DROPS</h3>
            <p className="subscribe-desc">Subscribe to WhatsApp or Email alerts for exclusive properties, vehicles, and fashion collections.</p>
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

          <div className="footer-contact-details">
            <p>📍 Osongama, Uyo / Ikeja, Lagos</p>
            <p>📞 +234 814 871 4875 &bull; ✉️ acquire@noxhub.com</p>
          </div>

          <div className="footer-social-nodes">
            <a href="https://instagram.com" className="social-node-btn" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            <a href="https://facebook.com" className="social-node-btn" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>
          </div>
          <p className="footer-copyright">
            &copy; 2026 NOXHUB. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

// Duplicate Home component removed.

// ==========================================
// 2. DELIVERED SHOWCASE (Sold Listings)
// ==========================================
interface SoldPortfolioProps {
  navigate: (to: string) => void;
}

function SoldPortfolio({ navigate }: SoldPortfolioProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'property' | 'vehicle' | 'collections'>('all');

  useEffect(() => {
    fetch('/api/listings/sold/')
      .then(res => res.json())
      .then(data => {
        setListings(data.listings);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch sold showcase', err);
        setLoading(false);
      });
  }, []);

  const filtered = listings.filter(l => {
    if (activeTab === 'all') return true;
    if (activeTab === 'property' && l.category === 'property') return true;
    if (activeTab === 'vehicle' && l.category === 'vehicle') return true;
    if (activeTab === 'collections' && (l.category === 'suits' || l.category === 'soaked')) return true;
    return false;
  });

  return (
    <div className="showroom-view-container portfolio-page-view">
      <div className="showroom-header page-hero-banner portfolio-hero" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="section-subtitle">DELIVERED PROJECTS</span>
        <h2 className="showroom-category-title">Recent Acquisitions</h2>
        <p className="showroom-category-subtitle">Social proof portfolio of premium assets vetted, acquired, and successfully delivered by NOXHUB.</p>
      </div>

      <div className="tabs-container">
        <div className="tabs-wrapper">
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Deliveries</button>
          <button className={`tab-btn ${activeTab === 'property' ? 'active' : ''}`} onClick={() => setActiveTab('property')}>Properties</button>
          <button className={`tab-btn ${activeTab === 'vehicle' ? 'active' : ''}`} onClick={() => setActiveTab('vehicle')}>Vehicles</button>
          <button className={`tab-btn ${activeTab === 'collections' ? 'active' : ''}`} onClick={() => setActiveTab('collections')}>Collections</button>
        </div>
      </div>

      <div className="catalog-container">
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state-title">No Recent Transactions</h2>
            <p className="empty-state-text">No success stories currently matching this category.</p>
          </div>
        ) : (
          <div>
            <div className="listings-grid">
              {filtered.map(item => (
                <ListingCard key={item.id} listing={item} onClick={() => navigate(`/listings/${item.slug}`)} />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <button onClick={() => navigate('/sourcing-request')} className="btn-hero-secondary">
                View More Acquisitions
              </button>
            </div>
          </div>
        )}
      </div>

      <ContactCTA />
    </div>
  );
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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState('');

  const fetchDetails = () => {
    setLoading(true);
    fetch(`/api/listings/${slug}/`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Listing not found');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setActiveImage(resData.listing.main_image);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch detail', err);
        setError(err.message || 'Error loading details.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDetails();
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;
    setSubmittingReview(true);
    setReviewMessage('');
    try {
      const res = await fetch(`/api/listings/${slug}/reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_name: reviewerName || 'Anonymous',
          rating,
          comment
        })
      });
      const resData = await res.json();
      if (resData.success) {
        setReviewMessage('✓ Testimonial submitted successfully!');
        setReviewerName('');
        setComment('');
        setRating(5);
        fetchDetails();
      } else {
        setReviewMessage('Error: ' + (resData.error || 'Failed to submit'));
      }
    } catch {
      setReviewMessage('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryStatus('Sending Sourcing lead...');
    setTimeout(() => {
      setInquiryStatus('✓ Sourcing Desk received your inquiry. We will contact you shortly.');
      setInquiryName('');
      setInquiryEmail('');
      setInquiryMsg('');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="detail-container">
        <div className="back-nav-bar">
          <button onClick={() => navigate('/')} className="btn-back-nav">&larr; Back</button>
        </div>
        <div className="empty-state">
          <h2 className="empty-state-title">Listing Not Found</h2>
          <p className="empty-state-text">{error || 'Unable to retrieve data.'}</p>
        </div>
      </div>
    );
  }

  const { listing, reviews, similar_deals } = data;
  const whatsappUrl = `https://wa.me/${listing.contact_phone}?text=${encodeURIComponent(
    `Hi NOXHUB! I saw the listing "${listing.title}" (₦${listing.price.toLocaleString()}) on your platform. Is this available? Here is the link: ${window.location.href}`
  )}`;

  const mockThumbnails = [
    listing.main_image,
    listing.main_image,
    listing.main_image,
    listing.main_image,
    listing.main_image
  ].filter(Boolean) as string[];

  if (listing.category === 'property') {
    return (
      <div className="detail-container property-details-view">
        <div className="back-nav-bar">
          <button onClick={() => navigate('/properties')} className="btn-back-nav">&larr; Back to Properties</button>
        </div>

        <div className="detail-layout">
          <div className="detail-media-card">
            <img src={activeImage || '/static/images/placeholder.jpg'} className="detail-main-img" alt={listing.title} />
            <div className="thumbnail-track-lux">
              {mockThumbnails.map((thumb, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(thumb)} 
                  className={`thumbnail-btn-lux ${activeImage === thumb ? 'active' : ''}`}
                >
                  <img src={thumb} alt={`View ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="detail-panel">
            <span className="badge-item badge-verified">📍 {listing.region}</span>
            <h1 className="detail-title">{listing.title}</h1>
            <span className="detail-price-tag">₦{listing.price.toLocaleString()}</span>
            
            <div className="specifications-icon-row">
              <div className="spec-icon-box">
                <span className="spec-icon">🛏️</span>
                <span className="spec-val-lux">{listing.house_bedrooms || 4} Beds</span>
              </div>
              <div className="spec-icon-box">
                <span className="spec-icon">🛁</span>
                <span className="spec-val-lux">4.5 Baths</span>
              </div>
              <div className="spec-icon-box">
                <span className="spec-icon">📐</span>
                <span className="spec-val-lux">{listing.land_size || '600 sqm'}</span>
              </div>
              <div className="spec-icon-box">
                <span className="spec-icon">🚗</span>
                <span className="spec-val-lux">3 Cars</span>
              </div>
            </div>

            <div className="description-box">
              <h3 className="description-title">Overview</h3>
              <p className="description-text">{listing.description}</p>
            </div>

            <div className="features-checklist-box">
              <h3 className="description-title">Property Features</h3>
              <ul className="features-grid-columns">
                <li>✓ Smart Home Automation</li>
                <li>✓ 24/7 Power Security</li>
                <li>✓ Swimming Pool with filter</li>
                <li>✓ CCTV Surveillance</li>
                <li>✓ Chef's Fitted Kitchen</li>
                <li>✓ Certificate of Occupancy</li>
              </ul>
            </div>

            {listing.house_condition_integrity && (
              <div className="spec-text-block">
                <span className="spec-text-label">🏠 Structural Integrity & wall crack audit:</span>
                <p className="spec-text-content">{listing.house_condition_integrity}</p>
              </div>
            )}

            <div className="agent-sourcing-section">
              <h4>Acquisitions Advisory Desk</h4>
              <div className="contact-actions side-by-side-ctas">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-contact-whatsapp">
                  WhatsApp Agent
                </a>
                <a href={`mailto:acquire@noxhub.com?subject=Viewing%20Request%20-%20${encodeURIComponent(listing.title)}`} className="btn-contact-map">
                  Request Viewing
                </a>
              </div>
            </div>
          </div>
        </div>

        {similar_deals.filter(s => s.category === 'property').length > 0 && (
          <section className="discover-section">
            <h2 className="discover-title">Related Properties</h2>
            <div className="listings-grid">
              {similar_deals.filter(s => s.category === 'property').slice(0, 3).map(item => (
                <ListingCard key={item.id} listing={item} onClick={() => navigate(`/listings/${item.slug}`)} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="detail-container vehicle-details-view">
      <div className="back-nav-bar">
        <button onClick={() => navigate('/vehicles')} className="btn-back-nav">&larr; Back to Vehicles</button>
      </div>

      <div className="detail-layout">
        <div className="detail-media-card">
          <img src={activeImage || '/static/images/placeholder.jpg'} className="detail-main-img" alt={listing.title} />
          <div className="thumbnail-track-lux">
            {mockThumbnails.map((thumb, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(thumb)} 
                className={`thumbnail-btn-lux ${activeImage === thumb ? 'active' : ''}`}
              >
                <img src={thumb} alt={`View ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-panel">
          <span className="badge-item badge-verified">📍 {listing.region}</span>
          <h1 className="detail-title">{listing.title}</h1>
          <span className="detail-price-tag">₦{listing.price.toLocaleString()}</span>

          <div className="spec-box">
            <h3 className="spec-title">Vehicle Specifications</h3>
            <div className="spec-list">
              <div className="spec-item">
                <span className="spec-label">Year</span>
                <span className="spec-val">{listing.car_year || 2021}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Transmission</span>
                <span className="spec-val" style={{ textTransform: 'capitalize' }}>{listing.car_transmission || 'Automatic'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Engine</span>
                <span className="spec-val">Turbocharged V6 / 4-Cylinder</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Status</span>
                <span className="spec-val" style={{ textTransform: 'capitalize' }}>{listing.status}</span>
              </div>
            </div>

            {listing.car_cracks_faults && (
              <div className="spec-text-block">
                <span className="spec-text-label">🚘 Diagnostic scan & windshield check:</span>
                <p className="spec-text-content">{listing.car_cracks_faults}</p>
              </div>
            )}
          </div>

          <div className="description-box">
            <h3 className="description-title">Description</h3>
            <p className="description-text">{listing.description}</p>
          </div>

          <div className="contact-seller-box" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '24px', marginTop: '24px' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Sourcing Inquiries</h4>
            <div className="contact-actions" style={{ marginBottom: '24px' }}>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-contact-whatsapp" style={{ flex: 1 }}>
                WhatsApp Seller
              </a>
              <a href="tel:+2348148714875" className="btn-contact-map" style={{ padding: '14px 20px' }}>
                📞 Call
              </a>
            </div>

            <form onSubmit={handleInquirySubmit}>
              <h5 style={{ color: 'var(--text-light)', marginBottom: '12px' }}>Inquiry Form</h5>
              <div className="form-group">
                <input type="text" className="form-input" required placeholder="Your Name" value={inquiryName} onChange={e => setInquiryName(e.target.value)} />
              </div>
              <div className="form-group">
                <input type="email" className="form-input" required placeholder="Your Email" value={inquiryEmail} onChange={e => setInquiryEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <textarea className="form-input" rows={3} required placeholder="Acquisition requirements or viewing requests..." value={inquiryMsg} onChange={e => setInquiryMsg(e.target.value)}></textarea>
              </div>
              {inquiryStatus && <p style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>{inquiryStatus}</p>}
              <button type="submit" className="btn-submit-form" style={{ width: '100%' }}>Submit Sourcing Inquiry</button>
            </form>
          </div>
        </div>
      </div>

      {listing.status === 'sold' && (
        <section className="reviews-section">
          <div className="reviews-header">
            <h2 className="reviews-title">Delivery Endorsements ({reviews.length})</h2>
          </div>
          <div className="reviews-grid">
            {reviews.map(rev => (
              <div key={rev.id} className="review-card">
                <div className="review-meta">
                  <span className="reviewer-name">{rev.reviewer_name}</span>
                  <span className="review-date">{new Date(rev.created_at).toLocaleDateString()}</span>
                </div>
                <p className="review-comment">“{rev.comment}”</p>
              </div>
            ))}
          </div>

          <div className="review-form-box">
            <h3>Add Sourcing Testimonial</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" value={reviewerName} onChange={e => setReviewerName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Review Comment</label>
                <textarea className="form-input" rows={4} required value={comment} onChange={e => setComment(e.target.value)}></textarea>
              </div>
              {reviewMessage && <p style={{ color: 'var(--primary)', fontWeight: 600 }}>{reviewMessage}</p>}
              <button type="submit" className="btn-submit-form" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Testimonial'}
              </button>
            </form>
          </div>
        </section>
      )}

      {similar_deals.filter(s => s.category === 'vehicle').length > 0 && (
        <section className="discover-section">
          <h2 className="discover-title">Related Vehicles</h2>
          <div className="listings-grid">
            {similar_deals.filter(s => s.category === 'vehicle').slice(0, 3).map(item => (
              <ListingCard key={item.id} listing={item} onClick={() => navigate(`/listings/${item.slug}`)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


// ==========================================
// CONTACT CALL-TO-ACTION (Visual Strength before Footer)
// ==========================================
function ContactCTA() {
  const whatsappUrl = "https://wa.me/2348148714875?text=Hi%20LOOKUP!%20I%20am%20interested%20in%20initiating%20a%20private%20sourcing%20request.";

  return (
    <section id="contact-lookup" className="contact-cta-section-lux">
      <div className="contact-cta-card">
        <h2 className="contact-cta-title">Ready To Acquire Something Exceptional?</h2>
        <p className="contact-cta-desc">
          Initiate a private consulting conversation with our sourcing desk. Absolute discretion guaranteed.
        </p>
        <div className="contact-cta-buttons">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-contact-lux-whatsapp">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.233-1.371a9.936 9.936 0 004.777 1.22c5.507 0 9.99-4.477 9.991-9.985C22.002 6.478 17.519 2 12.012 2zm0 17.117a8.106 8.106 0 01-4.137-1.127l-.297-.177-3.076.806.82-3.001-.194-.31a8.108 8.108 0 01-1.246-4.326c.001-4.469 3.64-8.105 8.131-8.105 4.488 0 8.127 3.636 8.128 8.106-.002 4.47-3.64 8.107-8.129 8.107zm4.457-6.091c-.244-.122-1.44-.71-1.662-.792-.222-.081-.383-.122-.544.122-.161.243-.623.792-.763.953-.14.161-.28.18-.524.059-.244-.122-1.03-.38-1.962-1.212-.725-.647-1.214-1.447-1.356-1.69-.142-.243-.015-.375.107-.496.11-.11.244-.284.366-.426.122-.142.162-.243.243-.406.082-.162.041-.304-.02-.426-.062-.122-.544-1.31-.746-1.795-.197-.474-.397-.41-.544-.418h-.466c-.161 0-.423.061-.644.304-.221.243-.845.826-.845 2.013s.865 2.33 1.057 2.585c.192.256 1.703 2.6 4.126 3.646.576.249 1.026.398 1.378.509.578.184 1.103.158 1.518.096.463-.069 1.44-.588 1.642-1.157.202-.569.202-1.056.141-1.157-.061-.101-.223-.162-.466-.284z" />
            </svg>
            WhatsApp Sourcing Desk
          </a>
          <a href="mailto:acquire@lookup.com?subject=Private%20Sourcing%20Request" className="btn-contact-lux-primary">
            Request Sourcing
          </a>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 1. HOME VIEW (Active Listings Showroom)
// ==========================================
interface HomeProps {
  navigate: (to: string) => void;
}

function Home({ navigate }: HomeProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/listings/')
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch listings', err);
        setLoading(false);
      });
  }, []);

  const properties = listings.filter((l) => l.category === 'property').slice(0, 3);
  const vehicles = listings.filter((l) => l.category === 'vehicle').slice(0, 3);
  const soldListings = listings.filter((l) => l.status === 'sold').slice(0, 4);

  return (
    <div>
      {/* SECTION 1 - HERO */}
      <section className="hero-split-container">
        <div className="hero-text-side">
          <span className="hero-brand-name">NOXHUB</span>
          <h1 className="hero-tagline-split">Luxury Assets.<br />Curated Exclusively.</h1>
          <p className="hero-desc-split">
            A premium sourcing and acquisition platform for high-value properties, elite vehicles, and bespoke collections.
          </p>
          <div className="hero-action-buttons">
            <button onClick={() => navigate('/properties')} className="btn-hero-primary">
              Explore Collection
            </button>
            <button onClick={() => navigate('/contact')} className="btn-hero-secondary">
              Contact Us
            </button>
          </div>
        </div>
        <div className="hero-image-side">
          <div className="hero-glow-overlay"></div>
          <img 
            src="/media/listings/main/luxury_house_uyo_1780731892956.jpg" 
            className="hero-split-img" 
            alt="Luxury Night Villa with Exotics" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = listings.find(l => l.category === 'property')?.main_image || '';
            }}
          />
        </div>
      </section>

      {/* SECTION 2 - FEATURED PROPERTIES */}
      <section className="featured-collections-section">
        <div className="section-header-center">
          <span className="section-subtitle">CURATED REAL ESTATE</span>
          <h2 className="section-title-premium">Featured Properties</h2>
        </div>
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="listings-grid">
            {properties.map((item) => (
              <ListingCard key={item.id} listing={item} onClick={() => navigate(`/listings/${item.slug}`)} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3 - FEATURED VEHICLES */}
      <section className="featured-collections-section" style={{ borderTop: '1px solid var(--border-glass)' }}>
        <div className="section-header-center">
          <span className="section-subtitle">EXOTIC SHOWROOM</span>
          <h2 className="section-title-premium">Featured Vehicles</h2>
        </div>
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="listings-grid">
            {vehicles.map((item) => (
              <ListingCard key={item.id} listing={item} onClick={() => navigate(`/listings/${item.slug}`)} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4 - FEATURED COLLECTIONS */}
      <section className="featured-collections-section" style={{ borderTop: '1px solid var(--border-glass)' }}>
        <div className="section-header-center">
          <span className="section-subtitle">ACQUISITION CATEGORIES</span>
          <h2 className="section-title-premium">Featured Collections</h2>
        </div>
        <div className="collections-grid-lux">
          {[
            { title: 'Fine Art', desc: 'Original modern abstract paintings, framed canvas works, and commissioned museum-grade art.', icon: '🎨' },
            { title: 'Luxury Fashion', desc: 'Bespoke custom-tailored executive Italian virgin wool suits and elite wardrobe styling.', icon: '👔' },
            { title: 'Watches', desc: 'Highly coveted luxury timepieces and investment-grade watch portfolios.', icon: '⌚' },
            { title: 'Exclusive Items', desc: 'Rare collectibles, fine wine portfolios, and luxury lifestyle acquisitions.', icon: '💎' }
          ].map((c, i) => (
            <div key={i} className="collection-card-lux" onClick={() => navigate('/collections')}>
              <div className="coll-card-body">
                <span className="coll-icon">{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <span className="explore-link-arrow">Explore {c.title} &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 - WHY NOXHUB */}
      <section className="why-lookup-section">
        <div className="section-header-center">
          <span className="section-subtitle">THE NOXHUB ADVANTAGE</span>
          <h2 className="section-title-premium">Why Clients Choose NOXHUB</h2>
        </div>
        <div className="why-lookup-grid">
          <div className="why-card">
            <div className="why-icon">🛡️</div>
            <h4>Verified Assets</h4>
            <p>Every listing undergoes meticulous inspection: structural scans for houses, OBD2 diagnostics for vehicles.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🔑</div>
            <h4>Private Sourcing</h4>
            <p>We source off-market luxury assets matching your specific criteria with absolute discretion.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🤝</div>
            <h4>Trusted Network</h4>
            <p>Direct integration with certified developers, luxury dealerships, and master-level custom tailors.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">✨</div>
            <h4>Premium Experience</h4>
            <p>Bespoke advisory and concierge handling through your dedicated acquisitions manager from intake to hand-off.</p>
          </div>
        </div>
      </section>

      {/* SECTION 6 - HOW IT WORKS */}
      <section className="trust-process-section">
        <div className="section-header-center">
          <span className="section-subtitle">ACQUISITION PATHWAY</span>
          <h2 className="section-title-premium">How It Works</h2>
        </div>
        <div className="process-timeline">
          <div className="process-step">
            <div className="step-number">01</div>
            <h4>Submit Request</h4>
            <p>Tell us what you are looking for—properties, vehicles, art, or watches—and define your budget and requirements.</p>
          </div>
          <div className="process-step">
            <div className="step-number">02</div>
            <h4>Verification</h4>
            <p>Our team performs physical inspections and legal title verifications on prospective assets.</p>
          </div>
          <div className="process-step">
            <div className="step-number">03</div>
            <h4>Presentation</h4>
            <p>Receive a private, detailed catalog containing verified matches and comprehensive condition reports.</p>
          </div>
          <div className="process-step">
            <div className="step-number">04</div>
            <h4>Acquisition</h4>
            <p>Discreet transaction handling, escrow clearance, registration documentation, and private hand-off delivery.</p>
          </div>
        </div>
      </section>

      {/* SECTION 7 - RECENT ACQUISITIONS */}
      {soldListings.length > 0 && (
        <section className="portfolio-section-lux">
          <div className="section-header-center">
            <span className="section-subtitle">COMPLETED TRANSACTIONS</span>
            <h2 className="section-title-premium">Recent Acquisitions</h2>
          </div>
          <div className="listings-grid">
            {soldListings.map((item) => (
              <ListingCard key={item.id} listing={item} onClick={() => navigate(`/listings/${item.slug}`)} />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 8 - CONTACT CTA */}
      <ContactCTA />
    </div>
  );
}

// ==========================================
// 2. PROPERTIES VIEW (Page 2)
// ==========================================
interface PageProps {
  navigate: (to: string) => void;
}

function Properties({ navigate }: PageProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoc, setSearchLoc] = useState('');
  const [searchBudget, setSearchBudget] = useState('All');
  const [searchType, setSearchType] = useState('All');
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetch('/api/listings/?category=property')
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings);
        setFilteredListings(data.listings);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch properties', err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let temp = listings;
    if (searchLoc) {
      temp = temp.filter(l => l.region.toLowerCase().includes(searchLoc.toLowerCase()));
    }
    if (searchBudget !== 'All') {
      const maxB = Number(searchBudget);
      temp = temp.filter(l => l.price <= maxB);
    }
    if (searchType !== 'All') {
      if (searchType === 'Land') {
        temp = temp.filter(l => l.title.toLowerCase().includes('land') || l.land_size);
      } else {
        temp = temp.filter(l => !l.title.toLowerCase().includes('land') && !l.land_size);
      }
    }
    setFilteredListings(temp);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const pageItems = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="showroom-view-container">
      <div className="showroom-header page-hero-banner properties-hero">
        <span className="section-subtitle">EXQUISITE LIVING</span>
        <h2 className="showroom-category-title">Premium Properties</h2>
        <p className="showroom-category-subtitle">Curated investment and luxury opportunities, fully vetted and verified.</p>
      </div>

      <div className="search-filter-panel">
        <form onSubmit={handleSearch} className="search-filter-form">
          <div className="filter-group">
            <label className="filter-label">Location</label>
            <input 
              type="text" 
              placeholder="e.g. Uyo, Lagos" 
              value={searchLoc} 
              onChange={e => setSearchLoc(e.target.value)} 
              className="filter-input-lux"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Max Budget (₦)</label>
            <select 
              value={searchBudget} 
              onChange={e => setSearchBudget(e.target.value)} 
              className="filter-select-lux"
            >
              <option value="All">All Budgets</option>
              <option value="40000000">Up to ₦40M</option>
              <option value="80000000">Up to ₦80M</option>
              <option value="150000000">Up to ₦150M</option>
              <option value="300000000">Up to ₦300M</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Property Type</label>
            <select 
              value={searchType} 
              onChange={e => setSearchType(e.target.value)} 
              className="filter-select-lux"
            >
              <option value="All">All Types</option>
              <option value="House">Villas / Duplexes</option>
              <option value="Land">Commercial Land / Plots</option>
            </select>
          </div>
          <button type="submit" className="btn-search-lux">Search</button>
        </form>
      </div>

      <div className="catalog-container">
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state-title">No Matching Properties</h2>
            <p className="empty-state-text">No active property listings match your search criteria. Contact our sourcing desk for private off-market matches.</p>
          </div>
        ) : (
          <div>
            <div className="listings-grid">
              {pageItems.map(item => (
                <div key={item.id} className="listing-card property-card" onClick={() => navigate(`/listings/${item.slug}`)}>
                  <div className="card-media-wrapper">
                    <img src={item.main_image || '/static/images/placeholder.jpg'} className="card-img" alt={item.title} />
                    <div className="badge-overlay">
                      {item.is_verified && <span className="badge-item badge-verified">✓ Verified</span>}
                    </div>
                  </div>
                  <div className="card-details-soil">
                    <span className="card-location">📍 {item.region}</span>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-short-desc">{item.description.slice(0, 95)}...</p>
                    <div className="card-footer">
                      <span className="card-price">₦{item.price.toLocaleString()}</span>
                      <button className="btn-card-cta">View Property</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination-container-lux">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                  className="pagination-btn-lux"
                >
                  &larr;
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentPage(i + 1)} 
                    className={`pagination-btn-lux ${currentPage === i + 1 ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn-lux"
                >
                  &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2.5 VEHICLES VIEW (Page 4)
// ==========================================
function Vehicles({ navigate }: PageProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterPrice, setFilterPrice] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetch('/api/listings/?category=vehicle')
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings);
        setFilteredListings(data.listings);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch vehicles', err);
        setLoading(false);
      });
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    let temp = listings;
    if (filterBrand !== 'All') {
      temp = temp.filter(l => l.title.toLowerCase().includes(filterBrand.toLowerCase()));
    }
    if (filterYear !== 'All') {
      temp = temp.filter(l => l.car_year === Number(filterYear));
    }
    if (filterPrice !== 'All') {
      const maxP = Number(filterPrice);
      temp = temp.filter(l => l.price <= maxP);
    }
    if (filterStatus !== 'All') {
      temp = temp.filter(l => l.status === filterStatus);
    }
    setFilteredListings(temp);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const pageItems = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="showroom-view-container">
      <div className="showroom-header page-hero-banner vehicles-hero">
        <span className="section-subtitle">ELITE ACQUISITION</span>
        <h2 className="showroom-category-title">Luxury Vehicles</h2>
        <p className="showroom-category-subtitle">High-performance imported exotics, premium SUVs, and luxury sedans.</p>
      </div>

      <div className="search-filter-panel">
        <form onSubmit={handleFilter} className="search-filter-form">
          <div className="filter-group">
            <label className="filter-label">Brand</label>
            <select 
              value={filterBrand} 
              onChange={e => setFilterBrand(e.target.value)} 
              className="filter-select-lux"
            >
              <option value="All">All Brands</option>
              <option value="Mercedes">Mercedes-Benz</option>
              <option value="Rolls-Royce">Rolls-Royce</option>
              <option value="Porsche">Porsche</option>
              <option value="Lexus">Lexus</option>
              <option value="Toyota">Toyota</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Year</label>
            <select 
              value={filterYear} 
              onChange={e => setFilterYear(e.target.value)} 
              className="filter-select-lux"
            >
              <option value="All">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Max Price (₦)</label>
            <select 
              value={filterPrice} 
              onChange={e => setFilterPrice(e.target.value)} 
              className="filter-select-lux"
            >
              <option value="All">All Prices</option>
              <option value="30000000">Up to ₦30M</option>
              <option value="50000000">Up to ₦50M</option>
              <option value="100000000">Up to ₦100M</option>
              <option value="200000000">Up to ₦200M</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Availability</label>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)} 
              className="filter-select-lux"
            >
              <option value="All">All Statuses</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <button type="submit" className="btn-search-lux">Filter</button>
        </form>
      </div>

      <div className="catalog-container">
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state-title">No Matching Vehicles</h2>
            <p className="empty-state-text">No luxury vehicles currently match your parameters. Contact our vehicle sourcing desk.</p>
          </div>
        ) : (
          <div>
            <div className="listings-grid">
              {pageItems.map(item => (
                <div key={item.id} className="listing-card vehicle-card" onClick={() => navigate(`/listings/${item.slug}`)}>
                  <div className="card-media-wrapper">
                    <img src={item.main_image || '/static/images/placeholder.jpg'} className="card-img" alt={item.title} />
                    <div className="badge-overlay">
                      <span className="badge-item badge-category">{item.car_year}</span>
                      {item.is_verified && <span className="badge-item badge-verified">✓ Verified</span>}
                    </div>
                  </div>
                  <div className="card-details-soil">
                    <span className="card-location">📍 {item.region}</span>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-short-desc">
                      {item.car_transmission ? `Transmission: ${item.car_transmission.toUpperCase()}` : ''} OBD2 inspected: zero check fault codes.
                    </p>
                    <div className="card-footer">
                      <span className="card-price">₦{item.price.toLocaleString()}</span>
                      <button className="btn-card-cta">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination-container-lux">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                  className="pagination-btn-lux"
                >
                  &larr;
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentPage(i + 1)} 
                    className={`pagination-btn-lux ${currentPage === i + 1 ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn-lux"
                >
                  &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2.7 COLLECTIONS VIEW (Page 6)
// ==========================================
function CollectionsPage({ navigate }: PageProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'suits' | 'soaked' | 'watches' | 'exclusive'>('all');

  useEffect(() => {
    fetch('/api/listings/')
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings.filter((l: Listing) => l.category === 'suits' || l.category === 'soaked'));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch collections', err);
        setLoading(false);
      });
  }, []);

  const filtered = listings.filter(l => {
    if (activeTab === 'all') return true;
    if (activeTab === 'suits' && l.category === 'suits') return true;
    if (activeTab === 'soaked' && l.category === 'soaked') return true;
    return false;
  });

  const mockItems = [
    {
      id: 991,
      title: 'Patek Philippe Nautilus 5711/1A',
      category: 'watches',
      price: 135000000.00,
      region: 'Geneva Hub / Lagos',
      description: 'Pristine condition Patek Philippe Nautilus steel watch with blue dial. Original box and papers included.',
      main_image: null,
      is_verified: true,
      status: 'available',
      contact_phone: '2348148714875'
    },
    {
      id: 992,
      title: 'Rolex Daytona Cosmograph (Oystersteel)',
      category: 'watches',
      price: 38000000.00,
      region: 'London Hub / Lagos',
      description: 'Brand new 2023 Rolex Daytona with black ceramic bezel and white dial (Panda). Fully verified for authenticity.',
      main_image: null,
      is_verified: true,
      status: 'available',
      contact_phone: '2348148714875'
    },
    {
      id: 993,
      title: 'Rare Hermès Birkin 30 (Togo Gold)',
      category: 'exclusive',
      price: 24000000.00,
      region: 'Paris Hub / Abuja',
      description: 'Hermès Birkin 30 in Togo gold leather with gold hardware. Brand new in box with receipt.',
      main_image: null,
      is_verified: true,
      status: 'available',
      contact_phone: '2348148714875'
    }
  ];

  const allItems = [
    ...filtered, 
    ...(activeTab === 'all' || activeTab === 'watches' ? mockItems.filter(m => m.category === 'watches') : []), 
    ...(activeTab === 'all' || activeTab === 'exclusive' ? mockItems.filter(m => m.category === 'exclusive') : [])
  ];

  return (
    <div className="showroom-view-container">
      <div className="showroom-header page-hero-banner collections-hero">
        <span className="section-subtitle">CURATED LUXURY</span>
        <h2 className="showroom-category-title">Bespoke Collections</h2>
        <p className="showroom-category-subtitle">Italian tailored fashion, master fine art, rare timepieces, and exclusive collectibles.</p>
      </div>

      <div className="tabs-container">
        <div className="tabs-wrapper">
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Collections</button>
          <button className={`tab-btn ${activeTab === 'suits' ? 'active' : ''}`} onClick={() => setActiveTab('suits')}>Luxury Fashion</button>
          <button className={`tab-btn ${activeTab === 'soaked' ? 'active' : ''}`} onClick={() => setActiveTab('soaked')}>Fine Art</button>
          <button className={`tab-btn ${activeTab === 'watches' ? 'active' : ''}`} onClick={() => setActiveTab('watches')}>Watches</button>
          <button className={`tab-btn ${activeTab === 'exclusive' ? 'active' : ''}`} onClick={() => setActiveTab('exclusive')}>Exclusive Items</button>
        </div>
      </div>

      <div className="catalog-container">
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        ) : allItems.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state-title">Collection Private</h2>
            <p className="empty-state-text">All items in this collection are undergoing private intake verification. Contact our sourcing desk.</p>
          </div>
        ) : (
          <div className="listings-grid">
            {allItems.map((item: any) => (
              <div key={item.id} className="listing-card collection-item-card" onClick={() => item.slug ? navigate(`/listings/${item.slug}`) : navigate('/sourcing-request')}>
                <div className="card-media-wrapper">
                  {item.main_image ? (
                    <img src={item.main_image} className="card-img" alt={item.title} />
                  ) : (
                    <div className="mock-card-media-placeholder">
                      <span style={{ fontSize: '3rem' }}>{item.category === 'watches' ? '⌚' : '💎'}</span>
                    </div>
                  )}
                  <div className="badge-overlay">
                    <span className="badge-item badge-category" style={{ textTransform: 'capitalize' }}>
                      {item.category === 'suits' ? 'Fashion' : item.category === 'soaked' ? 'Fine Art' : item.category}
                    </span>
                    {item.is_verified && <span className="badge-item badge-verified">✓ Verified</span>}
                  </div>
                </div>
                <div className="card-details-soil">
                  <span className="card-location">📍 {item.region}</span>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-short-desc">{item.description}</p>
                  <div className="card-footer">
                    <span className="card-price">₦{item.price.toLocaleString()}</span>
                    <button className="btn-card-cta">
                      {item.slug ? 'View Details' : 'Inquire Sourcing'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2.8 ABOUT VIEW (Page 8)
// ==========================================
function About({}: PageProps) {
  return (
    <div className="about-view-container">
      <div className="showroom-header page-hero-banner about-hero">
        <span className="section-subtitle">OUR IDENTITY</span>
        <h1 className="showroom-category-title">About NOXHUB</h1>
        <p className="showroom-category-subtitle">A legacy of elite sourcing, discretion, and technical asset verification.</p>
      </div>

      <div className="about-content-wrapper">
        <section className="about-mission-vision">
          <div className="about-card">
            <h3>Our Mission</h3>
            <p>To redefine high-value acquisitions by combining strict physical verification protocols, legal audit transparency, and private concierge service to connect clients globally with unmatched luxury assets.</p>
          </div>
          <div className="about-card">
            <h3>Our Vision</h3>
            <p>To serve as the global standard for elite asset transactions, recognized as the premier platform of trust where luxury meets absolute structural and mechanical verification.</p>
          </div>
        </section>

        <section className="about-story-section">
          <h2>Our Story</h2>
          <p>NOXHUB was established to solve the core trust and verification deficits in high-value private transactions. We recognized that clients acquiring luxury properties, exotic vehicles, and bespoke art often face misrepresentation, hidden defects, and title issues. By establishing our physical audit desk—performing wall-crack checks, moisture mapping, and full OBD2 vehicular diagnostic scans—we ensure every acquisition is structurally sound, mechanically perfect, and legally secure.</p>
        </section>

        <section className="about-values-section">
          <h2>Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <span className="value-icon">🛡️</span>
              <h4>Trust</h4>
              <p>We believe trust is earned through strict verifications and detailed data integrity reports.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">💎</span>
              <h4>Luxury</h4>
              <p>We curate only the finest residential villas, exotics, bespoke tailoring, and museum-grade art.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">⚖️</span>
              <h4>Integrity</h4>
              <p>Discretion, legal compliance, title checks, and full transparency underwrite all client relationships.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">👑</span>
              <h4>Exclusivity</h4>
              <p>Providing direct matching and access to off-market properties and custom tailoring drops.</p>
            </div>
          </div>
        </section>

        <section className="about-team-section">
          <h2>Specialized Sourcing Advisors</h2>
          <div className="team-grid">
            <div className="team-member-card">
              <h4>Cassie</h4>
              <span className="team-role">Acquisitions Director</span>
              <p>Oversees direct developer negotiations, bespoke Italian wool imports, and art curation panels.</p>
            </div>
            <div className="team-member-card">
              <h4>Victor</h4>
              <span className="team-role">Lead Sourcing Specialist</span>
              <p>Manages vehicular diagnostic operations, structural integrity checks, and legal document verifications.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ==========================================
// 2.9 CONTACT VIEW (Page 9)
// ==========================================
function ContactPage({}: PageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');
    setTimeout(() => {
      setStatus('✓ Message received. Our acquisitions manager will contact you privately within 2 hours.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="contact-view-container">
      <div className="showroom-header page-hero-banner contact-hero">
        <span className="section-subtitle">CONNECT PRIVATELY</span>
        <h2 className="showroom-category-title">Contact NOXHUB</h2>
        <p className="showroom-category-subtitle">Discreet inquiries, sourcing requests, and private showing arrangements.</p>
      </div>

      <div className="contact-layout-grid">
        <div className="contact-form-card">
          <h3>Send Private Message</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-name">Full Name</label>
              <input id="contact-name" type="text" className="form-input" required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-email">Email Address</label>
              <input id="contact-email" type="email" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-phone">Phone / WhatsApp</label>
              <input id="contact-phone" type="text" className="form-input" required value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-message">Message</label>
              <textarea id="contact-message" className="form-input" rows={5} required value={message} onChange={e => setMessage(e.target.value)}></textarea>
            </div>
            {status && <p className="contact-status-msg" style={{ color: 'var(--primary)', marginBottom: '16px', fontWeight: 600 }}>{status}</p>}
            <button type="submit" className="btn-submit-form" style={{ width: '100%' }}>Send Inquiries</button>
          </form>
        </div>

        <div className="contact-info-card">
          <h3>Business Information</h3>
          <div className="info-block">
            <span className="info-icon">📍</span>
            <div>
              <h5>Sourcing Hub Locations</h5>
              <p>Osongama Estate, Uyo, Akwa Ibom</p>
              <p>Ikeja, Lagos, Nigeria</p>
            </div>
          </div>
          <div className="info-block">
            <span className="info-icon">✉️</span>
            <div>
              <h5>Acquisition Team Email</h5>
              <p>acquire@noxhub.com</p>
            </div>
          </div>
          <div className="info-block">
            <span className="info-icon">📞</span>
            <div>
              <h5>Hotline Support</h5>
              <p>+234 814 871 4875</p>
            </div>
          </div>
          <div className="info-block">
            <span className="info-icon">💬</span>
            <div>
              <h5>Direct Sourcing Line</h5>
              <a href="https://wa.me/2348148714875" target="_blank" rel="noopener noreferrer" className="wa-link-btn">
                WhatsApp Sourcing Desk
              </a>
            </div>
          </div>

          <div className="map-placeholder-box">
            <h4>Hub Location Mapping</h4>
            <p>Osongama Hub &bull; Ikeja Showroom</p>
            <div className="map-mock-graphic">
              <span className="map-pin">📍</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2.95 SOURCING REQUEST VIEW (Page 10)
// ==========================================
function SourcingRequest({}: PageProps) {
  const [assetType, setAssetType] = useState('property');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [requirements, setRequirements] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/subscribe/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_info: `Sourcing Request (${assetType}) - Budget: ${budget} - Loc: ${location} - Req: ${requirements}` }),
      credentials: 'include'
    })
      .then(() => {
        setSubmitted(true);
      })
      .catch(() => {
        setSubmitted(true);
      });
  };

  return (
    <div className="sourcing-request-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px 80px' }}>
      <div className="showroom-header page-hero-banner sourcing-hero" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="section-subtitle">ACQUISITION DESK</span>
        <h2 className="showroom-category-title">Private Sourcing Desk</h2>
        <p className="showroom-category-subtitle">Tell us what you are looking for, and let our verified team locate, inspect, and acquire it for you.</p>
      </div>

      {!submitted ? (
        <div className="sourcing-request-form-wrapper" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '32px', padding: '32px', boxShadow: 'var(--shadow-lux)' }}>
          <form onSubmit={handleSubmit} className="sourcing-request-form">
            <h3 className="form-inner-title" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-light)', marginBottom: '24px', fontSize: '1.4rem' }}>Tell Us What You're Looking For</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="source-category">Asset Category</label>
              <select id="source-category" className="form-input" value={assetType} onChange={e => setAssetType(e.target.value)}>
                <option value="property">Luxury Property (Duplex/Land)</option>
                <option value="vehicle">Exotic Vehicle (AMG/SUV/Sedan)</option>
                <option value="soaked">Fine Art Painting</option>
                <option value="suits">Bespoke Italian Fashion / Suits</option>
                <option value="watches">Coveted Timepiece / Watch</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="source-budget">Acquisition Budget Range (₦ or $)</label>
              <input id="source-budget" type="text" className="form-input" required placeholder="e.g. ₦120,000,000" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="source-location">Preferred Location / Hub</label>
              <input id="source-location" type="text" className="form-input" required placeholder="e.g. Osongama, Uyo or Lekki, Lagos" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="source-requirements">Specific Parameters & Features</label>
              <textarea id="source-requirements" className="form-input" rows={6} required placeholder="State exact features (e.g. 5 bedrooms, en-suite pool, C of O documents, 2021 year AMG, zero check engine cracks...)" value={requirements} onChange={e => setRequirements(e.target.value)}></textarea>
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Upload Reference Document (Optional)</label>
              <div className="mock-upload-btn" style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed var(--border-glass)', borderRadius: '12px', padding: '20px', textAlign: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <span>Select file or image reference...</span>
              </div>
            </div>
            <button type="submit" className="btn-submit-form" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>Submit Sourcing Request</button>
          </form>
        </div>
      ) : (
        <div className="sourcing-confirmation-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '32px', padding: '40px', textAlign: 'center', boxShadow: 'var(--shadow-lux)' }}>
          <div className="confirmation-badge" style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, marginBottom: '20px' }}>✓ Request Confirmed</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-light)', fontSize: '1.8rem', marginBottom: '32px' }}>What Happens Next</h3>
          <div className="confirmation-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
            <div className="timeline-node" style={{ display: 'flex', gap: '16px' }}>
              <span className="node-num" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700 }}>1</span>
              <div>
                <h5 style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>Desk Review</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Our lead sourcing specialists (Cassie & Victor) review your parameters within 1 hour.</p>
              </div>
            </div>
            <div className="timeline-node" style={{ display: 'flex', gap: '16px' }}>
              <span className="node-num" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700 }}>2</span>
              <div>
                <h5 style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>Verification Protocol</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>We source matching off-market assets and run structural checks/diagnostics.</p>
              </div>
            </div>
            <div className="timeline-node" style={{ display: 'flex', gap: '16px' }}>
              <span className="node-num" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700 }}>3</span>
              <div>
                <h5 style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>Private Presentation</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>We deliver a private presentation catalog to your email or WhatsApp with condition audits.</p>
              </div>
            </div>
            <div className="timeline-node" style={{ display: 'flex', gap: '16px' }}>
              <span className="node-num" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700 }}>4</span>
              <div>
                <h5 style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>Secure Delivery</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Escrow coordination, title hand-off, and final delivery logistics.</p>
              </div>
            </div>
          </div>
          <button onClick={() => setSubmitted(false)} className="btn-submit-form" style={{ marginTop: '30px' }}>Submit Another Request</button>
        </div>
      )}
    </div>
  );
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
  all_subscriptions: Array<{
    id: number;
    contact_info: string;
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
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'properties' | 'vehicles' | 'collections' | 'portfolio' | 'leads' | 'users' | 'settings'>('analytics');
  const [siteName, setSiteName] = useState('NOXHUB');
  const [contactEmail, setContactEmail] = useState('acquire@noxhub.com');
  const [contactPhone, setContactPhone] = useState('+234 814 871 4875');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 403) {
          navigate('/hidden-admin-portal');
          return;
        }
        throw new Error('Failed to load analytics data');
      }
      const resData = await res.json();
      setData(resData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Analytics load failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user.isAuthenticated || user.role === 'visitor') {
      navigate('/hidden-admin-portal');
      return;
    }
    fetchAnalytics();
  }, [user.isAuthenticated, user.role]);

  const handleApproveListing = async (slug: string) => {
    if (!window.confirm("Approve this listing and publish it to the showroom?")) return;
    try {
      const res = await fetch(`/api/listings/${slug}/approve/`, { method: 'POST', credentials: 'include' });
      const resData = await res.json();
      if (resData.success) {
        alert("Listing approved successfully!");
        fetchAnalytics();
      } else {
        alert("Error: " + (resData.error || "Failed to approve"));
      }
    } catch {
      alert("Network request failed");
    }
  };

  const handleToggleStatus = async (slug: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    if (!window.confirm(`Mark this listing as ${newStatus === 'sold' ? 'Sold & Delivered' : 'Available'}?`)) return;
    try {
      const res = await fetch(`/api/listings/${slug}/toggle-status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      const resData = await res.json();
      if (resData.success) {
        alert("Status updated successfully!");
        fetchAnalytics();
      } else {
        alert("Error: " + (resData.error || "Failed to toggle status"));
      }
    } catch {
      alert("Network request failed");
    }
  };


  const handleDeleteListing = async (slug: string) => {
    if (!window.confirm("⚠️ WARNING: Permanent deletion?")) return;
    try {
      const res = await fetch(`/api/listings/${slug}/delete/`, { method: 'POST', credentials: 'include' });
      const resData = await res.json();
      if (resData.success) {
        alert("Listing deleted successfully.");
        fetchAnalytics();
      } else {
        alert("Error: " + (resData.error || "Failed to delete"));
      }
    } catch {
      alert("Network request failed");
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm("Delete review?")) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}/delete/`, { method: 'POST', credentials: 'include' });
      const resData = await res.json();
      if (resData.success) {
        alert("Review deleted successfully.");
        fetchAnalytics();
      } else {
        alert("Error: " + (resData.error || "Failed to delete review"));
      }
    } catch {
      alert("Network request failed");
    }
  };

  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="spinner"></div>
      </div>
    );
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
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-bar">
        <div>
          <h1 className="dashboard-title">Private Management Console</h1>
          <p className="dashboard-subtitle">Super Admin / Manager Desk for NOXHUB</p>
        </div>
        <div className="dashboard-quick-actions">
          <button onClick={fetchAnalytics} className="btn-admin-action btn-admin-success">
            🔄 Refresh Console
          </button>
        </div>
      </div>

      <section className="analytics-section">
        <div className="analytics-metrics-grid">
          <div className="metric-card">
            <span className="metric-title">Total Site Traffic</span>
            <span className="metric-value">{data.total_views.toLocaleString()}</span>
            <span className="metric-desc">Lifetime Page Views</span>
          </div>
          <div className="metric-card active-browsers">
            <span className="metric-title">Active Browsers</span>
            <span className="metric-value">{data.active_browsers}</span>
            <span className="metric-desc">Sessions right now (15m window)</span>
          </div>
          <div className="metric-card">
            <span className="metric-title">Sourcing Leads</span>
            <span className="metric-value">{data.all_subscriptions.length}</span>
            <span className="metric-desc">Contact subscriptions</span>
          </div>
          <div className="metric-card">
            <span className="metric-title">Delivered Items</span>
            <span className="metric-value">{data.all_listings.filter(l => l.status === 'sold').length}</span>
            <span className="metric-desc">Completed acquisitions</span>
          </div>
        </div>
      </section>

      <div className="dashboard-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        <button className={`dash-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
        <button className={`dash-tab-btn ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>Properties ({data.all_listings.filter(l => l.category === 'property').length})</button>
        <button className={`dash-tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`} onClick={() => setActiveTab('vehicles')}>Vehicles ({data.all_listings.filter(l => l.category === 'vehicle').length})</button>
        <button className={`dash-tab-btn ${activeTab === 'collections' ? 'active' : ''}`} onClick={() => setActiveTab('collections')}>Collections ({data.all_listings.filter(l => l.category === 'suits' || l.category === 'soaked').length})</button>
        <button className={`dash-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>Portfolio</button>
        <button className={`dash-tab-btn ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}>Leads ({data.all_subscriptions.length})</button>
        <button className={`dash-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
        <button className={`dash-tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
      </div>

      {activeTab === 'analytics' && (
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
                    <td onClick={() => navigate(`/listings/${item.slug}`)} style={{ cursor: 'pointer', fontWeight: 600 }} className="hover-underline">
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
      )}

      {activeTab === 'properties' && (
        <div className="dashboard-card">
          <h3 className="card-inner-title">🏡 Properties Showroom Management</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Region</th>
                  <th>Price</th>
                  <th>Visibility</th>
                  <th>Audit Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.all_listings.filter(l => l.category === 'property').map(item => (
                  <tr key={item.id}>
                    <td onClick={() => navigate(`/listings/${item.slug}`)} style={{ cursor: 'pointer', fontWeight: 600 }}>{item.title}</td>
                    <td>{item.region}</td>
                    <td>₦{item.price.toLocaleString()}</td>
                    <td>{item.is_approved ? '✅ Approved' : '⏳ Pending'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!item.is_approved && (
                          <button onClick={() => handleApproveListing(item.slug)} className="btn-admin-action btn-admin-success">Approve</button>
                        )}
                        <button onClick={() => handleToggleStatus(item.slug, item.status)} className="btn-admin-action">
                          {item.status === 'available' ? 'Mark Sold' : 'Available'}
                        </button>
                        <button onClick={() => handleDeleteListing(item.slug)} className="btn-admin-action btn-admin-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="dashboard-card">
          <h3 className="card-inner-title">🚘 Vehicles Showroom Management</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th>Visibility</th>
                  <th>Audit Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.all_listings.filter(l => l.category === 'vehicle').map(item => (
                  <tr key={item.id}>
                    <td onClick={() => navigate(`/listings/${item.slug}`)} style={{ cursor: 'pointer', fontWeight: 600 }}>{item.title}</td>
                    <td>{item.car_year || 2021}</td>
                    <td>₦{item.price.toLocaleString()}</td>
                    <td>{item.is_approved ? '✅ Approved' : '⏳ Pending'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!item.is_approved && (
                          <button onClick={() => handleApproveListing(item.slug)} className="btn-admin-action btn-admin-success">Approve</button>
                        )}
                        <button onClick={() => handleToggleStatus(item.slug, item.status)} className="btn-admin-action">
                          {item.status === 'available' ? 'Mark Sold' : 'Available'}
                        </button>
                        <button onClick={() => handleDeleteListing(item.slug)} className="btn-admin-action btn-admin-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="dashboard-card">
          <h3 className="card-inner-title">👔 Collections & Fine Art Management</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.all_listings.filter(l => l.category === 'suits' || l.category === 'soaked').map(item => (
                  <tr key={item.id}>
                    <td onClick={() => navigate(`/listings/${item.slug}`)} style={{ cursor: 'pointer', fontWeight: 600 }}>{item.title}</td>
                    <td style={{ textTransform: 'capitalize' }}>{CATEGORY_LABELS[item.category] || item.category}</td>
                    <td>₦{item.price.toLocaleString()}</td>
                    <td>{item.is_approved ? '✅ Approved' : '⏳ Pending'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!item.is_approved && (
                          <button onClick={() => handleApproveListing(item.slug)} className="btn-admin-action btn-admin-success">Approve</button>
                        )}
                        <button onClick={() => handleDeleteListing(item.slug)} className="btn-admin-action btn-admin-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="dashboard-card">
          <h3 className="card-inner-title">💬 Portfolio Reviews Moderation</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Reviewer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.all_reviews.map(rev => (
                  <tr key={rev.id}>
                    <td onClick={() => navigate(`/listings/${rev.listing_slug}`)} style={{ cursor: 'pointer', fontWeight: 600 }} className="hover-underline">
                      {rev.listing_title}
                    </td>
                    <td>{rev.reviewer_name}</td>
                    <td style={{ color: '#FFE600' }}>{"★".repeat(rev.rating)}</td>
                    <td>“{rev.comment}”</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteReview(rev.id)} className="btn-admin-action btn-admin-danger">Delete Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="dashboard-card">
          <h3 className="card-inner-title">📬 Sourcing Capture Leads & Subscribers</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
            List of contact emails or WhatsApp numbers submitted via the footer notifications capturer or private sourcing forms.
          </p>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Lead Contact Info</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {data.all_subscriptions.map((sub, idx) => (
                  <tr key={sub.id || idx}>
                    <td>{sub.id || idx + 1}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{sub.contact_info}</td>
                    <td>{new Date(sub.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="dashboard-card">
          <h3 className="card-inner-title">👤 Authorized Manager & Admin Accounts</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Staff Role</th>
                  <th>Auth Desk Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>admin</strong></td>
                  <td><span className="admin-badge">Super Admin</span></td>
                  <td><span style={{ color: '#10B981', fontWeight: 600 }}>Active - Unlimited privileges</span></td>
                </tr>
                <tr>
                  <td><strong>cassie</strong></td>
                  <td><span className="admin-badge" style={{ background: '#3B82F6' }}>Manager</span></td>
                  <td><span style={{ color: '#10B981', fontWeight: 600 }}>Active - Showroom moderator</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="dashboard-card">
          <h3 className="card-inner-title">⚙️ Global Platform Settings</h3>
          <div className="settings-form" style={{ maxWidth: '500px' }}>
            <div className="form-group">
              <label className="form-label">Platform Name</label>
              <input type="text" className="form-input" value={siteName} onChange={e => setSiteName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input type="text" className="form-input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Support Phone</label>
              <input type="text" className="form-input" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
            </div>
            <button onClick={() => alert('Settings saved successfully (mocked)')} className="btn-submit-form">Save Settings</button>
          </div>
        </div>
      )}
    </div>
  );
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
