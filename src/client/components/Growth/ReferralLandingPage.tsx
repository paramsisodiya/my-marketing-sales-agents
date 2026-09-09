import React, { useEffect, useState } from 'react';
import { Gift, Search, QrCode, ArrowRight, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { apiService } from '../../services/api.service';
import { IReferralRecord } from '../../../core/types/growth.types';

interface ReferralLandingPageProps {
  code: string;
  onNavigate: (route: string) => void;
}

export const ReferralLandingPage: React.FC<ReferralLandingPageProps> = ({ code, onNavigate }) => {
  const [referral, setReferral] = useState<IReferralRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Store referral code in browser storage with 30-day attribution window
    const normalizedCode = (code || 'PRIME10').toUpperCase().trim();
    localStorage.setItem('primesoul_referral_code', normalizedCode);
    localStorage.setItem('primesoul_referral_timestamp', Date.now().toString());

    // 2. Track click on backend
    apiService.trackReferralClick(normalizedCode);

    // 3. Load referral details
    apiService.getReferralByCode(normalizedCode).then((ref) => {
      if (ref) setReferral(ref);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 size={32} className="animate-spin text-indigo-400 mb-3" />
        <div className="text-sm font-semibold text-slate-300">Activating Referral Benefits...</div>
      </div>
    );
  }

  const referrerDisplay = referral?.referrerName || 'a PrimeSoul Partner';

  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
          <Gift size={32} />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Sparkles size={13} /> Referral Code Activated: <span className="font-mono">{code.toUpperCase()}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome to PrimeSoul!
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            You were personally referred by <strong>{referrerDisplay}</strong>. Get started with our free digital tools below — your referral benefits will apply automatically:
          </p>
        </div>

        {/* 2 Big Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Option 1: Free Audit */}
          <div
            onClick={() => onNavigate(`/audit?ref=${code}`)}
            className="card-panel hover:border-indigo-500/60 cursor-pointer group transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Search size={20} />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300">
              Free Business Digital Audit
            </h3>
            <p className="text-xs text-slate-400">
              Check your Google rankings, website speed, and WhatsApp conversion score in 30 seconds.
            </p>
            <div className="text-xs font-bold text-indigo-400 flex items-center pt-1">
              Start Free Audit <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Option 2: Free QR Menu */}
          <div
            onClick={() => onNavigate(`/qr-menu?ref=${code}`)}
            className="card-panel hover:border-emerald-500/60 cursor-pointer group transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <QrCode size={20} />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300">
              Free QR Digital Menu
            </h3>
            <p className="text-xs text-slate-400">
              Create a contactless mobile menu and printable QR code for your restaurant or cafe tables.
            </p>
            <div className="text-xs font-bold text-emerald-400 flex items-center pt-1">
              Create Free Menu <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Referred to PrimeSoul Web Solutions • Guaranteed free access to V1 tools
        </div>
      </div>
    </div>
  );
};
