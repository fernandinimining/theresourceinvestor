(function() {
  'use strict';

  // Mobile nav toggle
  var toggle = document.querySelector('.mobile-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Intersection observer for fade-in animations
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .affiliate-box, .email-cta').forEach(function(el) {
      observer.observe(el);
    });
  }

  // Email form handling (stores to localStorage as placeholder)
  document.querySelectorAll('.email-form').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var btn = form.querySelector('button');
      if (!input || !input.value) return;

      var subs = JSON.parse(localStorage.getItem('ri_subscribers') || '[]');
      if (subs.indexOf(input.value) === -1) {
        subs.push(input.value);
        localStorage.setItem('ri_subscribers', JSON.stringify(subs));
      }

      btn.textContent = 'Subscribed!';
      btn.style.background = '#10b981';
      input.value = '';

      setTimeout(function() {
        btn.textContent = 'Subscribe';
        btn.style.background = '';
      }, 3000);
    });
  });

  // Affiliate link click tracking (GA4-ready)
  document.querySelectorAll('a[data-affiliate]').forEach(function(link) {
    link.addEventListener('click', function() {
      var label = this.getAttribute('data-affiliate');
      if (typeof gtag === 'function') {
        gtag('event', 'affiliate_click', {
          event_category: 'affiliate',
          event_label: label,
          value: 1,
        });
      }
      console.log('[Affiliate Click]', label, this.href);
    });
  });

  // Reading progress bar
  var progressBar = document.querySelector('.reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', function() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    });
  }

  // Table of contents - active state tracking
  var tocLinks = document.querySelectorAll('.toc a');
  if (tocLinks.length > 0) {
    var headings = [];
    tocLinks.forEach(function(link) {
      var id = link.getAttribute('href');
      if (id && id.startsWith('#')) {
        var heading = document.querySelector(id);
        if (heading) headings.push({ el: heading, link: link });
      }
    });

    if (headings.length > 0) {
      window.addEventListener('scroll', function() {
        var scrollPos = window.scrollY + 100;
        var current = headings[0];
        headings.forEach(function(h) {
          if (h.el.offsetTop <= scrollPos) current = h;
        });
        tocLinks.forEach(function(l) { l.style.color = ''; l.style.fontWeight = ''; });
        if (current) {
          current.link.style.color = 'var(--primary)';
          current.link.style.fontWeight = '600';
        }
      });
    }
  }
})();
