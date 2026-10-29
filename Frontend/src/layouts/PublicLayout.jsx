import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

export default function PublicLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="navbar navbar-expand-lg">
          <div className="container">
            <NavLink className="navbar-brand brand-mark" to="/">
              DRISHYA <span>RENTALS / 01</span>
            </NavLink>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-navigation" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="main-navigation">
              <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
                <NavLink className="nav-link" to="/">Index</NavLink>
                <NavLink className="nav-link" to="/catalog">Equipment</NavLink>
                <NavLink className="nav-link" to="/about">About</NavLink>
                <NavLink className="nav-link" to="/contact">Contact</NavLink>
                {user ? <button className="btn btn-outline-light nav-cta" type="button" onClick={logout}>Sign out</button> : <NavLink className="btn btn-outline-light nav-cta" to="/login">Sign in</NavLink>}
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main><PageTransition><Outlet /></PageTransition></main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div><span className="footer-brand">DRISHYA</span><p>Every vision deserves a frame.</p></div>
          <div><span className="footer-label">Explore</span><NavLink to="/equipment">Equipment</NavLink><NavLink to="/about">About us</NavLink><NavLink to="/rental-policy">Rental policy</NavLink></div>
          <div><span className="footer-label">Connect</span><a href="mailto:hello@drishya.rentals">hello@drishya.rentals</a><a href="/contact">Make an enquiry</a></div>
          <div className="footer-end"><span className="footer-copy">© {new Date().getFullYear()} DRISHYA Rentals</span><span className="footer-copy">Made for makers <span className="footer-dot" aria-hidden="true" /></span></div>
        </div>
      </footer>
    </div>
  );
}
