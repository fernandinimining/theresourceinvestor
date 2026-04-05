/*
 * sensitivity.js — Interactive mining stock sensitivity analysis engine
 * Premium feature: metal price sliders with real-time financial impact
 * Uses only public data from stocks-data.js
 */
(function () {
  'use strict';

  function isPremium() {
    try {
      var p = JSON.parse(localStorage.getItem('ri_premium') || '{}');
      return p.active && p.expires && new Date(p.expires) > new Date();
    } catch (e) { return false; }
  }

  function calcStockSensitivity(stock, prices) {
    if (!stock || !stock.metals || !stock.financials) return null;
    var revenue = 0;
    var productionCost = 0;

    Object.keys(stock.metals).forEach(function (metal) {
      var m = stock.metals[metal];
      var price = prices[metal] || 0;

      if (m.production_mlbs) {
        revenue += m.production_mlbs * price;
        productionCost += m.production_mlbs * (m.aisc_per_lb || 0);
      } else if (m.production_koz) {
        revenue += m.production_koz * price;
        productionCost += m.production_koz * (m.aisc_per_oz || 0);
      } else if (m.production_mt) {
        revenue += m.production_mt * price * 1e6;
        productionCost += m.production_mt * (m.aisc_per_t || 0) * 1e6;
      } else if (m.production_kt) {
        revenue += m.production_kt * price * 1000;
        productionCost += m.production_kt * (m.aisc_per_t || 0) * 1000;
      } else if (m.production_kt_lce) {
        revenue += m.production_kt_lce * price * 1000;
        productionCost += m.production_kt_lce * (m.aisc_per_t || 0) * 1000;
      }
    });

    var revenueM = revenue / 1e6;
    var costM = productionCost / 1e6;
    var f = stock.financials;
    var ebitda = revenueM - costM;
    var taxRate = f.tax_rate || 0.30;
    var fcf = ebitda - (f.capex_m || 0);
    var afterTax = fcf * (1 - taxRate);
    var ev = ebitda * 6;
    var equity = ev - (f.net_debt_m || 0);
    var perShare = f.shares_m ? equity / f.shares_m : 0;

    return {
      revenue_m: Math.round(revenueM),
      ebitda_m: Math.round(ebitda),
      fcf_m: Math.round(fcf),
      after_tax_fcf_m: Math.round(afterTax),
      implied_ev_m: Math.round(ev),
      implied_equity_m: Math.round(equity),
      per_share: Math.round(perShare * 100) / 100,
      margin_pct: revenueM > 0 ? Math.round((ebitda / revenueM) * 100) : 0
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
      currentPrices[m] = METAL_DEFAULTS[m] ? METAL_DEFAULTS[m].current : 0;
    });

    var html = '<div class="sensitivity-tool">';
    html += '<h3 class="sensitivity-title"><span class="premium-badge">PREMIUM</span> ' + stock.ticker + ' Sensitivity Analysis</h3>';
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
    html += '<p class="sensitivity-disclaimer">Illustrative estimates based on public filings. Not financial advice. Simplified model.</p>';
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

      var resultsDiv = document.getElementById('results-' + containerId);
      if (resultsDiv) {
        resultsDiv.innerHTML =
          '<div class="result-cards">' +
            '<div class="result-card"><div class="result-label">Revenue</div><div class="result-value">$' + result.revenue_m.toLocaleString() + 'M</div></div>' +
            '<div class="result-card"><div class="result-label">EBITDA</div><div class="result-value ' + (result.ebitda_m >= 0 ? 'positive' : 'negative') + '">$' + result.ebitda_m.toLocaleString() + 'M</div></div>' +
            '<div class="result-card"><div class="result-label">Margin</div><div class="result-value">' + result.margin_pct + '%</div></div>' +
            '<div class="result-card"><div class="result-label">Free Cash Flow</div><div class="result-value ' + (result.fcf_m >= 0 ? 'positive' : 'negative') + '">$' + result.fcf_m.toLocaleString() + 'M</div></div>' +
            '<div class="result-card"><div class="result-label">Implied EV</div><div class="result-value">$' + result.implied_ev_m.toLocaleString() + 'M</div></div>' +
            '<div class="result-card highlight-card"><div class="result-label">Per Share Value</div><div class="result-value">$' + result.per_share.toFixed(2) + '</div></div>' +
          '</div>';
      }

      var heatDiv = document.getElementById('heatmap-' + containerId);
      if (heatDiv && metals.length > 0) {
        var primaryMetal = metals[0];
        var hm = buildHeatmap(stock, primaryMetal, METAL_DEFAULTS[primaryMetal].label, METAL_DEFAULTS[primaryMetal].unit, prices[primaryMetal], prices);
        if (hm) {
          var tbl = '<h4>' + hm.metal + ' Price Sensitivity</h4>';
          tbl += '<table class="heatmap-table"><thead><tr><th>Change</th><th>Price (' + hm.unit + ')</th><th>EBITDA ($M)</th><th>Per Share</th><th>Margin</th></tr></thead><tbody>';
          hm.rows.forEach(function (r) {
            var cls = r.pct === 0 ? 'current-row' : (r.pct > 0 ? 'up-row' : 'down-row');
            tbl += '<tr class="' + cls + '"><td>' + (r.pct > 0 ? '+' : '') + r.pct + '%</td>';
            tbl += '<td>' + r.price.toLocaleString() + '</td>';
            tbl += '<td>$' + r.ebitda.toLocaleString() + 'M</td>';
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
