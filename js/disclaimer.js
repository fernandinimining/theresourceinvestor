/*
 * disclaimer.js — Injects legal disclaimer banner on all pages.
 * Loads once, dismisses via localStorage.
 */
(function () {
  'use strict';

  if (localStorage.getItem('ri_disclaimer_v1') === 'dismissed') return;

  var banner = document.createElement('div');
  banner.id = 'legal-disclaimer-banner';
  banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#0f172a;color:#e2e8f0;padding:12px 20px;font-size:12px;line-height:1.5;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 -4px 12px rgba(0,0,0,0.3);';
  banner.innerHTML =
    '<div style="flex:1;">' +
    '<strong style="color:#f59e0b;">Important Disclaimer:</strong> ' +
    'Global Mining Intel / The Resource Investor provides information for <strong>educational and research purposes only</strong>. ' +
    'Nothing on this website constitutes investment advice, financial advice, trading advice, or any other sort of advice. ' +
    'You should not treat any of the content as such. We do not recommend that any securities, commodities, or digital assets should be bought, sold, or held by you. ' +
    'Do your own due diligence and consult your financial advisor before making any investment decisions. ' +
    'Past performance is not indicative of future results. Data may contain errors; verify against primary SEC/SEDAR filings.' +
    '</div>' +
    '<button id="dismiss-disclaimer" style="background:#f59e0b;color:#0f172a;border:none;padding:6px 16px;border-radius:6px;font-weight:700;font-size:12px;cursor:pointer;white-space:nowrap;">I Understand</button>';

  document.body.appendChild(banner);

  document.getElementById('dismiss-disclaimer').addEventListener('click', function () {
    banner.remove();
    localStorage.setItem('ri_disclaimer_v1', 'dismissed');
  });
})();
