import React from 'react';
import { Sparkles, Phone, Mail, MapPin, MessageSquare, ArrowUpRight } from 'lucide-react';
import { siteConfig, buildWhatsAppLink } from '../../../core/growth/site.config';

interface PublicFooterProps {
  onNavigate: (route: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  const whatsappHref = buildWhatsAppLink('Hi PrimeSoul, I have a question regarding your business growth tools.');

  return (
    <footer className="public-footer">
      <div className="footer-container">
        {/* Col 1: Brand & Bio */}
        <div className="footer-col-brand">
          <div className="footer-logo">
            <div className="logo-badge">
              <Sparkles size={16} className="text-indigo-400" />
            </div>
            <span className="footer-brand-name">PrimeSoul Web Solutions</span>
          </div>
          <p className="footer-bio">
            Helping Indian businesses build a stronger digital presence, capture high-intent enquiries, and use modern tools to scale efficiently.
          </p>
          <div className="footer-contact-list">
            <a href={`tel:${siteConfig.phone}`} className="footer-contact-item">
              <Phone size={14} className="text-indigo-400" /> {siteConfig.displayWhatsappNumber}
            </a>
            <a href={`mailto:${siteConfig.email}`} className="footer-contact-item">
              <Mail size={14} className="text-cyan-400" /> {siteConfig.email}
            </a>
            <div className="footer-contact-item">
              <MapPin size={14} className="text-emerald-400" /> {siteConfig.address}
            </div>
          </div>
        </div>

        {/* Col 2: Free Growth Tools */}
        <div className="footer-col">
          <h4 className="footer-col-title">Free Growth Tools</h4>
          <ul className="footer-links">
            <li>
              <button onClick={() => { onNavigate('/audit'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Free Business Digital Audit
              </button>
            </li>
            <li>
              <button onClick={() => { onNavigate('/qr-menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Free QR Digital Menu
              </button>
            </li>
            <li>
              <a href={siteConfig.primeOmsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                PrimeOMS Restaurant Suite <ArrowUpRight size={12} className="ml-1" />
              </a>
            </li>
            <li>
              <button onClick={() => { onNavigate('/r/PRIME10'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Customer Referral Program
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Industry Solutions */}
        <div className="footer-col">
          <h4 className="footer-col-title">Industry Solutions</h4>
          <ul className="footer-links">
            <li>
              <button onClick={() => { onNavigate('/for-restaurants'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                For Restaurants & Cafes
              </button>
            </li>
            <li>
              <button onClick={() => { onNavigate('/for-schools'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                For Schools & Coaching
              </button>
            </li>
            <li>
              <button onClick={() => { onNavigate('/for-local-businesses'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                For Local Retail & Clinics
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Growth Outcomes */}
        <div className="footer-col">
          <h4 className="footer-col-title">Services & Outcomes</h4>
          <ul className="footer-links">
            <li><span className="text-slate-400">Get Online: Custom Web & Google Map</span></li>
            <li><span className="text-slate-400">Get Customers: Local SEO & Ads</span></li>
            <li><span className="text-slate-400">Automate: PrimeOMS & WhatsApp CRM</span></li>
            <li className="pt-2">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="footer-whatsapp-btn">
                <MessageSquare size={14} className="mr-1 inline" /> Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} PrimeSoul Web Solutions. All rights reserved. Built for Indian businesses.
          </div>
          <div className="footer-legal-links">
            <button onClick={() => { onNavigate('/privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              Privacy Policy
            </button>
            <span className="text-slate-700">•</span>
            <button onClick={() => { onNavigate('/terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
