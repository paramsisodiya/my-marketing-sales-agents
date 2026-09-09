import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Phone,
  Mail,
  User,
  Clock,
  Send,
  Building2,
  Globe,
} from 'lucide-react';
import { IAuditRecord, LeadRequirement, LeadTimeline } from '../../../core/types/growth.types';
import { apiService } from '../../services/api.service';
import { buildWhatsAppLink } from '../../../core/growth/site.config';

interface AuditResultViewProps {
  audit: IAuditRecord;
  onReAudit: () => void;
  onNavigate: (route: string) => void;
}

export const AuditResultView: React.FC<AuditResultViewProps> = ({ audit, onReAudit, onNavigate }) => {
  const [consultName, setConsultName] = useState(audit.contact || '');
  const [consultPhone, setConsultPhone] = useState(audit.phone || '');
  const [consultEmail, setConsultEmail] = useState(audit.email || '');
  const [requirement, setRequirement] = useState<LeadRequirement>('Website');
  const [timeline, setTimeline] = useState<LeadTimeline>('Immediately');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<boolean>(false);

  const results = audit.resultsJson;
  const score = audit.score || 0;

  // Grade badge styling
  const getGradeStyle = (score: number) => {
    if (score >= 90) return { label: 'Excellent', bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' };
    if (score >= 75) return { label: 'Good', bg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' };
    if (score >= 50) return { label: 'Needs Improvement', bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300' };
    return { label: 'Major Opportunities', bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300' };
  };

  const gradeInfo = getGradeStyle(score);

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultPhone && !consultEmail) {
      alert('Please provide your phone number or email address so our team can reach you.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.saveLead({
        businessName: audit.businessName,
        businessCategory: audit.category,
        website: audit.websiteUrl,
        contactName: consultName,
        phone: consultPhone,
        email: consultEmail,
        city: audit.city,
        location: audit.city || 'India',
        source: 'AUDIT',
        sourceDetail: 'audit_consultation_request',
        requirement,
        timeline,
        auditId: audit.id,
        digitalPresenceScore: audit.score,
        growthStatus: 'QUALIFIED',
      });

      apiService.logEvent('audit_contact_submitted', {
        auditId: audit.id,
        score: audit.score,
        requirement,
        timeline,
      });

      setSubmittedLead(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit consultation request. Please try WhatsApp directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = `Hi PrimeSoul! I just ran a free audit for ${audit.businessName} (Score: ${score}/100) and would like to discuss fixing the identified gaps.`;
  const whatsappHref = buildWhatsAppLink(whatsappMessage);

  return (
    <div className="audit-results-wrapper space-y-8 animate-fadeIn">
      {/* 1. TOP SCORE CARD */}
      <div className="score-hero-card">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {audit.category} • {audit.city}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${gradeInfo.bg}`}>
                {gradeInfo.label}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {audit.businessName}
            </h2>
            {audit.websiteUrl && (
              <a
                href={audit.websiteUrl.startsWith('http') ? audit.websiteUrl : `https://${audit.websiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center"
              >
                <Globe size={12} className="mr-1" /> {audit.websiteUrl}
              </a>
            )}
          </div>

          {/* Score Meter Dial */}
          <div className="score-dial-box">
            <div className="score-number">{score}</div>
            <div className="score-total">/ 100</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Digital Health Score
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-3 mt-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              score >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
              score >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
              'bg-gradient-to-r from-rose-500 to-orange-400'
            }`}
            style={{ width: `${Math.max(8, score)}%` }}
          ></div>
        </div>
      </div>

      {/* 2. THREE PILLARS BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* What's Working */}
        <div className="breakdown-card border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-3">
            <CheckCircle2 size={18} /> What's Working
          </div>
          {results.strengths && results.strengths.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-200">
              {results.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">Basic presence verified.</p>
          )}
        </div>

        {/* Needs Attention */}
        <div className="breakdown-card border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-3">
            <AlertTriangle size={18} /> Needs Attention
          </div>
          {results.issues && results.issues.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-200">
              {results.issues.map((iss, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 shrink-0 font-bold">!</span>
                  <span>{iss}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-400 font-medium">No critical issues detected.</p>
          )}
        </div>

        {/* Opportunities */}
        <div className="breakdown-card border-indigo-500/30 bg-indigo-950/10">
          <div className="flex items-center gap-2 text-indigo-400 font-bold mb-3">
            <TrendingUp size={18} /> Growth Opportunities
          </div>
          {results.opportunities && results.opportunities.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-200">
              {results.opportunities.map((opp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 shrink-0 font-bold">→</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">Consistent optimization recommended.</p>
          )}
        </div>
      </div>

      {/* 3. DETAILED TECHNICAL CHECKS */}
      <div className="card-panel">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap size={18} className="text-indigo-400" /> Detailed Diagnostic Checks
        </h3>
        <div className="divide-y divide-slate-800">
          {results.checks.map((chk) => (
            <div key={chk.id} className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm">
              <div className="space-y-0.5">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>{chk.name}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5 py-0.5 rounded bg-slate-800">
                    {chk.category}
                  </span>
                </div>
                <div className="text-slate-400 text-xs">{chk.details}</div>
              </div>
              <div className="shrink-0 text-right">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                  chk.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {chk.passed ? `+${chk.score} pts` : `0 / ${chk.maxScore}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. RECOMMENDED PRIMESOUL ACTIONS */}
      {results.recommendedActions && results.recommendedActions.length > 0 && (
        <div className="card-panel bg-gradient-to-r from-slate-900 to-indigo-950/40 border-indigo-500/30">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-base mb-2">
            <Sparkles size={16} /> Recommended PrimeSoul Action Plan
          </div>
          <p className="text-xs text-slate-300 mb-4">
            Based on the technical gaps identified in this audit, here are the highest-impact implementations:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.recommendedActions.map((act, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs font-semibold text-white">{act}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. LEAD CAPTURE / CONSULTATION SECTION */}
      <div className="consultation-box">
        <div className="text-center max-w-xl mx-auto mb-6">
          <h3 className="text-2xl font-extrabold text-white">Want Help Fixing These?</h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
            Book a quick 10-minute strategy discussion with our engineers. We'll show you exactly how to achieve a 90+ Digital Health Score.
          </p>
        </div>

        {submittedLead ? (
          <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Thank You! Your Request is Received</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              A PrimeSoul specialist will review your audit report for <strong>{audit.businessName}</strong> and connect with you shortly.
            </p>
            <div className="pt-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary bg-emerald-600 hover:bg-emerald-500 text-xs py-2 px-4 inline-flex items-center"
              >
                <MessageSquare size={14} className="mr-1.5" /> Continue Directly on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConsultSubmit} className="space-y-4 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="form-label text-xs">Your Name</label>
                <div className="input-with-icon">
                  <User size={14} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Owner / Manager"
                    value={consultName}
                    onChange={(e) => setConsultName(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">Phone Number *</label>
                <div className="input-with-icon">
                  <Phone size={14} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="+91 98260 12345"
                    value={consultPhone}
                    onChange={(e) => setConsultPhone(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">Email</label>
                <div className="input-with-icon">
                  <Mail size={14} className="input-icon" />
                  <input
                    type="email"
                    placeholder="contact@business.in"
                    value={consultEmail}
                    onChange={(e) => setConsultEmail(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label text-xs">Primary Requirement</label>
                <select
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value as LeadRequirement)}
                  className="form-input text-xs bg-slate-900"
                >
                  <option value="Website">Modern Website Development</option>
                  <option value="Google Business">Google Business & Local 3-Pack SEO</option>
                  <option value="Social Media">Social Media Branding</option>
                  <option value="Digital Marketing">Google & Meta Ads</option>
                  <option value="Lead Generation">Admissions / Lead Generation</option>
                  <option value="PrimeOMS">PrimeOMS Restaurant System</option>
                  <option value="Restaurant QR Menu">Free Restaurant QR Menu</option>
                  <option value="Not Sure">Not Sure / Full Transformation</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xs">Implementation Timeline</label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value as LeadTimeline)}
                  className="form-input text-xs bg-slate-900"
                >
                  <option value="Immediately">Immediately (Ready to start)</option>
                  <option value="Within 7 days">Within 7 days</option>
                  <option value="Within 30 days">Within 30 days</option>
                  <option value="Later">Later (Exploring options)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 py-3 text-sm font-bold flex items-center justify-center"
              >
                {isSubmitting ? 'Sending Request...' : 'Request Free Consultation'} <Send size={15} className="ml-1.5" />
              </button>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex-1 py-3 text-sm font-bold flex items-center justify-center border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
              >
                <MessageSquare size={16} className="mr-1.5 text-emerald-400" /> WhatsApp PrimeSoul
              </a>
            </div>
          </form>
        )}
      </div>

      {/* Re-audit Button */}
      <div className="text-center pt-4">
        <button
          onClick={onReAudit}
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5"
        >
          <RefreshCw size={13} /> Audit Another Business
        </button>
      </div>
    </div>
  );
};
