/*
 * main-v2.js — Core site logic for The Resource Investor v2
 * News fetching, premium gate, stock rendering, Stripe handling
 */
(function () {
  'use strict';

  // ── MOBILE NAV ──
  var toggle = document.querySelector('.mobile-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
  }

  // ── SMOOTH SCROLL ──
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // ── FADE-IN ANIMATIONS ──
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('animate-in'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.card, .stock-card, .news-card, .affiliate-box, .email-cta, .premium-feature').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ── PREMIUM CHECK ──
  function isPremium() {
    try {
      var p = JSON.parse(localStorage.getItem('ri_premium') || '{}');
      return p.active && p.expires && new Date(p.expires) > new Date();
    } catch (e) { return false; }
  }

  function setPremium(months) {
    var exp = new Date();
    exp.setMonth(exp.getMonth() + (months || 1));
    localStorage.setItem('ri_premium', JSON.stringify({ active: true, expires: exp.toISOString() }));
  }

  // Handle Stripe success redirect
  if (window.location.pathname.indexOf('premium-success') !== -1) {
    var params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      setPremium(1);
      var msg = document.getElementById('success-message');
      if (msg) msg.style.display = 'block';
    }
  }

  // Show premium status in header
  document.querySelectorAll('.premium-status').forEach(function (el) {
    el.textContent = isPremium() ? 'Premium Active' : '';
    if (isPremium()) el.style.color = '#f59e0b';
  });

  window.RIPremium = { isPremium: isPremium, setPremium: setPremium };

  // ── EMAIL FORM ──
  document.querySelectorAll('.email-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var btn = form.querySelector('button');
      if (!input || !input.value) return;
      var subs = JSON.parse(localStorage.getItem('ri_subscribers') || '[]');
      if (subs.indexOf(input.value) === -1) { subs.push(input.value); localStorage.setItem('ri_subscribers', JSON.stringify(subs)); }
      btn.textContent = 'Subscribed!'; btn.style.background = '#10b981'; input.value = '';
      setTimeout(function () { btn.textContent = 'Subscribe'; btn.style.background = ''; }, 3000);
    });
  });

  // ── AFFILIATE TRACKING ──
  document.querySelectorAll('a[data-affiliate]').forEach(function (link) {
    link.addEventListener('click', function () {
      var label = this.getAttribute('data-affiliate');
      if (typeof gtag === 'function') { gtag('event', 'affiliate_click', { event_category: 'affiliate', event_label: label, value: 1 }); }
    });
  });

  // ── READING PROGRESS ──
  var progressBar = document.querySelector('.reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    });
  }

  // ── NEWS FETCHING ──
  function renderNewsTicker(items, containerId) {
    var container = document.getElementById(containerId);
    if (!container || !items || items.length === 0) return;
    var html = '';
    items.forEach(function (item) {
      html += '<span class="news-ticker-item"><span class="news-ticker-dot"></span><a href="' + (item.url || '#') + '" target="_blank" rel="noopener">' + escapeHtml(item.title) + '</a></span>';
    });
    container.innerHTML = html + html;
  }

  function renderNewsCards(items, containerId, limit) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var html = '';
    var shown = items.slice(0, limit || 12);
    shown.forEach(function (item) {
      var tag = item.category || 'mining';
      html += '<div class="news-card">';
      html += '<div class="news-card-meta"><span class="news-card-tag ' + tag + '">' + tag + '</span><span>' + (item.source || '') + '</span><span>' + (item.date || '') + '</span></div>';
      html += '<h4><a href="' + (item.url || '#') + '" target="_blank" rel="noopener">' + escapeHtml(item.title) + '</a></h4>';
      html += '</div>';
    });
    container.innerHTML = html;
  }

  function fetchNews(callback) {
    var apiKey = localStorage.getItem('ri_gnews_key');
    if (!apiKey) { callback(typeof NEWS_FALLBACK !== 'undefined' ? NEWS_FALLBACK : []); return; }
    var url = 'https://gnews.io/api/v4/search?q=mining+stocks+OR+copper+price+OR+gold+price&lang=en&max=20&apikey=' + apiKey;
    fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      if (data.articles && data.articles.length > 0) {
        var mapped = data.articles.map(function (a) {
          var cat = 'mining';
          var t = (a.title || '').toLowerCase();
          if (t.indexOf('copper') !== -1) cat = 'copper';
          else if (t.indexOf('gold') !== -1) cat = 'gold';
          else if (t.indexOf('silver') !== -1) cat = 'silver';
          else if (t.indexOf('lithium') !== -1) cat = 'lithium';
          return { title: a.title, source: a.source ? a.source.name : '', date: (a.publishedAt || '').slice(0, 10), category: cat, url: a.url };
        });
        callback(mapped);
      } else { callback(typeof NEWS_FALLBACK !== 'undefined' ? NEWS_FALLBACK : []); }
    }).catch(function () { callback(typeof NEWS_FALLBACK !== 'undefined' ? NEWS_FALLBACK : []); });
  }

  // ── STOCK CARD RENDERING ──
  function renderStockCards(containerId, filter) {
    if (typeof STOCKS_DATA === 'undefined') return;
    var container = document.getElementById(containerId);
    if (!container) return;
    var stocks = STOCKS_DATA;
    if (filter && filter !== 'all') {
      stocks = stocks.filter(function (s) { return s.category === filter || s.tags.indexOf(filter) !== -1; });
    }
    var html = '';
    stocks.forEach(function (s) {
      var ratingClass = s.rating === 'Strong Buy' ? 'strong-buy' : s.rating === 'Buy' ? 'buy' : s.rating === 'Hold' ? 'hold' : 'speculative';
      html += '<div class="stock-card">';
      html += '<span class="stock-category-badge news-card-tag ' + s.category + '">' + s.category + '</span>';
      html += '<div class="stock-card-header"><div><span class="stock-ticker">' + s.ticker + '</span><span class="stock-exchange"> ' + s.exchange + '</span></div></div>';
      html += '<div class="stock-name">' + s.name + ' &middot; ' + s.country + '</div>';
      html += '<div class="stock-metrics">';
      html += '<div><div class="stock-metric-label">EV/EBITDA</div><div class="stock-metric-value">' + (s.ev_ebitda ? s.ev_ebitda + 'x' : 'N/A') + '</div></div>';
      html += '<div><div class="stock-metric-label">Div Yield</div><div class="stock-metric-value">' + (s.div_yield ? s.div_yield + '%' : '0%') + '</div></div>';
      html += '<div><div class="stock-metric-label">Mkt Cap</div><div class="stock-metric-value">$' + (s.market_cap_b || 0) + 'B</div></div>';
      html += '<div><div class="stock-metric-label">Score</div><div class="stock-metric-value" style="color:var(--primary)">' + (s.score || '-') + '/10</div></div>';
      html += '</div>';
      html += '<div class="stock-card-footer"><span class="stock-rating ' + ratingClass + '">' + s.rating + '</span>';
      html += '<a href="premium.html#' + s.ticker + '" style="font-size:12px;font-weight:600;">Analysis &rarr;</a></div>';
      html += '</div>';
    });
    container.innerHTML = html;
  }

  // ── STOCK TABLE RENDERING ──
  function renderStockTable(containerId) {
    if (typeof STOCKS_DATA === 'undefined') return;
    var container = document.getElementById(containerId);
    if (!container) return;
    var html = '<table class="comparison-table"><thead><tr>';
    html += '<th>Ticker</th><th>Company</th><th>Metal</th><th>Exchange</th><th>EV/EBITDA</th><th>Div Yield</th><th>Mkt Cap</th><th>Rating</th>';
    html += '</tr></thead><tbody>';
    STOCKS_DATA.forEach(function (s) {
      html += '<tr>';
      html += '<td><strong>' + s.ticker + '</strong></td>';
      html += '<td>' + s.name + '</td>';
      html += '<td>' + s.category.charAt(0).toUpperCase() + s.category.slice(1) + '</td>';
      html += '<td>' + s.exchange + '</td>';
      html += '<td>' + (s.ev_ebitda ? s.ev_ebitda + 'x' : 'N/A') + '</td>';
      html += '<td>' + (s.div_yield ? s.div_yield + '%' : '-') + '</td>';
      html += '<td>$' + (s.market_cap_b || 0) + 'B</td>';
      html += '<td class="highlight">' + s.rating + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // ── NEWS FILTERING ──
  function setupNewsFilters() {
    var btns = document.querySelectorAll('.news-filter-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        var allCards = document.querySelectorAll('.news-card');
        allCards.forEach(function (card) {
          if (filter === 'all') { card.style.display = ''; return; }
          var tag = card.querySelector('.news-card-tag');
          card.style.display = (tag && tag.textContent.trim().toLowerCase() === filter) ? '' : 'none';
        });
      });
    });
  }

  function setupStockFilters() {
    var btns = document.querySelectorAll('.stock-filter-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.getAttribute('data-filter');
        renderStockCards('stock-card-grid', f);
        renderStockCards('home-stock-grid', f);
      });
    });
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', function () {
    fetchNews(function (items) {
      renderNewsTicker(items, 'news-ticker-content');
      renderNewsCards(items, 'news-cards-grid', 6);
      renderNewsCards(items, 'news-cards-full', 20);
    });

    renderStockCards('stock-card-grid', 'all');
    renderStockCards('home-stock-grid', 'all');
    renderStockTable('stock-full-table');

    setupNewsFilters();
    setupStockFilters();
  });

  window.RIStocks = { renderCards: renderStockCards, renderTable: renderStockTable };
})();
