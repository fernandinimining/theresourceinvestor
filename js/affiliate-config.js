/*
 * affiliate-config.js — Central affiliate link configuration
 * 
 * INSTRUCTIONS: Sign up for each program below, get your tracked URL,
 * and paste it in place of the placeholder. Every affiliate link on
 * the entire site will update automatically.
 *
 * PAYOUT SUMMARY:
 *   Interactive Brokers — $200-600/funded account — pays via direct deposit
 *   TradingView         — up to $15/subscription  — pays via PayPal
 *   Webull              — $20-75/funded account    — pays via account credit
 *   Seeking Alpha       — $15-35/Premium signup    — pays via Impact.com (PayPal/deposit)
 *   Koyfin              — 20-30% recurring         — pays via PayPal
 *   Finviz              — $5-10/Elite subscription  — pays via PayPal
 *
 * SIGNUP LINKS (open these in your browser):
 *   IBKR:          https://www.interactivebrokers.com/en/trading/ib-account-referral-program.php
 *   TradingView:   https://www.tradingview.com/partner-program/
 *   Webull:        https://www.webull.com/activity
 *   Seeking Alpha: https://seekingalpha.com/page/affiliate-program  (or apply via Impact.com)
 *   Koyfin:        https://www.koyfin.com  (contact for affiliate program)
 *   Finviz:        https://finviz.com  (contact for affiliate program)
 */

var AFFILIATE_LINKS = {
  ibkr:          'https://www.interactivebrokers.com',          // REPLACE with your IBKR referral link
  tradingview:   'https://www.tradingview.com/?aff_id=XXXXX',   // REPLACE with your TradingView partner link
  webull:        'https://www.webull.com',                       // REPLACE with your Webull referral link
  seekingalpha:  'https://www.seekingalpha.com',                 // REPLACE with your Seeking Alpha affiliate link
  koyfin:        'https://www.koyfin.com',                       // REPLACE with your Koyfin affiliate link
  finviz:        'https://finviz.com'                            // REPLACE with your Finviz affiliate link
};

(function() {
  'use strict';

  var domainMap = {
    'interactivebrokers.com': 'ibkr',
    'tradingview.com':        'tradingview',
    'webull.com':             'webull',
    'seekingalpha.com':       'seekingalpha',
    'koyfin.com':             'koyfin',
    'finviz.com':             'finviz'
  };

  document.addEventListener('DOMContentLoaded', function() {
    var links = document.querySelectorAll('a[rel*="sponsored"], a[data-affiliate]');
    links.forEach(function(a) {
      var href = a.getAttribute('href') || '';
      Object.keys(domainMap).forEach(function(domain) {
        if (href.indexOf(domain) !== -1) {
          var key = domainMap[domain];
          if (AFFILIATE_LINKS[key] && AFFILIATE_LINKS[key] !== href) {
            a.setAttribute('href', AFFILIATE_LINKS[key]);
          }
        }
      });
    });
  });
})();
