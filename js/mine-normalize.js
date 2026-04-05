/*
 * mine-normalize.js — Unit conversion and toggle state for mine-analysis page.
 * Canonical units: copper reserves in kt, copper costs in $/lb, gold in Moz and $/oz.
 * Load BEFORE mine-analysis.js.
 */
var MineUnits = (function () {
  'use strict';

  var BLBS_TO_KT = 453.592;
  var LB_TO_METRIC_TON = 2204.62;

  var defaults = { cuReserves: 'kt', cuCost: 'lb' };

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem('mine_units') || '{}');
      return {
        cuReserves: s.cuReserves || defaults.cuReserves,
        cuCost: s.cuCost || defaults.cuCost
      };
    } catch (e) { return { cuReserves: defaults.cuReserves, cuCost: defaults.cuCost }; }
  }

  function save(prefs) {
    try { localStorage.setItem('mine_units', JSON.stringify(prefs)); } catch (e) { /* noop */ }
  }

  var state = load();

  // ── Copper reserves: normalize any source to kt, then convert to display unit ──

  function copperReservesKt(mine) {
    var r = mine.reserves;
    if (!r) return null;
    if (r.copper_blbs && r.copper_blbs > 0) return r.copper_blbs * BLBS_TO_KT;
    if (r.copper_kt && r.copper_kt > 0) return r.copper_kt;
    if (r.copper_mt && r.copper_mt > 0) return r.copper_mt * 1000;
    return null;
  }

  function displayCuReserves(kt) {
    if (kt === null || kt === undefined) return { val: null, label: '\u2014' };
    switch (state.cuReserves) {
      case 'mt': return { val: kt / 1000, label: fmtNum(kt / 1000, 2) + ' Mt Cu' };
      case 'blbs': return { val: kt / BLBS_TO_KT, label: fmtNum(kt / BLBS_TO_KT, 1) + ' Blbs Cu' };
      default: return { val: kt, label: fmtNum(kt, 0) + ' kt Cu' };
    }
  }

  // ── Gold reserves: already Moz ──

  function goldReservesMoz(mine) {
    var r = mine.reserves;
    if (!r) return null;
    if (r.gold_moz && r.gold_moz > 0) return r.gold_moz;
    return null;
  }

  function displayAuReserves(moz) {
    if (moz === null || moz === undefined) return { val: null, label: '\u2014' };
    return { val: moz, label: fmtNum(moz, 1) + ' Moz Au' };
  }

  // ── Silver reserves ──

  function silverReservesMoz(mine) {
    var r = mine.reserves;
    if (!r) return null;
    if (r.silver_moz && r.silver_moz > 0) return r.silver_moz;
    return null;
  }

  function displayAgReserves(moz) {
    if (moz === null || moz === undefined) return { val: null, label: '\u2014' };
    return { val: moz, label: fmtNum(moz, 1) + ' Moz Ag' };
  }

  // ── Copper costs: canonical $/lb ──

  function copperCostPerLb(mine) {
    var c = mine.costs;
    if (!c) return null;
    if (c.aisc_per_lb_cu !== undefined && c.aisc_per_lb_cu !== null) return c.aisc_per_lb_cu;
    if (c.cash_cost_per_lb !== undefined && c.cash_cost_per_lb !== null) return c.cash_cost_per_lb;
    if (c.net_cash_cost_per_lb !== undefined && c.net_cash_cost_per_lb !== null) return c.net_cash_cost_per_lb;
    return null;
  }

  function displayCuCost(perLb) {
    if (perLb === null || perLb === undefined) return { val: null, label: '\u2014' };
    if (state.cuCost === 'ton') {
      var perTon = perLb * LB_TO_METRIC_TON;
      return { val: perTon, label: '$' + fmtNum(perTon, 0) + '/t' };
    }
    return { val: perLb, label: '$' + fmtNum(perLb, 2) + '/lb' };
  }

  // ── Gold costs: always $/oz ──

  function goldCostPerOz(mine) {
    var c = mine.costs;
    if (!c) return null;
    if (c.aisc_per_oz !== undefined && c.aisc_per_oz !== null) return c.aisc_per_oz;
    if (c.cash_cost_per_oz !== undefined && c.cash_cost_per_oz !== null) return c.cash_cost_per_oz;
    return null;
  }

  function displayAuCost(perOz) {
    if (perOz === null || perOz === undefined) return { val: null, label: '\u2014' };
    return { val: perOz, label: '$' + fmtNum(perOz, 0) + '/oz' };
  }

  // ── Silver costs: always $/oz ──

  function silverCostPerOz(mine) {
    var c = mine.costs;
    if (!c) return null;
    if (c.aisc_per_oz_ag !== undefined && c.aisc_per_oz_ag !== null) return c.aisc_per_oz_ag;
    return null;
  }

  // ── Unit labels ──

  function cuReservesUnit() {
    switch (state.cuReserves) {
      case 'mt': return 'Mt Cu';
      case 'blbs': return 'Blbs Cu';
      default: return 'kt Cu';
    }
  }

  function cuCostUnit() {
    return state.cuCost === 'ton' ? '$/t Cu' : '$/lb Cu';
  }

  // ── Formatter ──

  function fmtNum(n, dec) {
    if (n === null || n === undefined) return '\u2014';
    return Number(n).toLocaleString('en-US', {
      minimumFractionDigits: dec || 0,
      maximumFractionDigits: dec || 0
    });
  }

  // ── Toggle API ──

  function setCuReserves(unit) {
    state.cuReserves = unit;
    save(state);
  }

  function setCuCost(unit) {
    state.cuCost = unit;
    save(state);
  }

  function getState() { return { cuReserves: state.cuReserves, cuCost: state.cuCost }; }

  return {
    copperReservesKt: copperReservesKt,
    displayCuReserves: displayCuReserves,
    goldReservesMoz: goldReservesMoz,
    displayAuReserves: displayAuReserves,
    silverReservesMoz: silverReservesMoz,
    displayAgReserves: displayAgReserves,
    copperCostPerLb: copperCostPerLb,
    displayCuCost: displayCuCost,
    goldCostPerOz: goldCostPerOz,
    displayAuCost: displayAuCost,
    silverCostPerOz: silverCostPerOz,
    cuReservesUnit: cuReservesUnit,
    cuCostUnit: cuCostUnit,
    setCuReserves: setCuReserves,
    setCuCost: setCuCost,
    getState: getState,
    fmtNum: fmtNum,
    BLBS_TO_KT: BLBS_TO_KT,
    LB_TO_METRIC_TON: LB_TO_METRIC_TON
  };
})();
