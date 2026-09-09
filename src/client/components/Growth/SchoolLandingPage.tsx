import React from 'react';
import {
  GraduationCap,
  Globe,
  Search,
  MessageSquare,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { siteConfig, buildWhatsAppLink } from '../../../core/growth/site.config';

interface SchoolLandingPageProps {
  onNavigate: (route: string) => void;
}

export const SchoolLandingPage: React.FC<SchoolLandingPageProps> = ({ onNavigate }) => {
  const schoolConsultWhatsapp = buildWhatsAppLink(
    'Hi PrimeSoul! I represent a school/coaching institute and would like to discuss our digital admissions and website presence.'
  );

  return (
    <div className="niche-landing-root">
      {/* Hero */}
      <section className="niche-hero bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            <GraduationCap size={14} /> Education & Coaching Growth
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Turn Your School's Digital Presence <br />
            <span className="text-indigo-400">Into An Admission Journey.</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
            Modern parents search on Google and evaluate on smartphones before ever visiting campus. We help schools and coaching centers capture 3x more admission inquiries.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button
              onClick={() => onNavigate('/audit')}
              className="btn-primary py-3.5 px-6 font-bold shadow-lg shadow-indigo-500/25"
            >
              <Search size={18} className="mr-2" /> Get Free School Audit
            </button>
            <a
              href={schoolConsultWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 font-bold py-3.5 px-6"
            >
              <MessageSquare size={18} className="mr-2 text-emerald-400" /> Talk to Education Specialist
            </a>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Key Digital Pillars for Education
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Engineered to turn parent Google searches into confirmed campus visits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-panel space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Modern Admission Landing Pages</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fast, high-trust pages showcasing facilities, faculty achievements, fee transparency, and 1-click admission enquiry forms.
            </p>
          </div>

          <div className="card-panel space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Search size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Google Local 3-Pack Rank</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When parents search "best CBSE school near me" or "IIT coaching in [city]", ensure your institution is ranked in the top 3 on Google Maps.
            </p>
          </div>

          <div className="card-panel space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">WhatsApp Brochure Automation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Parents get the school prospectus and fee structure delivered to their WhatsApp instantly upon submitting their contact details.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-slate-900 border-t border-slate-800 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-white">Audit Your School's Digital Footprint</h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Check your current Google rankings, mobile responsiveness, and inquiry capture readiness in 30 seconds.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/audit')}
              className="btn-primary py-3 px-6 text-sm font-bold"
            >
              Start Free Digital Audit Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
