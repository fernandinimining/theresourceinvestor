/*
 * mines-data-patch.js — Adds properly structured AISC/cost fields to MINES_DATA.
 * Load AFTER mines-data.js. Extracts costs that were stored in notes into machine-readable fields.
 * Source: FY2024 company filings (10-K, MD&A, earnings releases).
 */
(function () {
  'use strict';
  if (typeof MINES_DATA === 'undefined') return;

  var COST_PATCHES = {
    "GOLD": {
      "Carlin Complex":      { aisc_per_oz: 1730, cash_cost_per_oz: 1187 },
      "Cortez Complex":      { aisc_per_oz: 1441, cash_cost_per_oz: 1046 },
      "Turquoise Ridge":     { aisc_per_oz: 1466, cash_cost_per_oz: 1238 },
      "Phoenix (NGM)":       { aisc_per_oz: 1031, cash_cost_per_oz: 765 },
      "Pueblo Viejo":        { aisc_per_oz: 1323, cash_cost_per_oz: 1005 },
      "Loulo-Gounkoto":      { aisc_per_oz: 1304, cash_cost_per_oz: 828 },
      "Kibali":              { aisc_per_oz: 1123, cash_cost_per_oz: 905 },
      "North Mara":          { aisc_per_oz: 1274, cash_cost_per_oz: 989 },
      "Bulyanhulu":          { aisc_per_oz: 1420, cash_cost_per_oz: 1070 },
      "Tongon":              { aisc_per_oz: 1867, cash_cost_per_oz: 1670 },
      "Veladero":            { aisc_per_oz: 1334, cash_cost_per_oz: 905 },
      "Porgera":             { aisc_per_oz: 1666, cash_cost_per_oz: 1073 },
      "Lumwana":             { aisc_per_lb_cu: 3.85, cash_cost_per_lb: 2.23 }
    },
    "NEM": {
      "Boddington":     { aisc_per_oz: 1288, cash_cost_per_oz: 1056 },
      "Tanami":          { aisc_per_oz: 1281, cash_cost_per_oz: 947 },
      "Cadia":           { aisc_per_oz: 1048, cash_cost_per_oz: 653 },
      "Lihir":           { aisc_per_oz: 1512, cash_cost_per_oz: 1270 },
      "Ahafo":           { aisc_per_oz: 1072, cash_cost_per_oz: 904 },
      "Akyem":           { aisc_per_oz: 1816, cash_cost_per_oz: 1596 },
      "Penasquito":      { aisc_per_oz: 984, cash_cost_per_oz: 776 },
      "Merian":          { aisc_per_oz: 1852, cash_cost_per_oz: 1457 },
      "Cerro Negro":     { aisc_per_oz: 1631, cash_cost_per_oz: 1325 },
      "Yanacocha":       { aisc_per_oz: 1196, cash_cost_per_oz: 1003 },
      "Brucejack":       { aisc_per_oz: 1603, cash_cost_per_oz: 1254 },
      "Red Chris":       { aisc_per_oz: 1607, cash_cost_per_oz: 1225 }
    },
    "FCX": {
      "Grasberg":        { aisc_per_lb_cu: 1.64, cash_cost_per_lb: 1.64, net_cash_cost_per_lb: -0.28 },
      "Cerro Verde":     { aisc_per_lb_cu: 2.63, cash_cost_per_lb: 2.63, net_cash_cost_per_lb: 2.46 },
      "Morenci":          { aisc_per_lb_cu: 3.46, cash_cost_per_lb: 3.46, net_cash_cost_per_lb: 3.11 }
    },
    "SCCO": {
      "Buenavista":      { aisc_per_lb_cu: 0.89, cash_cost_per_lb: 0.89 },
      "La Caridad":      { aisc_per_lb_cu: 0.89, cash_cost_per_lb: 0.89 },
      "Toquepala":       { aisc_per_lb_cu: 0.89, cash_cost_per_lb: 0.89 },
      "Cuajone":         { aisc_per_lb_cu: 0.89, cash_cost_per_lb: 0.89 }
    },
    "TECK": {
      "Highland Valley Copper": { aisc_per_lb_cu: 2.20, cash_cost_per_lb: 2.54 },
      "Antamina":               { aisc_per_lb_cu: 2.20, cash_cost_per_lb: 2.54 },
      "Quebrada Blanca (QB2)":  { aisc_per_lb_cu: 2.20, cash_cost_per_lb: 2.54 },
      "Carmen de Andacollo":    { aisc_per_lb_cu: 2.20, cash_cost_per_lb: 2.54 },
      "Red Dog":                { aisc_per_lb_zn: 0.39, cash_cost_per_lb: 0.61 }
    },
    "HBM": {
      "Constancia + Pampacancha":  { aisc_per_lb_cu: 1.86, cash_cost_per_lb: 1.18 },
      "Lalor / New Britannia":     { aisc_per_oz: 868, cash_cost_per_oz: 606 },
      "Copper Mountain":           { aisc_per_lb_cu: 5.29, cash_cost_per_lb: 2.74 }
    },
    "AEM": {
      "Canadian Malartic / Odyssey": { aisc_per_oz: 1239, cash_cost_per_oz: 930 },
      "Detour Lake":                 { aisc_per_oz: 1239, cash_cost_per_oz: 796 },
      "Macassa":                     { aisc_per_oz: 1239, cash_cost_per_oz: 748 },
      "LaRonde":                     { aisc_per_oz: 1239, cash_cost_per_oz: 945 },
      "Goldex":                      { aisc_per_oz: 1239, cash_cost_per_oz: 923 },
      "Meadowbank / Amaruq":        { aisc_per_oz: 1239, cash_cost_per_oz: 938 },
      "Meliadine":                   { aisc_per_oz: 1239, cash_cost_per_oz: 940 },
      "Fosterville":                 { aisc_per_oz: 1239, cash_cost_per_oz: 647 },
      "Pinos Altos":                 { aisc_per_oz: 1239, cash_cost_per_oz: 1530 },
      "Kittila":                     { aisc_per_oz: 1239, cash_cost_per_oz: 1031 }
    },
    "KGC": {
      "Fort Knox / Manh Choh":  { aisc_per_oz: 1388, cash_cost_per_oz: null },
      "Round Mountain":          { aisc_per_oz: 1388, cash_cost_per_oz: null },
      "Bald Mountain":           { aisc_per_oz: 1388, cash_cost_per_oz: null },
      "Paracatu":                { aisc_per_oz: 1388, cash_cost_per_oz: null },
      "La Coipa":                { aisc_per_oz: 1388, cash_cost_per_oz: null },
      "Tasiast":                 { aisc_per_oz: 1388, cash_cost_per_oz: null }
    },
    "BTG": {
      "Fekola":      { aisc_per_oz: 1465, cash_cost_per_oz: null },
      "Masbate":     { aisc_per_oz: 1340, cash_cost_per_oz: null },
      "Otjikoto":    { aisc_per_oz: 1010, cash_cost_per_oz: null }
    },
    "PAAS": {
      "La Colorada":     { aisc_per_oz_ag: 18.98 },
      "Huaron":          { aisc_per_oz_ag: 18.98 },
      "San Vicente":     { aisc_per_oz_ag: 18.98 },
      "Cerro Moro":      { aisc_per_oz_ag: 18.98 },
      "Jacobina":        { aisc_per_oz: 1501, cash_cost_per_oz: null },
      "El Penon":        { aisc_per_oz: 1501, cash_cost_per_oz: null },
      "Shahuindo":       { aisc_per_oz: 1501, cash_cost_per_oz: null },
      "Timmins":         { aisc_per_oz: 1501, cash_cost_per_oz: null },
      "Minera Florida":  { aisc_per_oz: 1501, cash_cost_per_oz: null }
    },
         "AG": {
             "La Encantada":    { aisc_per_oz_ag: 28.31 }
           },
           "BVN": {
             "El Brocal (Colquijirca)": { aisc_per_lb_cu: 3.00, cash_cost_per_lb: 2.73 },
             "Cerro Verde (equity)":    { cash_cost_per_lb: 2.63, net_cash_cost_per_lb: 2.46 }
           }
  };

  Object.keys(COST_PATCHES).forEach(function (ticker) {
    var mines = MINES_DATA[ticker];
    if (!mines) return;
    var patches = COST_PATCHES[ticker];

    mines.forEach(function (mine) {
      var patch = patches[mine.name];
      if (!patch) return;
      Object.keys(patch).forEach(function (key) {
        mine.costs[key] = patch[key];
      });
    });
  });

  // Also patch NEM Penasquito encoding issue
  var nemMines = MINES_DATA["NEM"];
  if (nemMines) {
    nemMines.forEach(function (m) {
      if (m.name && m.name.indexOf('asquito') !== -1 && !m.costs.aisc_per_oz) {
        m.costs.aisc_per_oz = 984;
        m.costs.cash_cost_per_oz = 776;
      }
    });
  }
})();
