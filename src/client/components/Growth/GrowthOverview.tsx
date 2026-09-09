import React from 'react';
import {
  Users,
  Search,
  QrCode,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { ILead } from '../../../core/types/lead.types';
import { IAuditRecord, IQRRestaurant, IReferralRecord } from '../../../core/types/growth.types';

interface GrowthOverviewProps {
  leads: ILead[];
  audits: IAuditRecord[];
  restaurants: IQRRestaurant[];
  referrals: IReferralRecord[];
  onNavigateTab: (tab: string) => void;
}

export const GrowthOverview: React.FC<GrowthOverviewProps> = ({
  leads,
  audits,
  restaurants,
  referrals,
  onNavigateTab,
}) => {
  const newLeadsCount = leads.filter(l => l.growthStatus === 'NEW' || l.qualificationStatus === 'UNQUALIFIED').length;
  const qualifiedLeadsCount = leads.filter(l => l.growthStatus === 'QUALIFIED' || l.qualificationStatus === 'QUALIFIED').length;
  const hotLeadsCount = leads.filter(l => l.leadTemperature === 'HOT' || l.leadScore >= 80).length;
  const demosCount = leads.filter(l => l.growthStatus === 'DEMO' || l.outreachStatus === 'CALL_SCHEDULED').length;
  const wonCount = leads.filter(l => l.growthStatus === 'WON' || l.outreachStatus === 'CLOSED_WON').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Banner */}
      <div className="card-panel bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/30 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-2">
              <ShieldCheck size={13} /> PrimeSoul Growth Engine Dashboard
            </div>
            <h2 className="text-2xl font-black text-white">Today's Growth Numbers</h2>
            <p className="text-xs text-slate-300 mt-1">
              Live funnel performance across website audits, restaurant QR menus, and customer acquisition.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigateTab('growth_leads')}
              className="btn-primary text-xs py-2 px-3.5 flex items-center font-bold"
            >
              <Users size={14} className="mr-1.5" /> View All Leads
            </button>
            <button
              onClick={() => onNavigateTab('growth_audits')}
              className="btn-secondary text-xs py-2 px-3 flex items-center"
            >
              <Search size={14} className="mr-1.5 text-indigo-400" /> Audits ({audits.length})
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Leads */}
        <div className="metric-box bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Leads</div>
          <div className="text-2xl font-extrabold text-white">{leads.length}</div>
          <div className="text-[10px] text-slate-500">Inbound pipeline</div>
        </div>

        {/* Hot Leads */}
        <div className="metric-box bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl space-y-1">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Flame size={13} /> Hot Leads
          </div>
          <div className="text-2xl font-extrabold text-amber-300">{hotLeadsCount}</div>
          <div className="text-[10px] text-amber-400/80">Score ≥ 80 / Immediate</div>
        </div>

        {/* Qualified */}
        <div className="metric-box bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl space-y-1">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Qualified</div>
          <div className="text-2xl font-extrabold text-emerald-300">{qualifiedLeadsCount}</div>
          <div className="text-[10px] text-emerald-400/80">Clear requirement</div>
        </div>

        {/* Demos Scheduled */}
        <div className="metric-box bg-cyan-950/20 border border-cyan-500/30 p-4 rounded-xl space-y-1">
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Demos</div>
          <div className="text-2xl font-extrabold text-cyan-300">{demosCount}</div>
          <div className="text-[10px] text-cyan-400/80">PrimeOMS & SEO</div>
        </div>

        {/* Closed Won */}
        <div className="metric-box bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl space-y-1">
          <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Closed Won</div>
          <div className="text-2xl font-extrabold text-indigo-300">{wonCount}</div>
          <div className="text-[10px] text-indigo-400/80">Active clients</div>
        </div>

        {/* QR Menus Active */}
        <div className="metric-box bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <QrCode size={13} /> QR Menus
          </div>
          <div className="text-2xl font-extrabold text-white">{restaurants.length}</div>
          <div className="text-[10px] text-slate-500">Live restaurants</div>
        </div>
      </div>

      {/* Dual Highlights: Recent Inbound Leads & Recent Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inbound Leads */}
        <div className="card-panel space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Users size={16} className="text-indigo-400" /> Recent Inbound Leads
            </h3>
            <button
              onClick={() => onNavigateTab('growth_leads')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View All →
            </button>
          </div>

          <div className="space-y-2">
            {leads.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{lead.businessName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({lead.industry || lead.businessCategory})</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {lead.phone || lead.email || 'No direct phone'} • {lead.location || 'India'}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    (lead.leadTemperature === 'HOT' || lead.leadScore >= 80)
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {lead.leadScore} pts • {lead.leadTemperature || 'WARM'}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                    {lead.growthStatus || lead.qualificationStatus}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Business Audits */}
        <div className="card-panel space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Search size={16} className="text-emerald-400" /> Recent Digital Health Audits
            </h3>
            <button
              onClick={() => onNavigateTab('growth_audits')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              View Audits →
            </button>
          </div>

          <div className="space-y-2">
            {audits.slice(0, 4).map((aud) => (
              <div
                key={aud.id}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white">{aud.businessName}</div>
                  <div className="text-slate-400 text-[11px] truncate max-w-[200px]">
                    {aud.websiteUrl || 'No website provided'} • {aud.category}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                    aud.score >= 75 ? 'bg-emerald-500/20 text-emerald-300' :
                    aud.score >= 50 ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {aud.score} / 100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
