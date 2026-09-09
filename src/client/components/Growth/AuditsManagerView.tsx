import React, { useState } from 'react';
import { Search, ExternalLink, Globe, MapPin, CheckCircle2, AlertTriangle, Eye, ArrowLeft } from 'lucide-react';
import { IAuditRecord } from '../../../core/types/growth.types';
import { AuditResultView } from './AuditResultView';

interface AuditsManagerViewProps {
  audits: IAuditRecord[];
  onRefresh: () => void;
  onNavigate: (route: string) => void;
}

export const AuditsManagerView: React.FC<AuditsManagerViewProps> = ({ audits, onRefresh, onNavigate }) => {
  const [selectedAudit, setSelectedAudit] = useState<IAuditRecord | null>(null);
  const [search, setSearch] = useState('');

  const filteredAudits = audits.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.businessName.toLowerCase().includes(q) ||
      (a.websiteUrl && a.websiteUrl.toLowerCase().includes(q)) ||
      a.city.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {selectedAudit ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedAudit(null)}
            className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Back to All Audits
          </button>
          <AuditResultView
            audit={selectedAudit}
            onReAudit={() => setSelectedAudit(null)}
            onNavigate={onNavigate}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Search size={20} className="text-indigo-400" /> Business Digital Audits
              </h2>
              <p className="text-xs text-slate-400">
                {filteredAudits.length} total digital health audits conducted
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search audits by business, URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="card-panel overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Business Name</th>
                    <th className="py-3 px-4">Category / City</th>
                    <th className="py-3 px-4">Website URL</th>
                    <th className="py-3 px-4">Health Score</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAudits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No digital health audits recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredAudits.map((aud) => (
                      <tr
                        key={aud.id}
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                        onClick={() => setSelectedAudit(aud)}
                      >
                        <td className="py-3.5 px-4 font-bold text-white text-sm">
                          {aud.businessName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {aud.category} • {aud.city}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {aud.websiteUrl ? (
                            <span className="truncate max-w-[180px] inline-block">{aud.websiteUrl}</span>
                          ) : (
                            <span className="text-slate-600 italic">No URL</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                            aud.score >= 75 ? 'bg-emerald-500/20 text-emerald-300' :
                            aud.score >= 50 ? 'bg-amber-500/20 text-amber-300' :
                            'bg-rose-500/20 text-rose-300'
                          }`}>
                            {aud.score} / 100 • {aud.grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(aud.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAudit(aud);
                            }}
                            className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                          >
                            <Eye size={12} /> View Report
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
