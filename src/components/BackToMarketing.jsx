import React from 'react';
import { getMarketingUrl } from '../utils/urlHelper';

/** Full navigation to marketing site (appifyai.com) — use on app subdomain only */
export default function BackToMarketing({ className = '' }) {
  return (
    <a
      href={getMarketingUrl('/')}
      className={`inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-white transition-colors ${className}`}
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to website
    </a>
  );
}
