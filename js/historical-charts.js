/*
 * historical-charts.js — McKinsey-style bar charts for premium page.
 * Renders 3 charts per ticker: Production, Opex, EBITDA.
 * Depends on: historical-data.js (HISTORICAL_DATA), stocks-data.js (STOCKS_DATA).
 */
(function () {
  'use strict';

  if (typeof HISTORICAL_DATA === 'undefined') return;

  var COLORS = {
    production: { bar: '#2563eb', proj: '#93c5fd', accent: '#1e40af' },
    opex:       { bar: '#dc2626', proj: '#fca5a5', accent: '#991b1b' },
    ebitda:     { bar: '#059669', proj: '#6ee7b7', accent: '#065f46' }
  };

  function fmtVal(n) {
    if (n === null || n === undefined) return '';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toLocaleString('en-US');
  }

  function fmtDollar(n) {
    if (n === null || n === undefined) return '';
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1).replace(/\.0$/, '') + 'B';
    return '$' + n + 'M';
  }

  function calcCAGR(first, last, years) {
    if (!first || first <= 0 || !last || last <= 0 || years <= 0) return null;
    return (Math.pow(last / first, 1 / years) - 1) * 100;
  }

  function buildBarChart(containerId, title, subtitle, years, values, formatter, palette, unit) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var maxVal = Math.max.apply(null, values.filter(function (v) { return v !== null; }));
    var minVal = Math.min.apply(null, values.filter(function (v) { return v !== null; }));
    var absMax = Math.max(Math.abs(maxVal), Math.abs(minVal || 0));
    if (absMax === 0) absMax = 1;
    var chartMax = absMax * 1.18;

    var cagr = calcCAGR(values[0], values[values.length - 1], years.length - 1);

    var html = '<div style="padding:0;">';

    // Header
    html += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">';
    html += '<div>';
    html += '<div style="font-size:13px;font-weight:700;color:var(--text-primary,#1e293b);letter-spacing:-0.02em;">' + title + '</div>';
    html += '<div style="font-size:11px;color:var(--text-secondary,#64748b);">' + subtitle + '</div>';
    html += '</div>';
    if (cagr !== null) {
      var cagrColor = cagr >= 0 ? '#059669' : '#dc2626';
      html += '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:600;color:' + cagrColor + ';">';
      html += 'CAGR ' + (cagr >= 0 ? '+' : '') + cagr.toFixed(1) + '%';
      html += '</div>';
    }
    html += '</div>';

    // Bars
    html += '<div style="display:flex;align-items:flex-end;gap:3px;height:140px;padding-top:20px;">';
    values.forEach(function (val, i) {
      var isProjected = String(years[i]).indexOf('E') !== -1;
      var barColor = isProjected ? palette.proj : palette.bar;
      var borderColor = isProjected ? palette.bar : 'transparent';
      var pct = val !== null && val >= 0 ? (val / chartMax) * 100 : 0;
      var negPct = val !== null && val < 0 ? (Math.abs(val) / chartMax) * 100 : 0;
      var label = val !== null ? formatter(val) : '';

      html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;height:100%;justify-content:flex-end;">';
      // Value label on top
      html += '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;font-weight:600;color:' + (isProjected ? palette.bar : palette.accent) + ';white-space:nowrap;min-height:14px;">' + label + '</div>';
      // Bar
      if (val >= 0) {
        html += '<div style="width:100%;max-width:48px;height:' + pct + '%;background:' + barColor + ';border-radius:3px 3px 0 0;border:' + (isProjected ? '1.5px dashed ' + borderColor : 'none') + ';transition:height 0.6s cubic-bezier(.4,0,.2,1);min-height:2px;"></div>';
      } else {
        html += '<div style="width:100%;max-width:48px;height:' + negPct + '%;background:' + palette.proj + ';border-radius:0 0 3px 3px;opacity:0.6;min-height:2px;"></div>';
      }
      html += '</div>';
    });
    html += '</div>';

    // Year labels
    html += '<div style="display:flex;gap:3px;margin-top:4px;">';
    years.forEach(function (yr) {
      var isProjected = String(yr).indexOf('E') !== -1;
      html += '<div style="flex:1;text-align:center;font-family:\'JetBrains Mono\',monospace;font-size:9px;font-weight:' + (isProjected ? '700' : '500') + ';color:' + (isProjected ? palette.bar : 'var(--text-secondary,#64748b)') + ';">' + yr + '</div>';
    });
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
  }

  function renderTickerCharts(ticker) {
    var data = HISTORICAL_DATA[ticker];
    if (!data) return;

    var prodTitle = 'Production';
    var prodSub = data.prod_unit;
    var prodFormatter = fmtVal;

    buildBarChart(
      'hist-prod-' + ticker, prodTitle, prodSub,
      data.years, data.production, prodFormatter, COLORS.production, data.prod_unit
    );

    buildBarChart(
      'hist-opex-' + ticker, 'Operating costs', '$M',
      data.years, data.opex_m, fmtDollar, COLORS.opex, '$M'
    );

    buildBarChart(
      'hist-ebitda-' + ticker, 'EBITDA', '$M',
      data.years, data.ebitda_m, fmtDollar, COLORS.ebitda, '$M'
    );
  }

  function init() {
    Object.keys(HISTORICAL_DATA).forEach(function (ticker) {
      renderTickerCharts(ticker);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
