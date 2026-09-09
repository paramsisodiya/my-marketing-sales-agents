export interface ISiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  url: string;
  primeOmsUrl: string;
  whatsappNumber: string;
  displayWhatsappNumber: string;
  email: string;
  phone: string;
  address: string;
  defaultReferralReward: string;
}

export const siteConfig: ISiteConfig = {
  name: 'PrimeSoul Web Solutions',
  shortName: 'PrimeSoul',
  tagline: 'Build Your Digital Presence. Get More Customers.',
  description: 'PrimeSoul helps Indian businesses build a stronger digital presence, generate enquiries, and use modern tools to grow.',
  url: process.env.NEXT_PUBLIC_PRIMESOUL_URL || 'https://my-marketing-sales-agents.vercel.app',
  primeOmsUrl: process.env.NEXT_PUBLIC_PRIMEOMS_URL || 'https://primeoms.com',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210',
  displayWhatsappNumber: '+91 98765 43210',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@primesoul.in',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+91 98765 43210',
  address: 'Jaipur, Rajasthan, India',
  defaultReferralReward: '₹1,000 credit or 1 month PrimeOMS free',
};

/**
 * Builds a WhatsApp click-to-chat URL with a pre-filled, URI-encoded message.
 */
export function buildWhatsAppLink(message: string, customPhone?: string): string {
  const phone = (customPhone || siteConfig.whatsappNumber).replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}
