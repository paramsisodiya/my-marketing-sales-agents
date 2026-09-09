import React from 'react';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import { siteConfig } from '../../../core/growth/site.config';

interface LegalPageProps {
  type: 'privacy' | 'terms';
  onNavigate: (route: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onNavigate }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 text-slate-200">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => onNavigate('/')}
          className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            {isPrivacy ? <ShieldCheck size={20} /> : <FileText size={20} />}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
            </h1>
            <div className="text-xs text-slate-400">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {siteConfig.name}
            </div>
          </div>
        </div>

        <div className="card-panel space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {isPrivacy ? (
            <>
              <h3 className="text-base font-bold text-white">1. Information We Collect</h3>
              <p>
                When you use our free tools (such as the Business Digital Audit and Free QR Digital Menu), we collect information necessary to perform the requested service, including your business name, optional website URL, contact information (phone number or email address), and business category.
              </p>

              <h3 className="text-base font-bold text-white">2. How We Use Your Information</h3>
              <p>
                We use collected information solely to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Perform automated digital health audits and generate recommendations.</li>
                <li>Generate and host your restaurant's digital QR menu.</li>
                <li>Contact you regarding consultation requests you explicitly submit.</li>
                <li>Track referral attribution when using a referral code.</li>
              </ul>

              <h3 className="text-base font-bold text-white">3. Data Protection & Security</h3>
              <p>
                We implement industry-standard encryption and security measures. We do not sell, rent, or trade your contact information to third parties.
              </p>

              <h3 className="text-base font-bold text-white">4. Contact Us</h3>
              <p>
                If you have questions regarding this Privacy Policy, you can reach us at <strong>{siteConfig.email}</strong> or by WhatsApp at <strong>{siteConfig.displayWhatsappNumber}</strong>.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-base font-bold text-white">1. Terms of Use</h3>
              <p>
                By accessing or using the PrimeSoul Growth Engine website and tools, you agree to comply with these terms. If you disagree with any part of these terms, please discontinue using the service.
              </p>

              <h3 className="text-base font-bold text-white">2. Free Tools & Service Availability</h3>
              <p>
                Our Free Business Digital Audit and Free QR Digital Menu are provided on an "as-is" basis. PrimeSoul Digital Health Scores represent internal analytical assessments based on public web signals and do not represent official guarantees of search engine ranking or revenue.
              </p>

              <h3 className="text-base font-bold text-white">3. Acceptable Use</h3>
              <p>
                Users agree not to submit malicious URLs, perform unauthorized automated scraping, or attempt server-side request forgery (SSRF) attacks against our infrastructure.
              </p>

              <h3 className="text-base font-bold text-white">4. Disclaimer</h3>
              <p>
                PrimeSoul Web Solutions provides software and digital consultancy. Individual business outcomes vary depending on industry, execution, and local market factors.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
