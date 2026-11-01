// Vercel already sends Strict-Transport-Security; these cover the rest.
const securityHeaders = [
  // Nobody can show the site inside a frame, which blocks clickjacking.
  // X-Frame-Options is the fallback for browsers without frame-ancestors.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  // Browsers use the declared content type instead of guessing one.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites see only the domain a visitor came from, not the full URL.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site uses none of these, so nothing on it can ask for them.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
