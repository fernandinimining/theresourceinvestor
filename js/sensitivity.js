/*
 * sensitivity.js — Interactive mining stock sensitivity analysis engine
 * Premium feature: metal price sliders with real-time financial impact
 * Model: Anchored on reported financials; metal price changes flow through at ~85% to EBITDA
 */
(function () {
  'use strict';

  function isPremium() {
    try {
      var p = JSON.parse(localStorage.getItem('ri_premium') || '{}');
      return p.active && p.expires && new Date(p.expires) > new Date();
    } catch (e) { return false; }
  }

  function getDefaultPrice(metal) {
    return (typeof METAL_DEFAULTS !== 'undefined' && METAL_DEFAULTS[metal]) ? METAL_DEFAULTS[metal].current : 0;
  }

  function getLivePrice(stock) {
    if (stock && stock._live && stock._live.price) return stock._live.price;
    return null;
  }

  function calcDeltaRevenueM(stock, prices) {
    var delta = 0;
    Object.keys(stock.metals).forEach(function (metal) {
      var m = stock.metals[metal];
      var currentPrice = prices[metal] || 0;
      var defaultPrice = getDefaultPrice(metal);
      var priceDelta = currentPrice - defaultPrice;

      if (m.production_mlbs) {
        delta += m.production_mlbs * priceDelta;
      } else if (m.production_koz) {
        delta += m.production_koz * priceDelta / 1000;
      } else if (m.production_kt) {
        delta += m.production_kt * priceDelta / 1000;
      } else if (m.production_mt) {
        delta += m.production_mt * priceDelta;
      } else if (m.production_kt_lce) {
        delta += m.production_kt_lce * priceDelta / 1000;
      }
    });
    return delta;
  }

  function calcStockSensitivity(stock, prices) {
    if (!stock || !stock.metals || !stock.financials) return null;
    var f = stock.financials;
    var deltaM = calcDeltaRevenueM(stock, prices);

    var flowThrough = 0.85;
    var revenueM = f.revenue_m + deltaM;
    var ebitdaM = f.ebitda_m + (deltaM * flowThrough);
    var marginPct = revenueM > 0 ? (ebitdaM / revenueM) * 100 : 0;
    var fcfM = ebitdaM - (f.capex_m || 0);
    var afterTaxM = fcfM * (1 - (f.tax_rate || 0.30));
    var multiple = stock.ev_ebitda || 6;
    var evM = ebitdaM * multiple;
    var equityM = evM - (f.net_debt_m || 0);
    var perShare = f.shares_m ? equityM / f.shares_m : 0;

    return {
      revenue_m: Math.round(revenueM),
      ebitda_m: Math.round(ebitdaM),
      fcf_m: Math.round(fcfM),
      after_tax_fcf_m: Math.round(afterTaxM),
      implied_ev_m: Math.round(evM),
      implied_equity_m: Math.round(equityM),
      per_share: Math.round(perShare * 100) / 100,
      margin_pct: Math.round(marginPct)
    };
  }

  function buildHeatmap(stock, metalKey, metalLabel, metalUnit, basePrice, otherPrices) {
    if (!stock || !stock.metals || !stock.metals[metalKey]) return null;
    var steps = [-30, -20, -10, 0, 10, 20, 30];
    var rows = [];
    steps.forEach(function (pctChange) {
      var price = basePrice * (1 + pctChange / 100);
      var testPrices = {};
      Object.keys(otherPrices).forEach(function (k) { testPrices[k] = otherPrices[k]; });
      testPrices[metalKey] = price;
      var result = calcStockSensitivity(stock, testPrices);
      rows.push({
        pct: pctChange,
        price: Math.round(price * 100) / 100,
        ebitda: result ? result.ebitda_m : 0,
        per_share: result ? result.per_share : 0,
        margin: result ? result.margin_pct : 0
      });
    });
    return { metal: metalLabel, unit: metalUnit, rows: rows };
  }

  function fmtM(n) {
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'B';
    return '$' + n.toLocaleString() + 'M';
  }

  function renderSensitivityWidget(containerId, stock) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!isPremium()) {
      container.innerHTML =
        '<div class="premium-gate">' +
          '<div class="premium-gate-blur">' +
            '<div class="sensitivity-preview"></div>' +
          '</div>' +
          '<div class="premium-gate-overlay">' +
            '<div class="premium-gate-icon">&#9733;</div>' +
            '<h3>Premium Sensitivity Analysis</h3>' +
            '<p>Adjust metal prices and see real-time impact on ' + stock.name + '\'s revenue, EBITDA, and per-share value.</p>' +
            '<a href="premium.html" class="affiliate-btn" style="margin-top:12px;">Unlock Premium — $29.99/mo &rarr;</a>' +
          '</div>' +
        '</div>';
      return;
    }

    var metals = Object.keys(stock.metals);
    var currentPrices = {};
    metals.forEach(function (m) {
      currentPrices[m] = getDefaultPrice(m);
    });

    var livePrice = getLivePrice(stock);
    var priceTag = livePrice ? '<span style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:700;color:var(--primary);background:rgba(37,99,235,0.08);padding:4px 10px;border-radius:6px;">Current: $' + livePrice.toFixed(2) + '</span>' : '';

    var html = '<div class="sensitivity-tool">';
    html += '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;">';
    html += '<h3 class="sensitivity-title" style="margin:0;"><span class="premium-badge">PREMIUM</span> ' + stock.ticker + ' Sensitivity Analysis</h3>';
    html += priceTag;
    html += '</div>';

    html += '<div class="sensitivity-sliders">';
    metals.forEach(function (m) {
      var def = METAL_DEFAULTS[m];
      if (!def) return;
      var min = Math.round(def.current * 0.5 * 100) / 100;
      var max = Math.round(def.current * 2.0 * 100) / 100;
      var step = def.current < 10 ? 0.05 : def.current < 100 ? 0.5 : def.current < 1000 ? 10 : 100;
      html += '<div class="slider-group">';
      html += '<label>' + def.label + ' <span class="slider-value" id="sv-' + containerId + '-' + m + '">' + def.current + ' ' + def.unit + '</span></label>';
      html += '<input type="range" class="metal-slider" data-metal="' + m + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + def.current + '">';
      html += '</div>';
    });
    html += '</div>';

    html += '<div class="sensitivity-results" id="results-' + containerId + '"></div>';
    html += '<div class="sensitivity-heatmap" id="heatmap-' + containerId + '"></div>';
    html += '<p class="sensitivity-disclaimer">Model anchored on reported FY financials. Revenue delta from price changes flows to EBITDA at ~85%. EV/EBITDA multiple: ' + (stock.ev_ebitda || 6) + 'x. Not financial advice.</p>';
    html += '</div>';

    container.innerHTML = html;

    function update() {
      var sliders = container.querySelectorAll('.metal-slider');
      var prices = {};
      sliders.forEach(function (s) {
        var metal = s.getAttribute('data-metal');
        prices[metal] = parseFloat(s.value);
        var lbl = document.getElementById('sv-' + containerId + '-' + metal);
        var def = METAL_DEFAULTS[metal];
        if (lbl && def) lbl.textContent = parseFloat(s.value).toLocaleString() + ' ' + def.unit;
      });

      var result = calcStockSensitivity(stock, prices);
      if (!result) return;

      var shareClass = result.per_share >= 0 ? 'positive' : 'negative';
      var livePx = getLivePrice(stock);
      var upsideHtml = '';
      if (livePx && result.per_share > 0) {
        var upside = ((result.per_share - livePx) / livePx * 100).toFixed(1);
        var upsideColor = upside >= 0 ? '#059669' : '#dc2626';
        upsideHtml = '<div style="font-size:11px;color:' + upsideColor + ';margin-top:2px;">' + (upside >= 0 ? '+' : '') + upside + '% vs market</div>';
      }

      var resultsDiv = document.getElementById('results-' + containerId);
      if (resultsDiv) {
        resultsDiv.innerHTML =
          '<div class="result-cards">' +
            '<div class="result-card"><div class="result-label">Revenue</div><div class="result-value">' + fmtM(result.revenue_m) + '</div></div>' +
            '<div class="result-card"><div class="result-label">EBITDA</div><div class="result-value ' + (result.ebitda_m >= 0 ? 'positive' : 'negative') + '">' + fmtM(result.ebitda_m) + '</div></div>' +
            '<div class="result-card"><div class="result-label">Margin</div><div class="result-value">' + result.margin_pct + '%</div></div>' +
            '<div class="result-card"><div class="result-label">Free Cash Flow</div><div class="result-value ' + (result.fcf_m >= 0 ? 'positive' : 'negative') + '">' + fmtM(result.fcf_m) + '</div></div>' +
            '<div class="result-card"><div class="result-label">Implied EV</div><div class="result-value">' + fmtM(result.implied_ev_m) + '</div></div>' +
            '<div class="result-card highlight-card"><div class="result-label">Implied Share Value</div><div class="result-value ' + shareClass + '">$' + result.per_share.toFixed(2) + '</div>' + upsideHtml + '</div>' +
          '</div>';
      }

      var heatDiv = document.getElementById('heatmap-' + containerId);
      if (heatDiv && metals.length > 0) {
        var primaryMetal = metals[0];
        var hm = buildHeatmap(stock, primaryMetal, METAL_DEFAULTS[primaryMetal].label, METAL_DEFAULTS[primaryMetal].unit, prices[primaryMetal], prices);
        if (hm) {
          var tbl = '<h4>' + hm.metal + ' Price Sensitivity</h4>';
          tbl += '<table class="heatmap-table"><thead><tr><th>Change</th><th>Price (' + hm.unit + ')</th><th>EBITDA</th><th>Implied Share</th><th>Margin</th></tr></thead><tbody>';
          hm.rows.forEach(function (r) {
            var cls = r.pct === 0 ? 'current-row' : (r.pct > 0 ? 'up-row' : 'down-row');
            tbl += '<tr class="' + cls + '"><td>' + (r.pct > 0 ? '+' : '') + r.pct + '%</td>';
            tbl += '<td>' + r.price.toLocaleString() + '</td>';
            tbl += '<td>' + fmtM(r.ebitda) + '</td>';
            tbl += '<td>$' + r.per_share.toFixed(2) + '</td>';
            tbl += '<td>' + r.margin + '%</td></tr>';
          });
          tbl += '</tbody></table>';
          heatDiv.innerHTML = tbl;
        }
      }
    }

    container.querySelectorAll('.metal-slider').forEach(function (s) {
      s.addEventListener('input', update);
    });
    update();
  }

  function renderAllWidgets() {
    document.querySelectorAll('[data-sensitivity-ticker]').forEach(function (el) {
      var ticker = el.getAttribute('data-sensitivity-ticker');
      var stock = null;
      for (var i = 0; i < STOCKS_DATA.length; i++) {
        if (STOCKS_DATA[i].ticker === ticker) { stock = STOCKS_DATA[i]; break; }
      }
      if (stock) renderSensitivityWidget(el.id, stock);
    });
  }

  window.SensitivityEngine = {
    calc: calcStockSensitivity,
    heatmap: buildHeatmap,
    render: renderSensitivityWidget,
    renderAll: renderAllWidgets,
    isPremium: isPremium
  };

  document.addEventListener('DOMContentLoaded', renderAllWidgets);
})();
