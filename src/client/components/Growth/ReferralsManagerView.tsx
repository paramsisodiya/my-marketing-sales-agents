import React, { useState } from 'react';
import { Gift, Plus, Copy, Check, ExternalLink, Users, TrendingUp, Sparkles, X } from 'lucide-react';
import { IReferralRecord } from '../../../core/types/growth.types';
import { apiService } from '../../services/api.service';

interface ReferralsManagerViewProps {
  referrals: IReferralRecord[];
  onRefresh: () => void;
  onNavigate: (route: string) => void;
}

export const ReferralsManagerView: React.FC<ReferralsManagerViewProps> = ({ referrals, onRefresh, onNavigate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [referrerContact, setReferrerContact] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [referredBusiness, setReferredBusiness] = useState('');

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referrerName.trim()) return;

    try {
      await apiService.createReferral({
        referrerName: referrerName.trim(),
        referrerContact: referrerContact.trim() || undefined,
        customCode: customCode.trim() || undefined,
        referredBusiness: referredBusiness.trim() || undefined,
      });
      onRefresh();
      setIsCreating(false);
      setReferrerName('');
      setReferrerContact('');
      setCustomCode('');
      setReferredBusiness('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/r/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gift size={20} className="text-amber-400" /> Customer Referral Program
          </h2>
          <p className="text-xs text-slate-400">
            Track customer and partner attribution links, clicks, and generated leads
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary text-xs py-2 px-3.5 font-bold flex items-center"
        >
          <Plus size={14} className="mr-1.5" /> Create Referral Code
        </button>
      </div>

      {/* Referrals Table */}
      <div className="card-panel overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Referral Code & Link</th>
                <th className="py-3 px-4">Referrer</th>
                <th className="py-3 px-4">Clicks</th>
                <th className="py-3 px-4">Leads Created</th>
                <th className="py-3 px-4">Deals Won</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No referral codes generated yet.
                  </td>
                </tr>
              ) : (
                referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="font-mono font-bold text-white text-sm text-amber-300">
                        {ref.referralCode}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        /r/{ref.referralCode}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{ref.referrerName}</div>
                      {ref.referrerContact && (
                        <div className="text-[11px] text-slate-400">{ref.referrerContact}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {ref.clicksCount}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {ref.leadsCount}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {ref.wonCount}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                        {ref.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleCopyLink(ref.referralCode)}
                        className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                        title="Copy Referral Link"
                      >
                        {copiedCode === ref.referralCode ? (
                          <>
                            <Check size={12} className="text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy Link
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onNavigate(`/r/${ref.referralCode}`)}
                        className="text-indigo-400 hover:text-indigo-300 p-1"
                        title="Open Landing Page"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Code Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gift size={16} className="text-amber-400" /> Create New Referral Code
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-3.5 text-xs">
              <div>
                <label className="form-label text-xs">Referrer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={referrerName}
                  onChange={(e) => setReferrerName(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs">Referrer Phone / Email</label>
                <input
                  type="text"
                  placeholder="+91 98260 12345"
                  value={referrerContact}
                  onChange={(e) => setReferrerContact(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs">Custom Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. RAJESH10 (Leave blank to auto-generate)"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  className="form-input text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-4 font-bold"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
