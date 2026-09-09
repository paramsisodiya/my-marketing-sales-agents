import React from 'react';
import {
  Search,
  QrCode,
  Globe,
  TrendingUp,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  MapPin,
  MessageSquare,
  UtensilsCrossed,
  Award,
  Users,
  ChevronRight,
} from 'lucide-react';
import { siteConfig, buildWhatsAppLink } from '../../../core/growth/site.config';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const whatsappConsultHref = buildWhatsAppLink('Hi PrimeSoul! I would like a free digital consultation for my business.');

  return (
    <div className="homepage-root">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <Award size={14} className="text-amber-400 mr-1.5" />
            <span>Digital Growth Platform for Indian Businesses</span>
          </div>

          <h1 className="hero-headline">
            Build Your Digital Presence. <br className="hidden sm:inline" />
            <span className="text-gradient-primary">Get More Customers.</span>
          </h1>

          <p className="hero-subtext">
            PrimeSoul helps local businesses, clinics, schools, and restaurants build a stronger online presence, capture high-intent inquiries on WhatsApp, and use modern tools to grow.
          </p>

          <div className="hero-cta-group">
            <button
              onClick={() => onNavigate('/audit')}
              className="btn-primary-hero"
            >
              <Search size={18} className="mr-2" /> Check Your Business Free
            </button>

            <button
              onClick={() => onNavigate('/qr-menu')}
              className="btn-secondary-hero"
            >
              <QrCode size={18} className="mr-2 text-emerald-400" /> Create Free QR Menu
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <CheckCircle2 size={16} className="text-emerald-400 mr-1.5" /> 100% Free Instant Tools
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="text-emerald-400 mr-1.5" /> Zero-Jargon Honest Audits
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="text-emerald-400 mr-1.5" /> WhatsApp-Friendly Systems
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT WE HELP WITH (3 OUTCOMES) */}
      <section className="section-padded bg-slate-900/60">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">What We Help With</h2>
            <p className="section-subtitle">
              Three simple outcomes designed to take your business from invisible to high-growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Outcome 1: Get Online */}
            <div className="card-pillar">
              <div className="pillar-icon-box bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Globe size={24} />
              </div>
              <div className="pillar-tag text-indigo-400">Pillar 1</div>
              <h3 className="pillar-title">Get Online</h3>
              <p className="pillar-desc">
                Establish a credible, modern digital foundation so customers can find and trust your business immediately.
              </p>
              <ul className="pillar-features">
                <li><CheckCircle2 size={14} className="feature-icon" /> Fast mobile-friendly business websites</li>
                <li><CheckCircle2 size={14} className="feature-icon" /> Google Business Profile & Map setup</li>
                <li><CheckCircle2 size={14} className="feature-icon" /> Direct WhatsApp chat button integration</li>
                <li><CheckCircle2 size={14} className="feature-icon" /> Domain, SSL security, and cloud hosting</li>
              </ul>
            </div>

            {/* Outcome 2: Get Customers */}
            <div className="card-pillar featured">
              <div className="pillar-icon-box bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <TrendingUp size={24} />
              </div>
              <div className="pillar-tag text-amber-400">Pillar 2 • High Impact</div>
              <h3 className="pillar-title">Get Customers</h3>
              <p className="pillar-desc">
                Drive consistent local inquiries and phone calls without wasting money on random un-targeted ads.
              </p>
              <ul className="pillar-features">
                <li><CheckCircle2 size={14} className="feature-icon" /> Google Local 3-Pack SEO & Schema ranking</li>
                <li><CheckCircle2 size={14} className="feature-icon" /> Targeted Google Search Ads for ready buyers</li>
                <li><CheckCircle2 size={14} className="feature-icon" /> Meta (Instagram/Facebook) lead campaigns</li>
                <li><CheckCircle2 size={14} className="feature-icon" /> High-converting landing pages for admissions & bookings</li>
              </ul>
            </div>

            {/* Outcome 3: Automate */}
            <div className="card-pillar">
              <div className="pillar-icon-box bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap size={24} />
              </div>
              <div className="pillar-tag text-emerald-400">Pillar 3</div>
              <h3 className="pillar-title">Automate</h3>
              <p className="pillar-desc">
                Replace manual chaos and paper menus with modern digital tools that save time and increase customer loyalty.
              </p>
              <ul className="pillar-features">
                <li><CheckCircle2 size={14} className="feature-icon" /> PrimeOMS Restaurant QR menus & table orders</li>
                <li><CheckCircle2 size={14} className="feature-icon" /> Automated WhatsApp inquiry follow-ups</li>
                <li><CheckCircle2 size={14} className="feature-icon" /> Customer CRM pipeline & lead tracking</li>
                <li><CheckCircle2 size={14} className="feature-icon" /> Digital receipts, loyalty discounts & reviews</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FREE VALUE TOOLS SECTION */}
      <section className="section-padded">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Free Growth Tools</h2>
            <p className="section-subtitle">
              We believe in delivering genuine value before asking for your business. Try our free tools today:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Tool 1: Business Audit */}
            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon bg-indigo-500/10 text-indigo-400">
                  <Search size={24} />
                </div>
                <div>
                  <span className="badge-free">100% Free • No Login Needed</span>
                  <h3 className="text-xl font-bold text-white mt-1">Free Business Digital Health Audit</h3>
                </div>
              </div>
              <p className="text-slate-300 text-sm mt-3">
                Check how your business looks online. Get an instant 0–100 score analyzing mobile speed, Google Search visibility, SSL security, and WhatsApp inquiry readiness.
              </p>
              <div className="tool-footer mt-5">
                <button
                  onClick={() => onNavigate('/audit')}
                  className="btn-tool-cta bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Check Your Business Free <ArrowRight size={16} className="ml-1.5" />
                </button>
              </div>
            </div>

            {/* Tool 2: Free QR Menu */}
            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon bg-emerald-500/10 text-emerald-400">
                  <QrCode size={24} />
                </div>
                <div>
                  <span className="badge-free bg-emerald-500/20 text-emerald-300">Free For Restaurants & Cafes</span>
                  <h3 className="text-xl font-bold text-white mt-1">Free QR Digital Menu Builder</h3>
                </div>
              </div>
              <p className="text-slate-300 text-sm mt-3">
                Create a fast, beautiful mobile menu and downloadable QR code for your tables in under 2 minutes. Update prices and dishes anytime without reprinting.
              </p>
              <div className="tool-footer mt-5">
                <button
                  onClick={() => onNavigate('/qr-menu')}
                  className="btn-tool-cta bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Create Your Free Menu <ArrowRight size={16} className="ml-1.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRIMEOMS RESTAURANT SPOTLIGHT */}
      <section className="section-padded bg-gradient-to-b from-slate-900/80 to-slate-950 border-y border-slate-800/80">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4">
                <UtensilsCrossed size={14} /> PrimeOMS Restaurant Suite
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Make Your Restaurant <br />
                <span className="text-cyan-400">Easier to Order From.</span>
              </h2>
              <p className="text-slate-300 text-base mt-4 leading-relaxed">
                PrimeOMS transforms table ordering and kitchen workflows. Guests scan the table QR code, browse photos, and order directly from their smartphones — eliminating weekend order delays and printing costs.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="feature-pill">
                  <CheckCircle2 size={16} className="text-cyan-400 mr-2 shrink-0" />
                  <span className="text-sm font-medium text-slate-200">Instant Table QR Ordering</span>
                </div>
                <div className="feature-pill">
                  <CheckCircle2 size={16} className="text-cyan-400 mr-2 shrink-0" />
                  <span className="text-sm font-medium text-slate-200">Kitchen Display System (KDS)</span>
                </div>
                <div className="feature-pill">
                  <CheckCircle2 size={16} className="text-cyan-400 mr-2 shrink-0" />
                  <span className="text-sm font-medium text-slate-200">UPI Payments & Digital Bills</span>
                </div>
                <div className="feature-pill">
                  <CheckCircle2 size={16} className="text-cyan-400 mr-2 shrink-0" />
                  <span className="text-sm font-medium text-slate-200">Customer Loyalty & WhatsApp</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  onClick={() => onNavigate('/for-restaurants')}
                  className="btn-primary bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  See How PrimeOMS Works <ArrowRight size={16} className="ml-1.5" />
                </button>
                <button
                  onClick={() => onNavigate('/qr-menu')}
                  className="btn-secondary text-cyan-300 border-cyan-500/30"
                >
                  Start with Free QR Menu
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="restaurant-mockup-card">
                <div className="mockup-header">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-slate-400 ml-2">table-04.qr-menu</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700/60">
                    <div>
                      <div className="text-sm font-bold text-white">Table #04 Order</div>
                      <div className="text-xs text-emerald-400">🟢 Live in Kitchen</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">₹747</div>
                      <div className="text-xs text-slate-400">3 items</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span>1x Paneer Tikka (Extra spicy)</span>
                      <span className="font-semibold text-white">₹249</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1x Dal Makhani Special</span>
                      <span className="font-semibold text-white">₹299</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2x Butter Naan Basket</span>
                      <span className="font-semibold text-white">₹199</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Auto-sent to WhatsApp:</span>
                    <span className="text-emerald-400 font-semibold">+91 98290•••••</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="section-padded">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">A straightforward 4-step path to digital growth:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4 className="step-title">Check Your Business</h4>
              <p className="step-desc">
                Enter your website or business name in our free audit tool or create a free QR menu.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h4 className="step-title">Find Opportunities</h4>
              <p className="step-desc">
                Discover exact gaps in mobile speed, Google Maps 3-Pack rank, and WhatsApp lead capture.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h4 className="step-title">Improve Your Presence</h4>
              <p className="step-desc">
                Implement practical fixes with PrimeSoul's dedicated web, SEO, and automation sprints.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h4 className="step-title">Grow Revenue</h4>
              <p className="step-desc">
                Receive consistent customer phone calls, admissions, orders, and referrals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL ACTION CTA */}
      <section className="section-padded bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border-t border-indigo-500/20">
        <div className="section-container text-center max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to See Where Your Business Can Improve?
          </h2>
          <p className="text-slate-300 text-base mt-4">
            Get your PrimeSoul Digital Health Score in 30 seconds. No credit card, no pushy sales pitch, just practical improvements.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button
              onClick={() => onNavigate('/audit')}
              className="btn-primary px-8 py-3.5 text-base shadow-lg shadow-indigo-500/25"
            >
              <Search size={18} className="mr-2" /> Start Free Business Audit
            </button>
            <a
              href={whatsappConsultHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-8 py-3.5 text-base border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400"
            >
              <MessageSquare size={18} className="mr-2 text-emerald-400" /> Talk to Us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
