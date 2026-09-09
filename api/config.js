// src/core/growth/site.config.ts
var siteConfig = {
  name: "PrimeSoul Web Solutions",
  shortName: "PrimeSoul",
  tagline: "Build Your Digital Presence. Get More Customers.",
  description: "PrimeSoul helps Indian businesses build a stronger digital presence, generate enquiries, and use modern tools to grow.",
  url: process.env.NEXT_PUBLIC_PRIMESOUL_URL || "https://my-marketing-sales-agents.vercel.app",
  primeOmsUrl: process.env.NEXT_PUBLIC_PRIMEOMS_URL || "https://primeoms.com",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210",
  displayWhatsappNumber: "+91 98765 43210",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@primesoul.in",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 98765 43210",
  address: "Jaipur, Rajasthan, India",
  defaultReferralReward: "\u20B91,000 credit or 1 month PrimeOMS free"
};

// src/api/config.ts
function sendJson(res, status, data) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }
  if (req.method === "GET") {
    return sendJson(res, 200, { success: true, config: siteConfig });
  }
  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
export {
  handler as default
};
