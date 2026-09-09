import React, { useState } from 'react';
import { Search, Globe, Building2, MapPin, Phone, Mail, Loader2, CheckCircle2, AlertTriangle, ArrowRight, MessageSquare, Sparkles } from 'lucide-react';
import { apiService } from '../../services/api.service';
import { BusinessCategory } from '../../../core/types/growth.types';
import { AuditResultView } from './AuditResultView';

interface AuditPageProps {
  onNavigate: (route: string) => void;
  referralCode?: string;
  auditId?: string;
}

const CATEGORIES: BusinessCategory[] = [
  'Restaurant',
  'Cafe',
  'School',
  'Coaching',
  'Clinic',
  'Salon',
  'Gym',
  'Retail',
  'Real Estate',
  'Professional Service',
  'Other',
];

export const AuditPage: React.FC<AuditPageProps> = ({ onNavigate, referralCode, auditId }) => {
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('Retail');
  const [city, setCity] = useState('');
  const [contact, setContact] = useState(''); // phone or email
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditRecord, setAuditRecord] = useState<any | null>(null);

  // Load audit by ID if passed in route
  React.useEffect(() => {
    if (auditId) {
      apiService.getAuditById(auditId).then(a => {
        if (a) setAuditRecord(a);
      });
    }
  }, [auditId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Please enter your business name.');
      return;
    }

    setLoading(true);
    setError(null);

    const isEmail = contact.includes('@');
    const isPhone = !isEmail && contact.trim().length > 0;

    try {
      const res = await apiService.runAudit({
        businessName: businessName.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        category,
        city: city.trim() || 'India',
        phone: isPhone ? contact.trim() : undefined,
        email: isEmail ? contact.trim() : undefined,
        googleBusinessUrl: googleBusinessUrl.trim() || undefined,
        referralCode,
      });

      if (res && res.audit) {
        setAuditRecord(res.audit);
      } else {
        throw new Error('Could not complete audit. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete digital audit. Please verify the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="audit-page-root">
      {/* Header Banner */}
      <div className="audit-hero-header">
        <div className="max-w-3xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles size={13} /> PrimeSoul Digital Health Check
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            See How Your Business Looks Online
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2">
            Get an instant PrimeSoul Digital Health Score analyzing website load speed, Google Search readiness, SSL encryption, and WhatsApp conversion triggers.
          </p>
          {referralCode && (
            <div className="mt-3 inline-block bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1 rounded-lg">
              🎁 Referral Code Active: <strong className="font-mono">{referralCode}</strong>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {auditRecord ? (
          <AuditResultView
            audit={auditRecord}
            onReAudit={() => { setAuditRecord(null); setBusinessName(''); setWebsiteUrl(''); }}
            onNavigate={onNavigate}
          />
        ) : (
          <div className="audit-form-container">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2.5">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              {/* Business Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Business Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Building2 size={16} className="input-icon" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Dental Care, Royal Spice"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Business Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                    className="form-input bg-slate-900"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Website URL & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Website URL <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="input-with-icon">
                    <Globe size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. yourbusiness.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">City / Location</label>
                  <div className="input-with-icon">
                    <MapPin size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Indore, Jaipur, Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Contact (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Phone or Email <span className="text-xs text-slate-400 font-normal">(Optional for full report)</span>
                  </label>
                  <div className="input-with-icon">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. +91 98260 12345 or info@..."
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Google Business URL <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="input-with-icon">
                    <MapPin size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. g.page/yourbusiness"
                      value={googleBusinessUrl}
                      onChange={(e) => setGoogleBusinessUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3.5 text-base flex items-center justify-center font-bold tracking-wide shadow-lg shadow-indigo-500/25"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" /> Auditing Your Digital Footprint...
                    </>
                  ) : (
                    <>
                      <Search size={18} className="mr-2" /> Check My Business Free
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-xs text-slate-400 pt-2 flex items-center justify-center gap-4">
                <span>🔒 Privacy Protected</span>
                <span>•</span>
                <span>⚡ Instant 30s Real Scan</span>
                <span>•</span>
                <span>❌ No Credit Card</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
