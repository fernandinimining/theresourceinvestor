/*
 * mine-analysis.js — Premium mine-level analysis engine (v2 — normalized).
 * Depends on: stocks-data.js, mines-data.js, mines-data-patch.js,
 *             mine-normalize.js (MineUnits), mine-coordinates.js (MINE_COORDS).
 * Renders mine tables, Leaflet map, cost curves, reserves charts (Cu/Au split),
 * normalized benchmarks (Cu vs Au), and comparator tool.
 */
(function () {
  'use strict';

  var currentTicker = null;
  var sortCol = null;
  var sortDir = 'asc';
  var leafletMap = null;
  var markerGroup = null;

  function dataReady() {
    return typeof MINES_DATA !== 'undefined' && typeof STOCKS_DATA !== 'undefined' && typeof MineUnits !== 'undefined';
  }

  function getStock(ticker) {
    if (typeof STOCKS_DATA === 'undefined') return null;
    for (var i = 0; i < STOCKS_DATA.length; i++) {
      if (STOCKS_DATA[i].ticker === ticker) return STOCKS_DATA[i];
    }
    return null;
  }

  function fmt(n, dec) {
    if (n === null || n === undefined) return '\u2014';
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }

  function fmtCost(n) {
    if (n === null || n === undefined) return '\u2014';
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ── Metal classification helpers ──

  function isCopper(mine) { return mine.primary_metal === 'copper'; }
  function isGold(mine) { return mine.primary_metal === 'gold'; }
  function isSilver(mine) { return mine.primary_metal === 'silver'; }

  function metalColor(metal) {
    switch (metal) {
      case 'copper': return '#d97706';
      case 'gold': return '#eab308';
      case 'silver': return '#94a3b8';
      case 'zinc': return '#64748b';
      case 'lithium': return '#06b6d4';
      case 'iron_ore': return '#dc2626';
      case 'nickel': return '#16a34a';
      default: return '#6366f1';
    }
  }

  function metalLabel(metal) {
    var labels = { copper: 'Cu', gold: 'Au', silver: 'Ag', zinc: 'Zn', lithium: 'Li', iron_ore: 'Fe', nickel: 'Ni' };
    return labels[metal] || metal;
  }

  // ── AISC tier ──

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

  function tierColor(tier) {
    if (tier === 'tier-green') return '#059669';
    if (tier === 'tier-yellow') return '#d97706';
    if (tier === 'tier-orange') return '#ea580c';
    if (tier === 'tier-red') return '#dc2626';
    return '#64748b';
  }

  function statusClass(status) {
    if (!status) return '';
    var s = status.toLowerCase();
    if (s.indexOf('operating') !== -1) return 'mine-status--operating';
    if (s.indexOf('ramp') !== -1) return 'mine-status--ramp';
    if (s.indexOf('development') !== -1 || s.indexOf('construction') !== -1) return 'mine-status--development';
    if (s.indexOf('care') !== -1 || s.indexOf('suspend') !== -1) return 'mine-status--maintenance';
    return '';
  }

  // ── Production display ──

  function primaryProd(mine) {
    var p = mine.production;
    if (!p) return { val: null, label: '\u2014' };
    if (p.copper_mlbs) return { val: p.copper_mlbs, label: fmt(p.copper_mlbs) + ' Mlbs Cu' };
    if (p.gold_koz) return { val: p.gold_koz, label: fmt(p.gold_koz) + ' koz Au' };
    if (p.silver_koz) return { val: p.silver_koz, label: fmt(p.silver_koz) + ' koz Ag' };
    if (p.iron_ore_mt) return { val: p.iron_ore_mt, label: fmt(p.iron_ore_mt) + ' Mt Fe' };
    if (p.zinc_mlbs) return { val: p.zinc_mlbs, label: fmt(p.zinc_mlbs) + ' Mlbs Zn' };
    return { val: null, label: '\u2014' };
  }

  // ── Normalized cost/reserves display (uses MineUnits) ──

  function primaryCost(mine) {
    if (isCopper(mine)) {
      var cv = MineUnits.copperCostPerLb(mine);
      if (cv !== null) return MineUnits.displayCuCost(cv);
    }
    if (isGold(mine)) {
      var gv = MineUnits.goldCostPerOz(mine);
      if (gv !== null) return MineUnits.displayAuCost(gv);
    }
    if (isSilver(mine)) {
      var sv = MineUnits.silverCostPerOz(mine);
      if (sv !== null) return { val: sv, label: '$' + MineUnits.fmtNum(sv, 2) + '/oz Ag' };
    }
    var c = mine.costs;
    if (!c) return { val: null, label: '\u2014' };
    if (c.aisc_per_oz !== undefined && c.aisc_per_oz !== null) return { val: c.aisc_per_oz, label: fmtCost(c.aisc_per_oz) + '/oz' };
    if (c.aisc_per_oz_ag !== undefined && c.aisc_per_oz_ag !== null) return { val: c.aisc_per_oz_ag, label: fmtCost(c.aisc_per_oz_ag) + '/oz Ag' };
    if (c.aisc_per_lb_cu !== undefined && c.aisc_per_lb_cu !== null) return MineUnits.displayCuCost(c.aisc_per_lb_cu);
    if (c.aisc_per_lb_zn !== undefined && c.aisc_per_lb_zn !== null) return { val: c.aisc_per_lb_zn, label: fmtCost(c.aisc_per_lb_zn) + '/lb Zn' };
    if (c.cash_cost_per_oz !== undefined && c.cash_cost_per_oz !== null) return { val: c.cash_cost_per_oz, label: fmtCost(c.cash_cost_per_oz) + '/oz*' };
    if (c.cash_cost_per_lb !== undefined && c.cash_cost_per_lb !== null) return MineUnits.displayCuCost(c.cash_cost_per_lb);
    return { val: null, label: '\u2014' };
  }

  function primaryReserves(mine) {
    if (isCopper(mine)) {
      var ck = MineUnits.copperReservesKt(mine);
      if (ck !== null) return MineUnits.displayCuReserves(ck);
    }
    if (isGold(mine)) {
      var gm = MineUnits.goldReservesMoz(mine);
      if (gm !== null) return MineUnits.displayAuReserves(gm);
    }
    if (isSilver(mine)) {
      var sm = MineUnits.silverReservesMoz(mine);
      if (sm !== null) return MineUnits.displayAgReserves(sm);
    }
    var r = mine.reserves;
    if (!r) return { val: null, label: '\u2014' };
    var ck2 = MineUnits.copperReservesKt(mine);
    if (ck2 !== null) return MineUnits.displayCuReserves(ck2);
    var gm2 = MineUnits.goldReservesMoz(mine);
    if (gm2 !== null) return MineUnits.displayAuReserves(gm2);
    var sm2 = MineUnits.silverReservesMoz(mine);
    if (sm2 !== null) return MineUnits.displayAgReserves(sm2);
    return { val: null, label: '\u2014' };
  }

  // ── LOAD COMPANY ──

  function loadCompany(ticker) {
    if (!dataReady()) return;
    currentTicker = ticker;
    var stock = getStock(ticker);
    var mines = MINES_DATA[ticker] || [];

    var el = function (id) { return document.getElementById(id); };
    if (el('ov-name')) el('ov-name').textContent = stock ? stock.name : ticker;
    if (el('ov-ticker')) el('ov-ticker').textContent = ticker + ' \u00b7 ' + (stock ? stock.exchange : '');
    if (el('ov-mcap')) el('ov-mcap').textContent = stock ? '$' + stock.market_cap_b + 'B' : '\u2014';
    if (el('ov-cat')) el('ov-cat').textContent = stock && stock.category ? stock.category.charAt(0).toUpperCase() + stock.category.slice(1) : '';
    var countEl = el('mine-count') || el('mine-table-caption');
    if (countEl) countEl.textContent = mines.length + ' operations';

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
      var costTier = isCopper(m) ? aiscTierClass(MineUnits.copperCostPerLb(m), 'copper') : aiscTierClass(cost.val, m.primary_metal);
      var stClass = statusClass(m.status);

      html += '<tr>';
      html += '<td style="font-weight:600;">' + esc(m.name) + '</td>';
      html += '<td>' + esc(m.country || '') + '</td>';
      html += '<td style="font-family:JetBrains Mono,monospace;">' + (m.ownership_pct !== null && m.ownership_pct !== undefined ? m.ownership_pct + '%' : '\u2014') + '</td>';
      html += '<td>' + esc(m.type || '') + '</td>';
      html += '<td style="font-family:JetBrains Mono,monospace;">' + prod.label + '</td>';
      html += '<td class="mine-aisc ' + costTier + '" style="font-family:JetBrains Mono,monospace;">' + cost.label + '</td>';
      html += '<td style="font-family:JetBrains Mono,monospace;">' + res.label + '</td>';
      html += '<td style="font-family:JetBrains Mono,monospace;">' + (m.mine_life_yrs ? m.mine_life_yrs + ' yrs' : '\u2014') + '</td>';
      html += '<td><span class="mine-status ' + stClass + '">' + esc(m.status || '') + '</span></td>';
      html += '</tr>';
    });

    tbody.innerHTML = html;
  }

  function getSortVal(mine, col) {
    switch (col) {
      case 'name': return mine.name || '';
      case 'country': case 'location': return mine.country || '';
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

  // ── COST CURVE (per-company) ──

  function renderCostCurve(mines, stock) {
    var container = document.getElementById('cost-curve-chart');
    if (!container) return;

    var items = [];
    mines.forEach(function (m) {
      var cost = primaryCost(m);
      if (cost.val !== null && cost.val > 0 && m.status && m.status.toLowerCase().indexOf('operating') !== -1) {
        items.push({ name: m.name, val: cost.val, label: cost.label, metal: m.primary_metal });
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
      var color = tierColor(tier);
      html += '<div style="display:flex;align-items:center;gap:8px;">';
      html += '<span style="width:140px;font-size:11px;text-align:right;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(item.name) + '</span>';
      html += '<div style="flex:1;background:var(--bg-secondary);border-radius:4px;overflow:hidden;height:22px;">';
      html += '<div style="width:' + pct + '%;background:' + color + ';height:100%;border-radius:4px;transition:width .5s ease;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;">';
      html += '<span style="font-size:10px;color:#fff;font-weight:600;font-family:JetBrains Mono,monospace;">' + esc(item.label) + '</span>';
      html += '</div></div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  // ── RESERVES BREAKDOWN (split Cu / Au / Other) ──

  function renderReservesChart(mines) {
    var container = document.getElementById('reserves-breakdown');
    if (!container) return;

    var cuItems = [];
    var auItems = [];
    var otherItems = [];

    mines.forEach(function (m) {
      var ck = MineUnits.copperReservesKt(m);
      if (ck !== null && ck > 0) {
        var d = MineUnits.displayCuReserves(ck);
        cuItems.push({ name: m.name, val: d.val, label: d.label, kt: ck });
      }

      var gm = MineUnits.goldReservesMoz(m);
      if (gm !== null && gm > 0) {
        auItems.push({ name: m.name, val: gm, label: MineUnits.fmtNum(gm, 1) + ' Moz Au' });
      }

      var sm = MineUnits.silverReservesMoz(m);
      if (sm !== null && sm > 0) {
        otherItems.push({ name: m.name, val: sm, label: MineUnits.fmtNum(sm, 1) + ' Moz Ag' });
      }
    });

    cuItems.sort(function (a, b) { return b.val - a.val; });
    auItems.sort(function (a, b) { return b.val - a.val; });

    var html = '<div style="padding:1rem;">';

    if (cuItems.length > 0) {
      html += buildReservesSection('Copper reserves', cuItems, ['#d97706', '#f59e0b', '#b45309', '#ea580c', '#92400e', '#fbbf24', '#c2410c', '#a16207']);
    }

    if (auItems.length > 0) {
      html += buildReservesSection('Gold reserves', auItems, ['#eab308', '#facc15', '#ca8a04', '#a16207', '#fde047', '#854d0e', '#fef08a', '#713f12']);
    }

    if (otherItems.length > 0) {
      html += buildReservesSection('Silver reserves', otherItems, ['#94a3b8', '#64748b', '#cbd5e1', '#475569', '#e2e8f0', '#334155']);
    }

    if (cuItems.length === 0 && auItems.length === 0 && otherItems.length === 0) {
      html += '<p style="text-align:center;color:var(--text-secondary);padding:1rem;">No per-mine reserve data available for this company.</p>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function buildReservesSection(title, items, colors) {
    var total = items.reduce(function (s, i) { return s + i.val; }, 0);
    var html = '<div style="margin-bottom:1.25rem;">';
    html += '<h4 style="font-size:13px;font-weight:700;margin:0 0 8px;color:var(--text-primary);">' + title + '</h4>';
    html += '<div style="display:flex;height:24px;border-radius:6px;overflow:hidden;margin-bottom:8px;">';
    items.forEach(function (item, i) {
      var pct = (item.val / total * 100);
      html += '<div style="width:' + pct + '%;background:' + colors[i % colors.length] + ';transition:width .5s;" title="' + esc(item.name) + ': ' + esc(item.label) + '"></div>';
    });
    html += '</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px 14px;">';
    items.forEach(function (item, i) {
      var pct = (item.val / total * 100).toFixed(1);
      html += '<div style="display:flex;align-items:center;gap:4px;font-size:11px;">';
      html += '<span style="width:10px;height:10px;border-radius:2px;background:' + colors[i % colors.length] + ';flex-shrink:0;"></span>';
      html += '<span>' + esc(item.name) + ' <strong>' + pct + '%</strong> (' + esc(item.label) + ')</span>';
      html += '</div>';
    });
    html += '</div></div>';
    return html;
  }

  // ── LEAFLET MAP (per-company) ──

  function renderMineMap(mines) {
    var container = document.getElementById('mine-map-placeholder');
    if (!container) return;

    var hasLeaflet = typeof L !== 'undefined';
    if (!hasLeaflet) {
      renderFlagMap(mines, container);
      return;
    }

    container.style.height = '350px';
    container.style.minHeight = '350px';
    container.style.padding = '0';
    container.style.background = '#1a1a2e';
    container.classList.remove('mine-map-placeholder');

    if (!leafletMap) {
      leafletMap = L.map(container, { scrollWheelZoom: false, zoomControl: true }).setView([10, 0], 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '\u00a9 OpenStreetMap \u00a9 CARTO',
        maxZoom: 18
      }).addTo(leafletMap);
      markerGroup = L.layerGroup().addTo(leafletMap);
    }

    markerGroup.clearLayers();
    var bounds = [];
    var coords = typeof MINE_COORDS !== 'undefined' ? MINE_COORDS : {};

    mines.forEach(function (m) {
      var ll = coords[m.name];
      if (!ll) return;
      var color = metalColor(m.primary_metal);
      var prod = primaryProd(m);
      var cost = primaryCost(m);

      var icon = L.divIcon({
        className: '',
        html: '<div style="width:14px;height:14px;border-radius:50%;background:' + color + ';border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.5);"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      var popup = '<div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.5;min-width:160px;">'
        + '<strong style="font-size:13px;">' + esc(m.name) + '</strong><br>'
        + '<span style="color:#888;">' + esc(m.country) + '</span><br>'
        + (m.ownership_pct ? 'Ownership: ' + m.ownership_pct + '%<br>' : '')
        + (m.primary_metal ? '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + color + ';margin-right:4px;"></span>' + metalLabel(m.primary_metal) + '<br>' : '')
        + (prod.label !== '\u2014' ? 'Production: ' + prod.label + '<br>' : '')
        + (cost.label !== '\u2014' ? 'AISC: ' + cost.label + '<br>' : '')
        + '<span style="font-size:11px;color:#aaa;">' + esc(m.status || '') + '</span>'
        + '</div>';

      var marker = L.marker(ll, { icon: icon }).bindPopup(popup);
      markerGroup.addLayer(marker);
      bounds.push(ll);
    });

    if (bounds.length > 0) {
      if (bounds.length === 1) {
        leafletMap.setView(bounds[0], 6);
      } else {
        leafletMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 8 });
      }
    }

    setTimeout(function () { leafletMap.invalidateSize(); }, 200);
  }

  function renderFlagMap(mines, container) {
    var countryFlags = {
      'Indonesia': '\ud83c\uddee\ud83c\udde9', 'Peru': '\ud83c\uddf5\ud83c\uddea', 'Chile': '\ud83c\udde8\ud83c\uddf1',
      'United States': '\ud83c\uddfa\ud83c\uddf8', 'USA': '\ud83c\uddfa\ud83c\uddf8', 'Canada': '\ud83c\udde8\ud83c\udde6',
      'Australia': '\ud83c\udde6\ud83c\uddfa', 'South Africa': '\ud83c\uddff\ud83c\udde6', 'Ghana': '\ud83c\uddec\ud83c\udded',
      'Tanzania': '\ud83c\uddf9\ud83c\uddff', 'Mali': '\ud83c\uddf2\ud83c\uddf1', 'DRC': '\ud83c\udde8\ud83c\udde9',
      'Dominican Republic': '\ud83c\udde9\ud83c\uddf4', 'Argentina': '\ud83c\udde6\ud83c\uddf7', 'Mexico': '\ud83c\uddf2\ud83c\uddfd',
      'Brazil': '\ud83c\udde7\ud83c\uddf7', 'Philippines': '\ud83c\uddf5\ud83c\udded', 'Namibia': '\ud83c\uddf3\ud83c\udde6',
      'Colombia': '\ud83c\udde8\ud83c\uddf4', 'Finland': '\ud83c\uddeb\ud83c\uddee', 'Bolivia': '\ud83c\udde7\ud83c\uddf4',
      'Zambia': '\ud83c\uddff\ud83c\uddf2', 'Pakistan': '\ud83c\uddf5\ud83c\uddf0', 'Suriname': '\ud83c\uddf8\ud83c\uddf7',
      'Mongolia': '\ud83c\uddf2\ud83c\uddf3', 'Spain': '\ud83c\uddea\ud83c\uddf8', 'Guinea': '\ud83c\uddec\ud83c\uddf3',
      'Papua New Guinea': '\ud83c\uddf5\ud83c\uddec', 'Mauritania': '\ud83c\uddf2\ud83c\uddf7'
    };
    var countries = {};
    mines.forEach(function (m) {
      var c = m.country || 'Unknown';
      if (!countries[c]) countries[c] = [];
      countries[c].push(m.name);
    });
    var html = '<div style="display:flex;flex-wrap:wrap;gap:12px;padding:1rem;">';
    Object.keys(countries).forEach(function (c) {
      var flag = countryFlags[c] || '\ud83c\udff3\ufe0f';
      html += '<div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;padding:10px 14px;min-width:140px;">';
      html += '<div style="font-size:20px;margin-bottom:4px;">' + flag + '</div>';
      html += '<div style="font-size:12px;font-weight:700;margin-bottom:2px;">' + esc(c) + '</div>';
      html += '<div style="font-size:11px;color:var(--text-secondary);">' + countries[c].length + ' operation' + (countries[c].length > 1 ? 's' : '') + '</div>';
      countries[c].forEach(function (name) {
        html += '<div style="font-size:10px;color:var(--text-secondary);margin-top:2px;">\u2022 ' + esc(name) + '</div>';
      });
      html += '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  // ── CROSS-COMPANY BENCHMARKS (normalized, split Cu / Au) ──

  function buildAllMines() {
    if (typeof MINES_DATA === 'undefined') return [];
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

    // ── Lowest cost — Copper ──
    var cuCostEl = document.getElementById('lowest-cost-copper');
    if (cuCostEl) {
      var cuCostItems = [];
      all.forEach(function (item) {
        if (!isCopper(item.mine)) return;
        var cv = MineUnits.copperCostPerLb(item.mine);
        if (cv !== null && cv > 0 && item.mine.status && item.mine.status.toLowerCase().indexOf('operating') !== -1) {
          var d = MineUnits.displayCuCost(cv);
          cuCostItems.push({ ticker: item.ticker, name: item.mine.name, val: d.val, label: d.label });
        }
      });
      cuCostItems.sort(function (a, b) { return a.val - b.val; });
      cuCostEl.innerHTML = renderRankingTable(cuCostItems.slice(0, 15), MineUnits.cuCostUnit(), 'label');
    }

    // ── Lowest cost — Gold ──
    var auCostEl = document.getElementById('lowest-cost-gold');
    if (auCostEl) {
      var auCostItems = [];
      all.forEach(function (item) {
        if (!isGold(item.mine)) return;
        var gv = MineUnits.goldCostPerOz(item.mine);
        if (gv !== null && gv > 0 && item.mine.status && item.mine.status.toLowerCase().indexOf('operating') !== -1) {
          var d = MineUnits.displayAuCost(gv);
          auCostItems.push({ ticker: item.ticker, name: item.mine.name, val: d.val, label: d.label });
        }
      });
      auCostItems.sort(function (a, b) { return a.val - b.val; });
      auCostEl.innerHTML = renderRankingTable(auCostItems.slice(0, 15), '$/oz Au', 'label');
    }

    // ── Largest reserves — Copper (normalized to display unit) ──
    var cuResEl = document.getElementById('largest-reserves-copper');
    if (cuResEl) {
      var cuResItems = [];
      all.forEach(function (item) {
        var ck = MineUnits.copperReservesKt(item.mine);
        if (ck !== null && ck > 0) {
          var d = MineUnits.displayCuReserves(ck);
          cuResItems.push({ ticker: item.ticker, name: item.mine.name, val: d.val, label: d.label });
        }
      });
      cuResItems.sort(function (a, b) { return b.val - a.val; });
      cuResEl.innerHTML = renderRankingTable(cuResItems.slice(0, 15), MineUnits.cuReservesUnit(), 'label');
    }

    // ── Largest reserves — Gold ──
    var auResEl = document.getElementById('largest-reserves-gold');
    if (auResEl) {
      var auResItems = [];
      all.forEach(function (item) {
        var gm = MineUnits.goldReservesMoz(item.mine);
        if (gm !== null && gm > 0) {
          auResItems.push({ ticker: item.ticker, name: item.mine.name, val: gm, label: MineUnits.fmtNum(gm, 1) + ' Moz' });
        }
      });
      auResItems.sort(function (a, b) { return b.val - a.val; });
      auResEl.innerHTML = renderRankingTable(auResItems.slice(0, 15), 'Moz Au', 'label');
    }

    // ── Best value (combined but with metal tag) ──
    var bestVal = document.getElementById('best-value-ranking');
    if (bestVal) {
      var valItems = [];
      all.forEach(function (item) {
        var cost = primaryCost(item.mine);
        var life = item.mine.mine_life_yrs;
        if (cost.val !== null && cost.val > 0 && life && life > 0 && item.mine.status && item.mine.status.toLowerCase().indexOf('operating') !== -1) {
          var score = (life / cost.val) * 100;
          valItems.push({ ticker: item.ticker, name: item.mine.name, val: score, label: fmt(score, 1), cost: cost.label, life: life + ' yrs', metal: item.mine.primary_metal });
        }
      });
      valItems.sort(function (a, b) { return b.val - a.val; });

      var html = '<table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:#1e293b;color:#e2e8f0;">';
      html += '<th style="padding:8px;text-align:left;">#</th><th style="padding:8px;text-align:left;">Mine</th><th style="padding:8px;">Ticker</th><th style="padding:8px;">Metal</th><th style="padding:8px;">Cost</th><th style="padding:8px;">Life</th><th style="padding:8px;">Score</th>';
      html += '</tr></thead><tbody>';
      valItems.slice(0, 15).forEach(function (item, i) {
        var mc = metalColor(item.metal);
        html += '<tr style="background:' + (i % 2 ? 'var(--bg-secondary)' : 'var(--bg-primary)') + ';">';
        html += '<td style="padding:6px 8px;font-weight:700;color:var(--primary);">#' + (i + 1) + '</td>';
        html += '<td style="padding:6px 8px;font-weight:600;">' + esc(item.name) + '</td>';
        html += '<td style="padding:6px 8px;text-align:center;font-family:JetBrains Mono,monospace;">' + item.ticker + '</td>';
        html += '<td style="padding:6px 8px;text-align:center;"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + mc + ';margin-right:4px;"></span>' + metalLabel(item.metal) + '</td>';
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
    html += '<th style="padding:8px;text-align:left;">#</th><th style="padding:8px;text-align:left;">Mine</th><th style="padding:8px;">Ticker</th><th style="padding:8px;">' + valueHeader + '</th>';
    html += '</tr></thead><tbody>';
    items.forEach(function (item, i) {
      html += '<tr style="background:' + (i % 2 ? 'var(--bg-secondary)' : 'var(--bg-primary)') + ';">';
      html += '<td style="padding:6px 8px;font-weight:700;color:var(--primary);">#' + (i + 1) + '</td>';
      html += '<td style="padding:6px 8px;font-weight:600;">' + esc(item.name) + '</td>';
      html += '<td style="padding:6px 8px;text-align:center;font-family:JetBrains Mono,monospace;">' + item.ticker + '</td>';
      html += '<td style="padding:6px 8px;text-align:center;font-family:JetBrains Mono,monospace;">' + item[valueKey] + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  // ── COMPARATOR ──

  function setupComparator() {
    var compareBtn = document.getElementById('mine-compare-btn');
    if (!compareBtn) return;
    compareBtn.addEventListener('click', function () {
      var name = document.getElementById('bm-name').value || 'Your Mine';
      var aisc = parseFloat(document.getElementById('bm-aisc').value) || 0;
      var metalSel = document.getElementById('bm-metal');
      var metal = metalSel ? metalSel.value : 'gold';

      var results = document.getElementById('mine-benchmark-results');
      if (!results) return;

      var all = buildAllMines();
      var comparable = [];
      all.forEach(function (item) {
        if (item.mine.primary_metal !== metal) return;
        var c = primaryCost(item.mine);
        if (c.val !== null && c.val > 0) {
          comparable.push({ ticker: item.ticker, name: item.mine.name, cost: c.val, label: c.label });
        }
      });
      comparable.push({ ticker: '\u2192', name: name, cost: aisc, label: fmtCost(aisc), isUser: true });
      comparable.sort(function (a, b) { return a.cost - b.cost; });

      var rank = 0;
      for (var i = 0; i < comparable.length; i++) {
        if (comparable[i].isUser) { rank = i + 1; break; }
      }

      var html = '<div style="padding:1rem;">';
      html += '<h4 style="margin-bottom:12px;">Your mine ranks <strong style="color:var(--primary);">#' + rank + '</strong> out of ' + comparable.length + ' ' + metal + ' mines by cost</h4>';
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
        html += '<td style="padding:4px 8px;">' + (item.isUser ? '\u2605 ' : '') + esc(item.name) + '</td>';
        html += '<td style="padding:4px 8px;text-align:center;font-family:JetBrains Mono,monospace;">' + item.ticker + '</td>';
        html += '<td style="padding:4px 8px;text-align:center;font-family:JetBrains Mono,monospace;">' + item.label + '</td>';
        html += '</tr>';
      }
      html += '</tbody></table></div></div>';
      results.innerHTML = html;
    });
  }

  // ── SORT HEADERS ──

  function setupSortHeaders() {
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
  }

  // ── UNIT TOGGLE WIRING ──

  function setupUnitToggle() {
    var st = MineUnits.getState();
    document.querySelectorAll('[data-cu-reserves]').forEach(function (btn) {
      if (btn.getAttribute('data-cu-reserves') === st.cuReserves) btn.classList.add('toggle-active');
      btn.addEventListener('click', function () {
        MineUnits.setCuReserves(this.getAttribute('data-cu-reserves'));
        document.querySelectorAll('[data-cu-reserves]').forEach(function (b) { b.classList.remove('toggle-active'); });
        this.classList.add('toggle-active');
        refreshAll();
      });
    });
    document.querySelectorAll('[data-cu-cost]').forEach(function (btn) {
      if (btn.getAttribute('data-cu-cost') === st.cuCost) btn.classList.add('toggle-active');
      btn.addEventListener('click', function () {
        MineUnits.setCuCost(this.getAttribute('data-cu-cost'));
        document.querySelectorAll('[data-cu-cost]').forEach(function (b) { b.classList.remove('toggle-active'); });
        this.classList.add('toggle-active');
        refreshAll();
      });
    });
  }

  function refreshAll() {
    renderBenchmarks();
    if (currentTicker) {
      var stock = getStock(currentTicker);
      var mines = MINES_DATA[currentTicker] || [];
      renderMineTable(mines, stock);
      renderCostCurve(mines, stock);
      renderReservesChart(mines);
    }
  }

  // ── SELECTOR + INIT ──

  function setupSelector() {
    var sel = document.getElementById('company-selector') || document.getElementById('mine-company-select');
    if (!sel) return null;
    sel.addEventListener('change', function () {
      if (this.value) loadCompany(this.value);
    });
    return sel;
  }

  function initPage() {
    if (!dataReady()) return;
    setupSortHeaders();
    setupComparator();
    setupUnitToggle();
    renderBenchmarks();
    var sel = document.getElementById('company-selector') || document.getElementById('mine-company-select');
    if (sel && sel.value) loadCompany(sel.value);
  }

  setupSelector();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
  } else {
    initPage();
  }

  window.addEventListener('load', function () {
    var sel = document.getElementById('company-selector') || document.getElementById('mine-company-select');
    if (sel && sel.value) loadCompany(sel.value);
  });
})();
