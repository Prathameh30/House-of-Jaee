// src/components/common/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiShoppingBag, FiUser, FiMenu, FiX, FiLogOut,
} from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountRef = useRef(null);

  const { itemCount } = useCart();
  const { customer, customerLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm('');
      setMobileOpen(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm uppercase tracking-wide font-medium transition-colors ${
      isActive ? 'text-maroon' : 'text-brown hover:text-maroon'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-beige-dark shadow-sm">
      {/* Top thin gold strip — signature touch */}
      <div className="h-1 bg-gradient-to-r from-maroon via-gold to-maroon" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
            <span className="font-display italic text-2xl md:text-3xl text-maroon">House of Jaee</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 ml-8">
            <NavLink to="/" className={navLinkClass} end>Home</NavLink>
            <NavLink to="/shop" className={navLinkClass}>Shop</NavLink>
            <NavLink to="/about" className={navLinkClass}>About Us</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contact Us</NavLink>
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4 ml-auto lg:ml-4">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen((s) => !s)}
              className="text-brown hover:text-maroon transition-colors"
            >
              <FiSearch size={20} />
            </button>

            <Link to="/cart" aria-label="Shopping cart" className="relative text-brown hover:text-maroon transition-colors">
              <FiShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-maroon text-cream text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Account menu */}
            <div className="relative hidden md:block" ref={accountRef}>
              <button
                aria-label="Account"
                onClick={() => setAccountMenuOpen((s) => !s)}
                className="text-brown hover:text-maroon transition-colors flex items-center gap-1"
              >
                <FiUser size={20} />
              </button>
              {accountMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-beige-dark rounded-sm shadow-lg py-2 z-50">
                  {customer ? (
                    <>
                      <div className="px-4 py-2 text-xs text-brown-light border-b border-beige">
                        Signed in as <span className="font-medium text-brown">{customer.name}</span>
                      </div>
                      <Link to="/my-orders" className="block px-4 py-2 text-sm text-brown hover:bg-beige" onClick={() => setAccountMenuOpen(false)}>
                        My Orders
                      </Link>
                      <button
                        onClick={() => { customerLogout(); setAccountMenuOpen(false); navigate('/'); }}
                        className="w-full text-left px-4 py-2 text-sm text-brown hover:bg-beige flex items-center gap-2"
                      >
                        <FiLogOut size={14} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2 text-sm text-brown hover:bg-beige" onClick={() => setAccountMenuOpen(false)}>
                        Sign In
                      </Link>
                      <Link to="/register" className="block px-4 py-2 text-sm text-brown hover:bg-beige" onClick={() => setAccountMenuOpen(false)}>
                        Create Account
                      </Link>
                      <Link to="/order-tracking" className="block px-4 py-2 text-sm text-brown hover:bg-beige" onClick={() => setAccountMenuOpen(false)}>
                        Track an Order
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              aria-label="Toggle menu"
              className="lg:hidden text-brown"
              onClick={() => setMobileOpen((s) => !s)}
            >
              {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <form onSubmit={handleSearchSubmit} className="pb-4 -mt-1">
            <div className="flex items-center border border-beige-dark rounded-sm overflow-hidden bg-white">
              <input
                autoFocus
                type="text"
                placeholder="Search for silk, Banarasi, wedding sarees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent"
              />
              <button type="submit" className="px-4 text-maroon">
                <FiSearch size={18} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-beige-dark bg-cream px-4 py-4 flex flex-col gap-3">
          <NavLink to="/" className={navLinkClass} onClick={() => setMobileOpen(false)} end>Home</NavLink>
          <NavLink to="/shop" className={navLinkClass} onClick={() => setMobileOpen(false)}>Shop</NavLink>
          <NavLink to="/about" className={navLinkClass} onClick={() => setMobileOpen(false)}>About Us</NavLink>
          <NavLink to="/contact" className={navLinkClass} onClick={() => setMobileOpen(false)}>Contact Us</NavLink>
          <div className="border-t border-beige-dark pt-3 flex flex-col gap-2">
            {customer ? (
              <>
                <Link to="/my-orders" className="text-sm text-brown" onClick={() => setMobileOpen(false)}>My Orders</Link>
                <button
                  onClick={() => { customerLogout(); setMobileOpen(false); navigate('/'); }}
                  className="text-sm text-left text-brown"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-brown" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link to="/order-tracking" className="text-sm text-brown" onClick={() => setMobileOpen(false)}>Track an Order</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}