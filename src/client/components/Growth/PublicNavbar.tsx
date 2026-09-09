import React, { useState } from 'react';
import { Sparkles, QrCode, Search, ChevronDown, Menu, X, ArrowRight, MessageSquare, ShieldCheck } from 'lucide-react';
import { siteConfig, buildWhatsAppLink } from '../../../core/growth/site.config';

interface PublicNavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onSwitchToDashboard: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ currentRoute, onNavigate, onSwitchToDashboard }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);

  const handleNav = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    setSolutionsDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappHref = buildWhatsAppLink('Hi PrimeSoul! I would like to learn more about your digital growth services.');

  return (
    <header className="public-navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-logo" onClick={() => handleNav('/')}>
          <div className="logo-badge">
            <Sparkles className="logo-icon" size={18} />
          </div>
          <div className="logo-text">
            <span className="logo-title">PrimeSoul</span>
            <span className="logo-subtitle">GROWTH ENGINE</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <button
            className={`nav-link ${currentRoute === '/' ? 'active' : ''}`}
            onClick={() => handleNav('/')}
          >
            Home
          </button>

          <button
            className={`nav-link ${currentRoute.startsWith('/audit') ? 'active' : ''}`}
            onClick={() => handleNav('/audit')}
          >
            <Search size={15} className="mr-1 inline" />
            Free Audit
          </button>

          <button
            className={`nav-link ${currentRoute.startsWith('/qr-menu') ? 'active' : ''}`}
            onClick={() => handleNav('/qr-menu')}
          >
            <QrCode size={15} className="mr-1 inline" />
            Free QR Menu
          </button>

          {/* Solutions Dropdown */}
          <div className="nav-dropdown-wrapper">
            <button
              className={`nav-link dropdown-btn ${currentRoute.startsWith('/for-') ? 'active' : ''}`}
              onClick={() => setSolutionsDropdownOpen(!solutionsDropdownOpen)}
            >
              Solutions <ChevronDown size={14} className="ml-1 inline" />
            </button>
            {solutionsDropdownOpen && (
              <div className="nav-dropdown-menu">
                <div className="dropdown-item" onClick={() => handleNav('/for-restaurants')}>
                  <div className="font-semibold text-white">For Restaurants</div>
                  <div className="text-xs text-slate-400">QR menus, table ordering & PrimeOMS</div>
                </div>
                <div className="dropdown-item" onClick={() => handleNav('/for-schools')}>
                  <div className="font-semibold text-white">For Schools & Coaching</div>
                  <div className="text-xs text-slate-400">Admissions, parent flows & Google presence</div>
                </div>
                <div className="dropdown-item" onClick={() => handleNav('/for-local-businesses')}>
                  <div className="font-semibold text-white">For Local Businesses</div>
                  <div className="text-xs text-slate-400">Websites, Google Maps & WhatsApp leads</div>
                </div>
              </div>
            )}
          </div>

          <a
            href={siteConfig.primeOmsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link text-cyan-400 hover:text-cyan-300"
          >
            PrimeOMS ↗
          </a>
        </nav>

        {/* Actions / CTA */}
        <div className="navbar-actions">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-header"
            title="Chat on WhatsApp"
          >
            <MessageSquare size={16} />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          <button
            onClick={onSwitchToDashboard}
            className="btn-dashboard-toggle"
            title="Open Internal CRM & Agent OS"
          >
            <ShieldCheck size={16} />
            <span className="hidden md:inline">CRM & Ops</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <button className="mobile-nav-item" onClick={() => handleNav('/')}>
            Home
          </button>
          <button className="mobile-nav-item" onClick={() => handleNav('/audit')}>
            <Search size={16} className="mr-2 inline text-indigo-400" /> Free Business Audit
          </button>
          <button className="mobile-nav-item" onClick={() => handleNav('/qr-menu')}>
            <QrCode size={16} className="mr-2 inline text-emerald-400" /> Free QR Digital Menu
          </button>
          <div className="mobile-section-divider">Industry Solutions</div>
          <button className="mobile-subnav-item" onClick={() => handleNav('/for-restaurants')}>
            🍳 For Restaurants & Cafes
          </button>
          <button className="mobile-subnav-item" onClick={() => handleNav('/for-schools')}>
            🎓 For Schools & Coaching
          </button>
          <button className="mobile-subnav-item" onClick={() => handleNav('/for-local-businesses')}>
            🏬 For Local Businesses
          </button>
          <div className="mobile-section-divider">Tools & Systems</div>
          <a href={siteConfig.primeOmsUrl} target="_blank" rel="noopener noreferrer" className="mobile-nav-item text-cyan-400">
            PrimeOMS Restaurant Suite ↗
          </a>
          <button className="mobile-nav-item text-indigo-300 font-semibold" onClick={onSwitchToDashboard}>
            <ShieldCheck size={16} className="mr-2 inline" /> Open Internal CRM Dashboard
          </button>
        </div>
      )}
    </header>
  );
};
