import React from 'react';
import {
  UtensilsCrossed,
  QrCode,
  Smartphone,
  Zap,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Receipt,
  Users,
  Clock,
} from 'lucide-react';
import { siteConfig, buildWhatsAppLink } from '../../../core/growth/site.config';

interface RestaurantLandingPageProps {
  onNavigate: (route: string) => void;
}

export const RestaurantLandingPage: React.FC<RestaurantLandingPageProps> = ({ onNavigate }) => {
  const demoWhatsappHref = buildWhatsAppLink(
    'Hi PrimeSoul! I run a restaurant/cafe and would like a live demo of PrimeOMS and digital QR menu solutions.'
  );

  return (
    <div className="niche-landing-root">
      {/* Hero */}
      <section className="niche-hero bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
            <UtensilsCrossed size={14} /> Restaurant Growth & Operations Suite
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Give Your Customers <br />
            <span className="text-cyan-400">A Better Way to Order.</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
            Eliminate paper menu printing costs, cut table wait times, and capture repeat customer data with PrimeOMS and contactless QR menus.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button
              onClick={() => onNavigate('/qr-menu')}
              className="btn-primary bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 shadow-lg shadow-emerald-600/25"
            >
              <QrCode size={18} className="mr-2" /> Create Free QR Menu
            </button>
            <a
              href={demoWhatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 font-bold py-3.5 px-6"
            >
              <MessageSquare size={18} className="mr-2 text-cyan-400" /> Book PrimeOMS Demo
            </a>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Everything Your Restaurant Needs to Scale
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Built specifically for Indian dine-in, cafes, cloud kitchens, and bakeries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-panel space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <QrCode size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">QR Digital Menus</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mobile-first digital menu for every table. Update pricing in seconds, mark out-of-stock items, and add mouth-watering photos.
            </p>
          </div>

          <div className="card-panel space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Smartphone size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Table Ordering</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Guests scan, select items, and place orders directly from their phones. Cuts waiter order time by 70% during weekend rush hours.
            </p>
          </div>

          <div className="card-panel space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Zap size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Kitchen Display (KDS)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Orders appear on the chef’s kitchen screen or KOT printer instantly, categorized by prep station (Tandoor, Chinese, Beverages).
            </p>
          </div>

          <div className="card-panel space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">UPI & WhatsApp Bills</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Accept UPI payments directly and send digital bill receipts to the customer's WhatsApp, building your direct customer database.
            </p>
          </div>

          <div className="card-panel space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Loyalty & Repeat Offers</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Run automated birthday, anniversary, and weekend discounts to bring back past diners without paying high food aggregator commissions.
            </p>
          </div>

          <div className="card-panel space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Google Reviews on Tables</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Turn happy diners into 5-star Google reviews with 1-click feedback triggers directly from their digital receipt screen.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-12 px-4 bg-slate-900 border-t border-slate-800 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-white">Start With a Free QR Menu Today</h3>
          <p className="text-xs sm:text-sm text-slate-300">
            No upfront cost. Create your digital menu in 2 minutes, or schedule a complete PrimeOMS walkthrough.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/qr-menu')}
              className="btn-primary bg-emerald-600 hover:bg-emerald-500 text-xs py-3 px-5 font-bold"
            >
              Create Free QR Menu Now
            </button>
            <a
              href={demoWhatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs py-3 px-5"
            >
              Schedule Free Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
