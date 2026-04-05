/*
 * live-data.js — Fetches daily-updated stock prices and overlays them on STOCKS_DATA
 * Prices are updated via GitHub Action (fetch-stock-prices.yml) every weekday.
 * Falls back gracefully to the static data in stocks-data.js if unavailable.
 */
(function () {
  'use strict';

  var PRICE_FILE = 'stock-prices.json';

  function formatPrice(n) {
    if (!n && n !== 0) return '—';
    return '$' + n.toFixed(2);
  }

  function formatPct(n) {
    if (!n && n !== 0) return '';
    var sign = n >= 0 ? '+' : '';
    return sign + n.toFixed(2) + '%';
  }

  function formatMarketCap(n) {
    if (!n) return '—';
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(1) + 'T';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(0) + 'M';
    return '$' + n;
  }

  function timeAgo(isoString) {
    if (!isoString) return '';
    var diff = Date.now() - new Date(isoString).getTime();
    var hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'just now';
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24);
    return days + 'd ago';
  }

  function renderPriceBadges(prices, fetchedAt) {
    if (typeof STOCKS_DATA === 'undefined') return;

    STOCKS_DATA.forEach(function (stock) {
      var p = prices[stock.ticker];
      if (!p) return;

      if (p.marketCap) {
        stock.market_cap_b = Math.round(p.marketCap / 1e9 * 10) / 10;
      }
      if (p.pe) stock.pe_ratio = Math.round(p.pe * 10) / 10;

      stock._live = p;
    });

    document.querySelectorAll('.stock-card').forEach(function (card) {
      var tickerEl = card.querySelector('.stock-ticker');
      if (!tickerEl) return;
      var ticker = tickerEl.textContent.trim();
      var p = prices[ticker];
      if (!p) return;

      var existing = card.querySelector('.live-price-row');
      if (existing) existing.remove();

      var row = document.createElement('div');
      row.className = 'live-price-row';
      row.style.cssText = 'display:flex;align-items:center;gap:8px;margin:8px 0 4px;padding:8px 0;border-top:1px solid rgba(0,0,0,0.06);';

      var priceSpan = document.createElement('span');
      priceSpan.style.cssText = 'font-size:18px;font-weight:700;color:var(--text-primary);';
      priceSpan.textContent = formatPrice(p.price);

      var changeSpan = document.createElement('span');
      var isUp = p.changePct >= 0;
      changeSpan.style.cssText = 'font-size:13px;font-weight:600;padding:2px 6px;border-radius:4px;' +
        (isUp ? 'color:#059669;background:#d1fae5;' : 'color:#dc2626;background:#fee2e2;');
      changeSpan.textContent = formatPct(p.changePct);

      row.appendChild(priceSpan);
      row.appendChild(changeSpan);

      var header = card.querySelector('.stock-card-header');
      if (header && header.nextSibling) {
        header.parentNode.insertBefore(row, header.nextSibling);
      } else {
        card.insertBefore(row, card.children[2] || null);
      }
    });

    var badge = document.getElementById('live-data-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'live-data-badge';
      badge.style.cssText = 'text-align:center;font-size:12px;color:var(--text-secondary);padding:4px;';
      var stockSection = document.querySelector('#home-stock-grid, #stock-card-grid');
      if (stockSection && stockSection.parentNode) {
        stockSection.parentNode.insertBefore(badge, stockSection);
      }
    }
    badge.innerHTML = '<span style="display:inline-block;width:8px;height:8px;background:#10b981;border-radius:50;margin-right:4px;vertical-align:middle;"></span>Live prices updated ' + timeAgo(fetchedAt);

    updateMetalPricesBar(prices);
  }

  function updateMetalPricesBar(data) {
    if (!data || !window._metalPricesFromJSON) return;
    var metals = window._metalPricesFromJSON;

    if (typeof METAL_DEFAULTS !== 'undefined') {
      if (metals.copper && metals.copper.price) METAL_DEFAULTS.copper.current = metals.copper.price;
      if (metals.gold && metals.gold.price) METAL_DEFAULTS.gold.current = metals.gold.price;
      if (metals.silver && metals.silver.price) METAL_DEFAULTS.silver.current = metals.silver.price;
    }
  }

  function renderMetalTicker(metals) {
    var bar = document.getElementById('metal-prices-bar');
    if (!bar || !metals) return;

    var html = '';
    var items = [
      { key: 'copper', label: 'Copper', unit: '/lb' },
      { key: 'gold', label: 'Gold', unit: '/oz' },
      { key: 'silver', label: 'Silver', unit: '/oz' }
    ];

    items.forEach(function (item) {
      var m = metals[item.key];
      if (!m) return;
      var isUp = m.change >= 0;
      html += '<span class="metal-price-item" style="margin-right:24px;">';
      html += '<strong>' + item.label + '</strong> ';
      html += formatPrice(m.price) + item.unit + ' ';
      html += '<span style="color:' + (isUp ? '#059669' : '#dc2626') + ';font-weight:600;">' + formatPct(m.change) + '</span>';
      html += '</span>';
    });

    bar.innerHTML = html;
  }

  function loadLivePrices() {
    fetch(PRICE_FILE + '?t=' + Date.now())
      .then(function (r) {
        if (!r.ok) throw new Error('No price file');
        return r.json();
      })
      .then(function (data) {
        if (data.prices && data.count > 0) {
          if (data.metals) {
            window._metalPricesFromJSON = data.metals;
            renderMetalTicker(data.metals);
          }
          renderPriceBadges(data.prices, data.fetched_at);

          if (typeof window.RIStocks !== 'undefined') {
            window.RIStocks.renderCards('stock-card-grid', 'all');
            window.RIStocks.renderCards('home-stock-grid', 'all');
            window.RIStocks.renderTable('stock-full-table');
          }
        }
      })
      .catch(function () {
        // No live data available — static data remains
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(loadLivePrices, 300);
    });
  } else {
    setTimeout(loadLivePrices, 300);
  }
})();
