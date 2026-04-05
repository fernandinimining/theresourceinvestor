/*
 * email-signup.js — Email capture via formsubmit.co + GA4 tracking
 * Sends subscriber emails to theresourceinvestorcu@gmail.com
 * Upgrade path: replace with Beehiiv/ConvertKit embed when ready.
 */
(function () {
  'use strict';

  var FORMSUBMIT_URL = 'https://formsubmit.co/ajax/theresourceinvestorcu@gmail.com';

  document.querySelectorAll('.email-form').forEach(function (form) {
    form.removeAttribute('action');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var btn = form.querySelector('button');
      if (!input || !input.value) return;

      var email = input.value.trim();
      if (!email) return;

      btn.textContent = 'Sending...';
      btn.disabled = true;

      fetch(FORMSUBMIT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          _subject: 'New GMI Subscriber: ' + email,
          _template: 'table',
          source: window.location.pathname,
          timestamp: new Date().toISOString()
        })
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success === 'true' || data.success === true) {
          btn.textContent = 'Subscribed!';
          btn.style.background = '#10b981';
          input.value = '';

          var subs = JSON.parse(localStorage.getItem('ri_subscribers') || '[]');
          if (subs.indexOf(email) === -1) {
            subs.push(email);
            localStorage.setItem('ri_subscribers', JSON.stringify(subs));
          }

          if (typeof gtag === 'function') {
            gtag('event', 'generate_lead', {
              event_category: 'email_signup',
              event_label: window.location.pathname
            });
          }

          setTimeout(function () {
            btn.textContent = 'Subscribe';
            btn.style.background = '';
            btn.disabled = false;
          }, 4000);
        } else {
          throw new Error('Submission failed');
        }
      })
      .catch(function () {
        btn.textContent = 'Try again';
        btn.style.background = '#ef4444';
        btn.disabled = false;
        setTimeout(function () {
          btn.textContent = 'Subscribe';
          btn.style.background = '';
        }, 3000);
      });
    });
  });
})();
