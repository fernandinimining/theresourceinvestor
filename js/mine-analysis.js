/*
 * mine-analysis.js — Premium mine-level analysis engine
 * Renders mine tables, cost curves, reserves charts, benchmarks, and comparator tool.
 */
(function () {
  'use strict';

  if (typeof MINES_DATA === 'undefined' || typeof STOCKS_DATA === 'undefined') return;

  var currentTicker = null;
  var sortCol = null;
  var sortDir = 'asc';

  function getStock(ticker) {
    for (var i = 0; i < STOCKS_DATA.length; i++) {
      if (STOCKS_DATA[i].ticker === ticker) return STOCKS_DATA[i];
    }
    return null;
  }

  function fmt(n, dec) {
    if (n === null || n === undefined) return '—';
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }

  function fmtCost(n) {
    if (n === null || n === undefined) return '—';
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function aiscTierClass(val, metal) {
    if (val === null || val === undefined) return '';
    if (metal === 'copper') {
      if (val < 1.50) return 'tier-green';
      if (val < 2.50) return 'tier-yellow';
      if (val < 3.50) return 'tier-orange';
      return 'tier-red';
    }
    if (val < 1000) return 'tier-green';
    if (val < 1500) return 'tier-yellow';
    if (val < 2000) return 'tier-orange';
    return 'tier-red';
  }

  function statusClass(status) {
    if (!status) return '';
    var s = status.toLowerCase();
    if (s.indexOf('operating') !== -1) return 'mine-status--operating';
    if (s.indexOf('ramp') !== -1) return 'mine-status--ramp';
    if (s.indexOf('development') !== -1 || s.indexOf('construction') !== -1) return 'mine-status--development';
    if (s.indexOf('care') !== -1 || s.indexOf('suspend') !== -1) return 'mine-status--maintenance';
    if (s.indexOf('divest') !== -1) return 'mine-status--maintenance';
    return '';
  }

  function primaryProd(mine) {
    var p = mine.production;
    if (!p) return { val: null, label: '—' };
    if (p.copper_mlbs) return { val: p.copper_mlbs, label: fmt(p.copper_mlbs) + ' Mlbs Cu' };
    if (p.gold_koz) return { val: p.gold_koz, label: fmt(p.gold_koz) + ' koz Au' };
    if (p.silver_koz) return { val: p.silver_koz, label: fmt(p.silver_koz) + ' koz Ag' };
    if (p.iron_ore_mt) return { val: p.iron_ore_mt, label: fmt(p.iron_ore_mt) + ' Mt Fe' };
    if (p.zinc_mlbs) return { val: p.zinc_mlbs, label: fmt(p.zinc_mlbs) + ' Mlbs Zn' };
    return { val: null, label: '—' };
  }

  function primaryCost(mine) {
    var c = mine.costs;
    if (!c) return { val: null, label: '—', unit: '' };
    if (c.aisc_per_oz !== undefined && c.aisc_per_oz !== null)
      return { val: c.aisc_per_oz, label: fmtCost(c.aisc_per_oz) + '/oz', unit: '/oz' };
    if (c.aisc_per_oz_ag !== undefined && c.aisc_per_oz_ag !== null)
      return { val: c.aisc_per_oz_ag, label: fmtCost(c.aisc_per_oz_ag) + '/oz Ag', unit: '/oz' };
    if (c.aisc_per_lb_cu !== undefined && c.aisc_per_lb_cu !== null)
      return { val: c.aisc_per_lb_cu, label: fmtCost(c.aisc_per_lb_cu) + '/lb', unit: '/lb' };
    if (c.aisc_per_lb_zn !== undefined && c.aisc_per_lb_zn !== null)
      return { val: c.aisc_per_lb_zn, label: fmtCost(c.aisc_per_lb_zn) + '/lb Zn', unit: '/lb' };
    if (c.cash_cost_per_oz !== undefined && c.cash_cost_per_oz !== null)
      return { val: c.cash_cost_per_oz, label: fmtCost(c.cash_cost_per_oz) + '/oz*', unit: '/oz' };
    if (c.cash_cost_per_lb !== undefined && c.cash_cost_per_lb !== null)
      return { val: c.cash_cost_per_lb, label: fmtCost(c.cash_cost_per_lb) + '/lb*', unit: '/lb' };
    if (c.net_cash_cost_per_lb !== undefined && c.net_cash_cost_per_lb !== null)
      return { val: c.net_cash_cost_per_lb, label: fmtCost(c.net_cash_cost_per_lb) + '/lb net†', unit: '/lb' };
    return { val: null, label: '—', unit: '' };
  }

  function primaryReserves(mine) {
    var r = mine.reserves;
    if (!r) return { val: null, label: '—' };
    if (r.copper_blbs) return { val: r.copper_blbs, label: fmt(r.copper_blbs, 1) + ' Blbs Cu' };
    if (r.gold_moz) return { val: r.gold_moz, label: fmt(r.gold_moz, 1) + ' Moz Au' };
    if (r.silver_moz) return { val: r.silver_moz, label: fmt(r.silver_moz, 1) + ' Moz Ag' };
    if (r.copper_mt) return { val: r.copper_mt, label: fmt(r.copper_mt, 1) + ' Mt Cu' };
    return { val: null, label: '—' };
  }

  // ── COMPANY SELECTOR ──
  var selector = document.getElementById('company-selector');
  if (selector) {
    selector.addEventListener('change', function () {
      loadCompany(this.value);
    });
    if (selector.value) loadCompany(selector.value);
  }

  function loadCompany(ticker) {
    currentTicker = ticker;
    var stock = getStock(ticker);
    var mines = MINES_DATA[ticker] || [];

    var el = function (id) { return document.getElementById(id); };
    if (el('ov-name')) el('ov-name').textContent = stock ? stock.name : ticker;
    if (el('ov-ticker')) el('ov-ticker').textContent = ticker + ' · ' + (stock ? stock.exchange : '');
    if (el('ov-mcap')) el('ov-mcap').textContent = stock ? '$' + stock.market_cap_b + 'B' : '—';
    if (el('ov-cat')) el('ov-cat').textContent = stock ? stock.category.charAt(0).toUpperCase() + stock.category.slice(1) : '';
    if (el('mine-count')) el('mine-count').textContent = mines.length + ' operations';

    renderMineTable(mines, stock);
    renderCostCurve(mines, stock);
    renderReservesChart(mines);
    renderMineMap(mines);
  }

  // ── MINE TABLE ──
  function renderMineTable(mines, stock) {
    var tbody = document.getElementById('mines-table-body');
    if (!tbody) return;

    var sorted = mines.slice();
    if (sortCol) {
      sorted.sort(function (a, b) {
        var va = getSortVal(a, sortCol);
        var vb = getSortVal(b, sortCol);
        if (va === null) return 1;
        if (vb === null) return -1;
        return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
    }

    var html = '';
    sorted.forEach(function (m) {
      var prod = primaryProd(m);
      var cost = primaryCost(m);
      var res = primaryReserves(m);
      var costTier = aiscTierClass(cost.val, m.primary_metal);
      var stClass = statusClass(m.status);

      html += '<tr>';
      html += '<td style="font-weight:600;">' + esc(m.name) + '</td>';
      html += '<td>' + esc(m.country || '') + '</td>';
      html += '<td style="font-family:JetBrains Mono,monospace;">' + (m.ownership_pct !== null ? m.ownership_pct + '%' : '—') + '</td>';
      html += '<td>' + esc(m.type || '') + '</td>';
      html += '<td style="font-family:JetBrains Mono,monospace;">' + prod.label + '</td>';
      html += '<td class="mine-aisc ' + costTier + '" style="font-family:JetBrains Mono,monospace;">' + cost.label + '</td>';
      html += '<td style="font-family:JetBrains Mono,monospace;">' + res.label + '</td>';
      html += '<td style="font-family:JetBrains Mono,monospace;">' + (m.mine_life_yrs ? m.mine_life_yrs + ' yrs' : '—') + '</td>';
      html += '<td><span class="mine-status ' + stClass + '">' + esc(m.status || '') + '</span></td>';
      html += '</tr>';
    });

    tbody.innerHTML = html;
  }

  function getSortVal(mine, col) {
    switch (col) {
      case 'name': return mine.name || '';
      case 'country': return mine.country || '';
      case 'ownership': return mine.ownership_pct;
      case 'type': return mine.type || '';
      case 'production': return primaryProd(mine).val;
      case 'aisc': return primaryCost(mine).val;
      case 'reserves': return primaryReserves(mine).val;
      case 'life': return mine.mine_life_yrs;
      case 'status': return mine.status || '';
      default: return null;
    }
  }

  document.querySelectorAll('.mine-data-table thead th[data-sort]').forEach(function (th) {
    th.addEventListener('click', function () {
      var col = this.getAttribute('data-sort');
      if (sortCol === col) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortCol = col;
        sortDir = 'asc';
      }
      document.querySelectorAll('.mine-data-table thead th').forEach(function (h) {
        h.classList.remove('sort-asc', 'sort-desc');
      });
      this.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
      if (currentTicker) loadCompany(currentTicker);
    });
  });

  // ── COST CURVE CHART ──
  function renderCostCurve(mines, stock) {
    var container = document.getElementById('cost-curve-chart');
    if (!container) return;

    var items = [];
    mines.forEach(function (m) {
      var cost = primaryCost(m);
      if (cost.val !== null && cost.val > 0 && m.status && m.status.toLowerCase().indexOf('operating') !== -1) {
        items.push({ name: m.name, val: cost.val, metal: m.primary_metal });
      }
    });

    items.sort(function (a, b) { return a.val - b.val; });

    if (items.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">No per-mine cost data available for this company.</p>';
      return;
    }

    var maxVal = items[items.length - 1].val * 1.15;
    var html = '<div style="display:flex;flex-direction:column;gap:6px;padding:1rem;">';
    items.forEach(function (item) {
      var pct = (item.val / maxVal) * 100;
      var tier = aiscTierClass(item.val, item.metal);
      var color = tier === 'tier-green' ? '#059669' : tier === 'tier-yellow' ? '#d97706' : tier === 'tier-orange' ? '#ea580c' : tier === 'tier-red' ? '#dc2626' : '#64748b';
      html += '<div style="display:flex;align-items:center;gap:8px;">';
      html += '<span style="width:140px;font-size:11px;text-align:right;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(item.name) + '</span>';
      html += '<div style="flex:1;background:var(--bg-secondary);border-radius:4px;overflow:hidden;height:22px;">';
      html += '<div style="width:' + pct + '%;background:' + color + ';height:100%;border-radius:4px;transition:width .5s ease;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;">';
      html += '<span style="font-size:10px;color:#fff;font-weight:600;font-family:JetBrains Mono,monospace;">' + fmtCost(item.val) + '</span>';
      html += '</div></div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  // ── RESERVES BREAKDOWN ──
  function renderReservesChart(mines) {
    var container = document.getElementById('reserves-breakdown');
    if (!container) return;

    var items = [];
    mines.forEach(function (m) {
      var res = primaryReserves(m);
      if (res.val !== null && res.val > 0) {
        items.push({ name: m.name, val: res.val, label: res.label });
      }
    });

    items.sort(function (a, b) { return b.val - a.val; });

    if (items.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">No per-mine reserve data available for this company.</p>';
      return;
    }

    var total = items.reduce(function (sum, i) { return sum + i.val; }, 0);
    var colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#4f46e5', '#65a30d', '#c026d3', '#ea580c'];

    var html = '<div style="padding:1rem;">';
    html += '<div style="display:flex;height:28px;border-radius:6px;overflow:hidden;margin-bottom:1rem;">';
    items.forEach(function (item, i) {
      var pct = (item.val / total * 100);
      html += '<div style="width:' + pct + '%;background:' + colors[i % colors.length] + ';transition:width .5s;" title="' + esc(item.name) + ': ' + esc(item.label) + '"></div>';
    });
    html += '</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px 16px;">';
    items.forEach(function (item, i) {
      var pct = (item.val / total * 100).toFixed(1);
      html += '<div style="display:flex;align-items:center;gap:4px;font-size:11px;">';
      html += '<span style="width:10px;height:10px;border-radius:2px;background:' + colors[i % colors.length] + ';flex-shrink:0;"></span>';
      html += '<span>' + esc(item.name) + ' <strong>' + pct + '%</strong></span>';
      html += '</div>';
    });
    html += '</div></div>';
    container.innerHTML = html;
  }

  // ── MINE MAP ──
  function renderMineMap(mines) {
    var container = document.getElementById('mine-map-placeholder');
    if (!container) return;

    var countryFlags = {
      'Indonesia': '🇮🇩', 'Peru': '🇵🇪', 'Chile': '🇨🇱', 'United States': '🇺🇸', 'USA': '🇺🇸',
      'Canada': '🇨🇦', 'Australia': '🇦🇺', 'South Africa': '🇿🇦', 'Ghana': '🇬🇭',
      'Tanzania': '🇹🇿', 'Mali': '🇲🇱', 'DRC': '🇨🇩', 'Democratic Republic of the Congo': '🇨🇩',
      'Dominican Republic': '🇩🇴', 'Argentina': '🇦🇷', 'Papua New Guinea': '🇵🇬',
      'Mexico': '🇲🇽', 'Brazil': '🇧🇷', 'Mauritania': '🇲🇷', 'Philippines': '🇵🇭',
      'Namibia': '🇳🇦', 'Colombia': '🇨🇴', 'Finland': '🇫🇮', 'Bolivia': '🇧🇴',
      'Zambia': '🇿🇲', 'Pakistan': '🇵🇰', 'Suriname': '🇸🇷', 'Mongolia': '🇲🇳',
      'Ivory Coast': '🇨🇮', "Côte d'Ivoire": '🇨🇮', 'Guinea': '🇬🇳', 'Spain': '🇪🇸'
    };

    var countries = {};
    mines.forEach(function (m) {
      var c = m.country || 'Unknown';
      if (!countries[c]) countries[c] = [];
      countries[c].push(m.name);
    });

    var html = '<div style="display:flex;flex-wrap:wrap;gap:12px;padding:1rem;">';
    Object.keys(countries).forEach(function (c) {
      var flag = countryFlags[c] || '🏳️';
      html += '<div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;padding:10px 14px;min-width:140px;">';
      html += '<div style="font-size:20px;margin-bottom:4px;">' + flag + '</div>';
      html += '<div style="font-size:12px;font-weight:700;margin-bottom:2px;">' + esc(c) + '</div>';
      html += '<div style="font-size:11px;color:var(--text-secondary);">' + countries[c].length + ' operation' + (countries[c].length > 1 ? 's' : '') + '</div>';
      countries[c].forEach(function (name) {
        html += '<div style="font-size:10px;color:var(--text-secondary);margin-top:2px;">• ' + esc(name) + '</div>';
      });
      html += '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  // ── CROSS-COMPANY BENCHMARKS ──
  function buildAllMines() {
    var all = [];
    Object.keys(MINES_DATA).forEach(function (ticker) {
      MINES_DATA[ticker].forEach(function (m) {
        all.push({ ticker: ticker, mine: m });
      });
    });
    return all;
  }

  function renderBenchmarks() {
    var all = buildAllMines();

    var lowestCost = document.getElementById('lowest-cost-ranking');
    if (lowestCost) {
      var costItems = [];
      all.forEach(function (item) {
        var c = primaryCost(item.mine);
        if (c.val !== null && c.val > 0 && item.mine.status && item.mine.status.toLowerCase().indexOf('operating') !== -1) {
          costItems.push({ ticker: item.ticker, name: item.mine.name, val: c.val, label: c.label, metal: item.mine.primary_metal });
        }
      });
      costItems.sort(function (a, b) { return a.val - b.val; });
      lowestCost.innerHTML = renderRankingTable(costItems.slice(0, 15), 'Cost', 'label');
    }

    var largestRes = document.getElementById('largest-reserves-ranking');
    if (largestRes) {
      var resItems = [];
      all.forEach(function (item) {
        var r = primaryReserves(item.mine);
        if (r.val !== null && r.val > 0) {
          resItems.push({ ticker: item.ticker, name: item.mine.name, val: r.val, label: r.label, metal: item.mine.primary_metal });
        }
      });
      resItems.sort(function (a, b) { return b.val - a.val; });
      largestRes.innerHTML = renderRankingTable(resItems.slice(0, 15), 'Reserves', 'label');
    }

    var bestVal = document.getElementById('best-value-ranking');
    if (bestVal) {
      var valItems = [];
      all.forEach(function (item) {
        var c = primaryCost(item.mine);
        var life = item.mine.mine_life_yrs;
        if (c.val !== null && c.val > 0 && life && life > 0 && item.mine.status && item.mine.status.toLowerCase().indexOf('operating') !== -1) {
          var score = (life / c.val) * 100;
          valItems.push({ ticker: item.ticker, name: item.mine.name, val: score, label: fmt(score, 1), cost: c.label, life: life + ' yrs', metal: item.mine.primary_metal });
        }
      });
      valItems.sort(function (a, b) { return b.val - a.val; });

      var html = '<table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:#1e293b;color:#e2e8f0;">';
      html += '<th style="padding:8px;text-align:left;">Rank</th><th style="padding:8px;text-align:left;">Mine</th><th style="padding:8px;">Ticker</th><th style="padding:8px;">Cost</th><th style="padding:8px;">Life</th><th style="padding:8px;">Score</th>';
      html += '</tr></thead><tbody>';
      valItems.slice(0, 15).forEach(function (item, i) {
        html += '<tr style="background:' + (i % 2 ? 'var(--bg-secondary)' : 'var(--bg-primary)') + ';">';
        html += '<td style="padding:6px 8px;font-weight:700;color:var(--primary);">#' + (i + 1) + '</td>';
        html += '<td style="padding:6px 8px;font-weight:600;">' + esc(item.name) + '</td>';
        html += '<td style="padding:6px 8px;text-align:center;font-family:JetBrains Mono,monospace;">' + item.ticker + '</td>';
        html += '<td style="padding:6px 8px;text-align:center;font-family:JetBrains Mono,monospace;">' + item.cost + '</td>';
        html += '<td style="padding:6px 8px;text-align:center;">' + item.life + '</td>';
        html += '<td style="padding:6px 8px;text-align:center;font-weight:700;color:var(--primary);">' + item.label + '</td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
      bestVal.innerHTML = html;
    }
  }

  function renderRankingTable(items, valueHeader, valueKey) {
    var html = '<table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:#1e293b;color:#e2e8f0;">';
    html += '<th style="padding:8px;text-align:left;">Rank</th><th style="padding:8px;text-align:left;">Mine</th><th style="padding:8px;">Ticker</th><th style="padding:8px;">' + valueHeader + '</th>';
    html += '</tr></thead><tbody>';
    items.forEach(function (item, i) {
      var tier = aiscTierClass(item.val, item.metal);
      html += '<tr style="background:' + (i % 2 ? 'var(--bg-secondary)' : 'var(--bg-primary)') + ';">';
      html += '<td style="padding:6px 8px;font-weight:700;color:var(--primary);">#' + (i + 1) + '</td>';
      html += '<td style="padding:6px 8px;font-weight:600;">' + esc(item.name) + '</td>';
      html += '<td style="padding:6px 8px;text-align:center;font-family:JetBrains Mono,monospace;">' + item.ticker + '</td>';
      html += '<td style="padding:6px 8px;text-align:center;font-family:JetBrains Mono,monospace;' + (valueHeader === 'Cost' ? '' : '') + '">' + item[valueKey] + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  // ── BENCHMARK COMPARATOR ──
  var compareBtn = document.getElementById('mine-compare-btn');
  if (compareBtn) {
    compareBtn.addEventListener('click', function () {
      var name = document.getElementById('bm-name').value || 'Your Mine';
      var metal = document.getElementById('bm-metal').value || 'gold';
      var prod = parseFloat(document.getElementById('bm-prod').value) || 0;
      var aisc = parseFloat(document.getElementById('bm-aisc').value) || 0;
      var reserves = parseFloat(document.getElementById('bm-reserves').value) || 0;
      var life = parseFloat(document.getElementById('bm-life').value) || 0;

      var results = document.getElementById('mine-benchmark-results');
      if (!results) return;

      var all = buildAllMines();
      var comparable = [];
      all.forEach(function (item) {
        var c = primaryCost(item.mine);
        if (c.val !== null && c.val > 0) {
          comparable.push({ ticker: item.ticker, name: item.mine.name, cost: c.val });
        }
      });
      comparable.push({ ticker: '→', name: name, cost: aisc, isUser: true });
      comparable.sort(function (a, b) { return a.cost - b.cost; });

      var rank = 0;
      for (var i = 0; i < comparable.length; i++) {
        if (comparable[i].isUser) { rank = i + 1; break; }
      }

      var html = '<div style="padding:1rem;">';
      html += '<h4 style="margin-bottom:12px;">Your mine ranks <strong style="color:var(--primary);">#' + rank + '</strong> out of ' + comparable.length + ' mines by cost</h4>';
      html += '<div style="max-height:300px;overflow-y:auto;">';
      html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background:#1e293b;color:#e2e8f0;position:sticky;top:0;">';
      html += '<th style="padding:6px 8px;">#</th><th style="padding:6px 8px;text-align:left;">Mine</th><th style="padding:6px 8px;">Ticker</th><th style="padding:6px 8px;">AISC</th>';
      html += '</tr></thead><tbody>';

      var showStart = Math.max(0, rank - 6);
      var showEnd = Math.min(comparable.length, rank + 5);
      for (var j = showStart; j < showEnd; j++) {
        var item = comparable[j];
        var bg = item.isUser ? 'background:rgba(37,99,235,.12);font-weight:700;' : (j % 2 ? 'background:var(--bg-secondary);' : '');
        html += '<tr style="' + bg + '">';
        html += '<td style="padding:4px 8px;">' + (j + 1) + '</td>';
        html += '<td style="padding:4px 8px;">' + (item.isUser ? '★ ' : '') + esc(item.name) + '</td>';
        html += '<td style="padding:4px 8px;text-align:center;font-family:JetBrains Mono,monospace;">' + item.ticker + '</td>';
        html += '<td style="padding:4px 8px;text-align:center;font-family:JetBrains Mono,monospace;">' + fmtCost(item.cost) + '</td>';
        html += '</tr>';
      }
      html += '</tbody></table></div></div>';
      results.innerHTML = html;
    });
  }

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', function () {
    renderBenchmarks();
    if (selector && selector.value) loadCompany(selector.value);
  });

  if (document.readyState !== 'loading') {
    renderBenchmarks();
    if (selector && selector.value) loadCompany(selector.value);
  }
})();
