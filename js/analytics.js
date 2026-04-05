/*
 * analytics.js — Google Analytics 4 + Search Console setup
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://analytics.google.com → Create account → "The Resource Investor"
 * 2. Create a Web property → enter your domain
 * 3. Copy the Measurement ID (starts with G-) and replace GA_MEASUREMENT_ID below
 * 4. Go to https://search.google.com/search-console → Add property → your domain
 * 5. Choose "URL prefix" method, enter your site URL
 * 6. Verify via the GA4 method (since GA4 is already installed)
 * 7. Submit sitemap: enter "sitemap.xml" in the Sitemaps section
 */

(function() {
  'use strict';

  var GA_ID = 'G-XXXXXXXXXX'; // REPLACE with your GA4 Measurement ID

  if (GA_ID === 'G-XXXXXXXXXX') return;

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, {
    page_title: document.title,
    page_location: window.location.href,
    content_group: detectContentGroup()
  });

  function detectContentGroup() {
    var path = window.location.pathname;
    if (path.indexOf('/articles/opinion-') !== -1) return 'Opinion Articles';
    if (path.indexOf('/articles/') !== -1) return 'Guides';
    if (path.indexOf('/premium') !== -1) return 'Premium';
    if (path.indexOf('/stocks') !== -1) return 'Stocks';
    if (path.indexOf('/news') !== -1) return 'News';
    return 'General';
  }

  document.querySelectorAll('a[data-affiliate]').forEach(function(link) {
    link.addEventListener('click', function() {
      gtag('event', 'affiliate_click', {
        event_category: 'affiliate',
        event_label: this.getAttribute('data-affiliate'),
        link_url: this.href
      });
    });
  });

  document.querySelectorAll('.premium-cta-btn, #stripe-checkout-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: 14.99,
        items: [{ item_name: 'Premium Subscription', price: 14.99 }]
      });
    });
  });

  document.querySelectorAll('.email-form').forEach(function(form) {
    form.addEventListener('submit', function() {
      gtag('event', 'generate_lead', { event_category: 'email_signup' });
    });
  });
})();
