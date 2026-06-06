import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import {
  cibFacebookF,
  cibInstagram,
  cibLinkedinIn,
  cibTiktok,
  cibWhatsapp,
  cibYoutube,
  cilCart,
  cilGlobeAlt,
  cilHeart,
  cilSearch,
  cilTruck,
} from '@coreui/icons';
import { fetchPublicCategories, fetchPublicEvents } from '../api/client';
import { useAuth } from '../context/AuthContext';

const rooms = [
  {
    title: 'Living Room',
    description: 'Soft neutrals, low-profile seating, and layered lighting.',
    tone: 'Warm linen textures with oak accents.',
    image:
      'https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
  },
  {
    title: 'Dining Room',
    description: 'Compact tables that expand for hosting.',
    tone: 'Matte black frames with light birch tops.',
    image:
      'https://images.unsplash.com/photo-1745835449652-72ec0de4f732?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
  },
  {
    title: 'Bedroom',
    description: 'Storage-forward frames and calming palettes.',
    tone: 'Mist blue, walnut, and woven cotton.',
    image:
      'https://images.unsplash.com/photo-1664908790479-f6e9f76034db?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
  },
];

const collections = [
  {
    title: 'Minimal Storage',
    description: 'Modular shelves that scale with your home.',
    image:
      'https://images.unsplash.com/photo-1745835449652-72ec0de4f732?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
  },
  {
    title: 'Soft Lighting',
    description: 'Warm LEDs and sculptural lamps.',
    image:
      'https://images.unsplash.com/photo-1664908790479-f6e9f76034db?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
  },
  {
    title: 'Kitchen Essentials',
    description: 'Smart organizers and prep-friendly surfaces.',
    image:
      'https://images.unsplash.com/photo-1745835449652-72ec0de4f732?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
  },
  {
    title: 'Work From Home',
    description: 'Compact desks, ergonomic seating.',
    image:
      'https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const categoryTrackRef = useRef(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const eventTrackRefs = useRef({});
  const [authModal, setAuthModal] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);
  const [submittingRegister, setSubmittingRegister] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchPublicCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    }

    async function loadEvents() {
      try {
        const data = await fetchPublicEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch {
        setEvents([]);
      }
    }

    loadCategories();
    loadEvents();
  }, []);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (Number(a?.id) || 0) - (Number(b?.id) || 0));
  }, [categories]);

  function scrollEventProducts(eventId, direction) {
    const ref = eventTrackRefs.current[eventId];
    if (!ref) return;
    ref.scrollBy({ left: direction * 320, behavior: 'smooth' });
  }

  function scrollCategories(direction) {
    if (!categoryTrackRef.current) return;
    categoryTrackRef.current.scrollBy({ left: direction * 260, behavior: 'smooth' });
  }

  function openLogin() {
    setLoginError('');
    setAuthModal('login');
  }

  function openRegister() {
    setRegisterError('');
    setAuthModal('register');
  }

  function closeAuthModal() {
    setAuthModal(null);
  }

  function updateLoginField(event) {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateRegisterField(event) {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginError('');
    setSubmittingLogin(true);

    try {
      await login(loginForm);
      closeAuthModal();
      navigate('/dashboard');
    } catch (requestError) {
      setLoginError(requestError.response?.data?.message || 'Login failed.');
    } finally {
      setSubmittingLogin(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setRegisterError('');
    setSubmittingRegister(true);

    try {
      await register(registerForm);
      closeAuthModal();
      navigate('/dashboard');
    } catch (requestError) {
      setRegisterError(requestError.response?.data?.message || 'Unable to register.');
    } finally {
      setSubmittingRegister(false);
    }
  }

  return (
    <div className="home-page">
      <div className="top-bar">
        <div className="top-bar-col">
          <button type="button" className="lang-switch">
            <CIcon icon={cilGlobeAlt} />
            <span>AE | English</span>
          </button>
        </div>
        <div className="top-bar-col center">
          <a href="#delivery" className="delivery-link">
            <CIcon icon={cilTruck} />
            <span>Delivery Free</span>
          </a>
        </div>
        <div className="top-bar-col end">
          <div className="top-links">
            <a href="#contact">Contact Us</a>
            <a href="#faqs">FAQs</a>
            <a href="#about">About Us</a>
          </div>
        </div>
      </div>
      <header className="home-nav">
        <div className="home-brand">
          <img className="home-logo" src="/messaraliving-logo.png" alt="" />
        </div>
        <div className="home-social">
          <a className="social-dot" href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
            <CIcon icon={cibFacebookF} />
          </a>
          <a className="social-dot" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
            <CIcon icon={cibInstagram} />
          </a>
          <a className="social-dot" href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
            <CIcon icon={cibYoutube} />
          </a>
          <a className="social-dot" href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <CIcon icon={cibLinkedinIn} />
          </a>
          <a className="social-dot" href="https://whatsapp.com" target="_blank" rel="noreferrer" aria-label="WhatsApp">
            <CIcon icon={cibWhatsapp} />
          </a>
          <a className="social-dot" href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
            <CIcon icon={cibTiktok} />
          </a>
        </div>
        <div className="home-search center-search">
          <div className="home-search-field">
            <CIcon icon={cilSearch} className="search-icon" />
            <input type="text" placeholder="what are you looking for?" />
          </div>
        </div>
        <div className="home-links">
          <a href="#services">Services</a>
          <a href="#news">News</a>
        </div>
        <div className="home-auth">
          <button type="button" className="auth-link" onClick={openLogin}>
            Login
          </button>
          <button type="button" className="auth-link" onClick={openRegister}>
            Register
          </button>
        </div>
        <div className="home-icons">
          <Link to="/dashboard" title="Transport">
            <CIcon icon={cilTruck} />
          </Link>
          <Link to="/dashboard" title="Wishlist">
            <CIcon icon={cilHeart} />
          </Link>
          <Link to="/dashboard" title="Cart">
            <CIcon icon={cilCart} />
          </Link>
        </div>
      </header>

      {sortedCategories.length > 0 && (
        <div className="category-nav">
          <div className="category-nav-inner">
            <span className="category-nav-title">Shop by Category</span>
            <button
              type="button"
              className="category-nav-btn"
              onClick={() => scrollCategories(-1)}
              aria-label="Scroll categories left"
            >
              ‹
            </button>
            <div className="category-track" ref={categoryTrackRef}>
              {sortedCategories.map((category) => {
                const imageUrl =
                  category.image_url || (category.image_path ? `${apiBaseUrl}/storage/${category.image_path}` : '');

                return (
                  <Link
                    key={category.id}
                    to={`/categories/${category.slug}`}
                    className="category-chip"
                    aria-label={`Open ${category.name}`}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt={category.name} />
                    ) : (
                      <div className="category-chip-placeholder" />
                    )}
                    <span>{category.name}</span>
                  </Link>
                );
              })}
            </div>
            <button
              type="button"
              className="category-nav-btn"
              onClick={() => scrollCategories(1)}
              aria-label="Scroll categories right"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {events.length > 0 && (
        <section className="event-showcase">
          {events.map((eventItem) => (
            <div key={eventItem.id} className="event-block">
              <div className="event-header">
                <div>
                  <h2>{eventItem.name}</h2>
                  {Number(eventItem.discount_value || 0) > 0 && (
                    <p className="event-subtitle">
                      {eventItem.discount_type === 'percent'
                        ? `${eventItem.discount_value}% off`
                        : `AED ${eventItem.discount_value} off`}
                    </p>
                  )}
                </div>
                <div className="event-controls">
                  <button type="button" onClick={() => scrollEventProducts(eventItem.id, -1)} aria-label="Scroll left">
                    ‹
                  </button>
                  <button type="button" onClick={() => scrollEventProducts(eventItem.id, 1)} aria-label="Scroll right">
                    ›
                  </button>
                </div>
              </div>
              <div
                className="event-track"
                ref={(node) => {
                  if (node) {
                    eventTrackRefs.current[eventItem.id] = node;
                  }
                }}
              >
                {(eventItem.products || []).map((product) => (
                  <div key={product.id} className="event-card">
                    <div className="event-image">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div className="event-image-placeholder" />
                      )}
                    </div>
                    <div className="event-card-body">
                      <h3>{product.name}</h3>
                      {Number(product.discount_price || 0) > 0 ? (
                        <div className="event-product-price">
                          <span className="price-old">AED {Number(product.price || 0).toFixed(2)}</span>
                          <span className="price-discount">AED {Number(product.discount_price || 0).toFixed(2)}</span>
                        </div>
                      ) : (
                        <div className="event-product-price">AED {Number(product.price || 0).toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="hero">
        <div className="hero-copy">
          <span className="hero-tag">MessaraLiving Essentials</span>
          <h1>Functional furniture with bold accents, built for everyday life.</h1>
          <p>
            Discover Scandinavian-inspired comfort with a modern red-and-black signature. Clean lines, smart storage,
            and a flexible style for any space.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-btn">Shop the look</button>
            <button type="button" className="ghost-btn">View catalog</button>
          </div>
        </div>
        <div className="hero-card">
          <div
            className="hero-image"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000)',
            }}
          />
          <div className="hero-card-body">
            <h3>Weekend Refresh</h3>
            <p>Layered textiles, pale woods, and adaptable seating.</p>
          </div>
        </div>
      </section>

      <section id="collections" className="section">
        <div className="section-head">
          <h2>Curated Collections</h2>
          <p>Mix-and-match essentials built for modern apartments.</p>
        </div>
        <div className="collection-grid">
          {collections.map((item) => (
            <article key={item.title} className="collection-card">
              <div
                className="collection-image"
                style={{
                  backgroundImage: `url(${item.image})`,
                }}
              />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>


      <section id="rooms" className="section rooms">
        <div className="section-head">
          <h2>Room-by-Room Ideas</h2>
          <p>Blueprints that balance function and calm.</p>
        </div>
        <div className="room-grid">
          {rooms.map((room) => (
            <article key={room.title} className="room-card">
              <div className="room-image" style={{ backgroundImage: `url(${room.image})` }} />
              <div className="room-body">
                <h3>{room.title}</h3>
                <p>{room.description}</p>
                <span>{room.tone}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="promo" className="promo">
        <div>
          <h2>New arrivals with flexible storage</h2>
          <p>Slide-in shelves, hidden compartments, and timeless silhouettes.</p>
        </div>
        <button type="button" className="primary-btn">Explore arrivals</button>
      </section>

      <footer className="home-footer">
        <div>
          <strong>NordicHouse</strong>
          <p>Scandinavian-inspired interiors for modern living.</p>
        </div>
        <div>
          <span>Support</span>
          <span>Shipping</span>
          <span>Returns</span>
        </div>
        <div>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </footer>

      {authModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="auth-modal">
            <button type="button" className="auth-modal-close" onClick={closeAuthModal} aria-label="Close">
              ×
            </button>
            {authModal === 'login' ? (
              <div className="auth-modal-card">
                <h1>Login</h1>
                <form onSubmit={handleLoginSubmit} className="d-grid gap-3">
                  <label>
                    Email
                    <input
                      className="form-control"
                      name="email"
                      type="email"
                      value={loginForm.email}
                      onChange={updateLoginField}
                      required
                    />
                  </label>
                  <label>
                    Password
                    <input
                      className="form-control"
                      name="password"
                      type="password"
                      value={loginForm.password}
                      onChange={updateLoginField}
                      required
                    />
                  </label>
                  {loginError && <p className="error-text mb-0">{loginError}</p>}
                  <button className="btn btn-dark" type="submit" disabled={submittingLogin}>
                    {submittingLogin ? 'Checking...' : 'Login'}
                  </button>
                </form>
                <p className="mt-3 mb-0">
                  New user?{' '}
                  <button type="button" className="link-button" onClick={openRegister}>
                    Register
                  </button>
                </p>
                <p className="mb-0">
                  Forgot password? <Link to="/forgot-password">Reset here</Link>
                </p>
              </div>
            ) : (
              <div className="auth-modal-card">
                <h1>Create account</h1>
                <form onSubmit={handleRegisterSubmit} className="d-grid gap-3">
                  <label>
                    Name
                    <input
                      className="form-control"
                      name="name"
                      type="text"
                      value={registerForm.name}
                      onChange={updateRegisterField}
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      className="form-control"
                      name="email"
                      type="email"
                      value={registerForm.email}
                      onChange={updateRegisterField}
                      required
                    />
                  </label>
                  <label>
                    Password
                    <input
                      className="form-control"
                      name="password"
                      type="password"
                      value={registerForm.password}
                      onChange={updateRegisterField}
                      required
                    />
                  </label>
                  <label>
                    Confirm password
                    <input
                      className="form-control"
                      name="password_confirmation"
                      type="password"
                      value={registerForm.password_confirmation}
                      onChange={updateRegisterField}
                      required
                    />
                  </label>
                  {registerError && <p className="error-text mb-0">{registerError}</p>}
                  <button className="btn btn-dark" type="submit" disabled={submittingRegister}>
                    {submittingRegister ? 'Creating...' : 'Register'}
                  </button>
                </form>
                <p className="mt-3 mb-0">
                  Already have an account?{' '}
                  <button type="button" className="link-button" onClick={openLogin}>
                    Login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
