import React from 'react';
import {
  Building2,
  Search,
  MessageSquare,
  Globe,
  Phone,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { siteConfig, buildWhatsAppLink } from '../../../core/growth/site.config';

interface LocalBusinessLandingPageProps {
  onNavigate: (route: string) => void;
}

export const LocalBusinessLandingPage: React.FC<LocalBusinessLandingPageProps> = ({ onNavigate }) => {
  const consultWhatsapp = buildWhatsAppLink(
    'Hi PrimeSoul! I run a local business/clinic/salon and want to improve our Google Maps ranking and online customer inquiries.'
  );

  return (
    <div className="niche-landing-root">
      {/* Hero */}
      <section className="niche-hero bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
            <Building2 size={14} /> Local Business & Retail Growth
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Get Found. Get Enquiries. <br />
            <span className="text-amber-400">Grow Your Business.</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
            Stop losing local customers to competitors. We help clinics, salons, gyms, and retail stores rank #1 on Google Maps and capture ready-to-buy WhatsApp leads.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button
              onClick={() => onNavigate('/audit')}
              className="btn-primary bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3.5 px-6 shadow-lg shadow-amber-600/25"
            >
              <Search size={18} className="mr-2" /> Check My Business Free
            </button>
            <a
              href={consultWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-bold py-3.5 px-6"
            >
              <MessageSquare size={18} className="mr-2 text-amber-400" /> Talk to a Local Growth Expert
            </a>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-panel space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Google Maps 3-Pack SEO</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Optimize your Google Business Profile, categories, photos, and citations so local buyers searching nearby call you first.
            </p>
          </div>

          <div className="card-panel space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Sub-Second Business Website</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Clean, mobile-first website that loads in under 1 second with prominent click-to-call and WhatsApp appointment triggers.
            </p>
          </div>

          <div className="card-panel space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">WhatsApp Lead Capture</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Convert mobile website traffic into direct WhatsApp inquiries with pre-filled service request messages.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-12 px-4 bg-slate-900 border-t border-slate-800 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-white">Discover Your Local Digital Score</h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Check your Google Maps rank, speed, and contact links in 30 seconds for free.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/audit')}
              className="btn-primary bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3 px-6 text-sm"
            >
              Start Free Business Audit
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
