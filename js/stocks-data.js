/*
 * stocks-data.js — Public financial data for worldwide mining stocks
 * All data sourced from latest public annual reports, 10-K, 20-F filings.
 * Figures are approximate and for illustrative/educational purposes only.
 * EV/EBITDA multiples derived from: (market_cap + net_debt) / EBITDA
 * Last updated: April 2026
 */
var STOCKS_DATA = [
  // ── COPPER ──
  {
    ticker: "FCX", name: "Freeport-McMoRan", exchange: "NYSE",
    country: "US/Indonesia/Peru", region: "Americas/Asia",
    category: "copper", tags: ["copper","gold","molybdenum"],
    description: "World's largest publicly traded copper producer. Operates Grasberg (Indonesia), Cerro Verde (Peru), and Morenci (US).",
    market_cap_b: 67, ev_ebitda: 6.7, div_yield: 1.4, pe_ratio: 14,
    metals: {
      copper: { production_mlbs: 4100, aisc_per_lb: 1.58, pct_revenue: 0.78 },
      gold:   { production_koz: 1800, aisc_per_oz: 950, pct_revenue: 0.14 },
      molybdenum: { production_mlbs: 80, aisc_per_lb: 8.50, pct_revenue: 0.08 }
    },
    financials: {
      revenue_m: 25800, ebitda_m: 10200, net_income_m: 4600,
      operating_costs_m: 15600, capex_m: 2900,
      cash_m: 5100, net_debt_m: 1600,
      shares_m: 1430, tax_rate: 0.30
    },
    reserves: { total_mt: 2900, copper_mt_contained: 29.4, gold_moz: 27.4, mine_life_yrs: 28 },
    rating: "Strong Buy", score: 9.1
  },
  {
    ticker: "SCCO", name: "Southern Copper", exchange: "NYSE",
    country: "Mexico/Peru", region: "Americas",
    category: "copper", tags: ["copper","molybdenum","zinc","silver"],
    description: "One of the world's lowest-cost copper producers with massive reserves in Mexico and Peru. Controlled by Grupo Mexico.",
    market_cap_b: 85, ev_ebitda: 15.2, div_yield: 3.2, pe_ratio: 22,
    metals: {
      copper: { production_mlbs: 2150, aisc_per_lb: 1.22, pct_revenue: 0.80 },
      molybdenum: { production_mlbs: 60, aisc_per_lb: 7.80, pct_revenue: 0.08 },
      zinc: { production_mlbs: 180, aisc_per_lb: 0.45, pct_revenue: 0.05 },
      silver: { production_koz: 18000, aisc_per_oz: 12.0, pct_revenue: 0.07 }
    },
    financials: {
      revenue_m: 12200, ebitda_m: 5850, net_income_m: 3200,
      operating_costs_m: 6350, capex_m: 2600,
      cash_m: 2200, net_debt_m: 3800,
      shares_m: 772, tax_rate: 0.32
    },
    reserves: { total_mt: 4400, copper_mt_contained: 44.0, mine_life_yrs: 60 },
    rating: "Buy", score: 8.2
  },
  {
    ticker: "TECK", name: "Teck Resources", exchange: "NYSE",
    country: "Canada/Chile/Peru", region: "Americas",
    category: "copper", tags: ["copper","zinc","steelmaking coal"],
    description: "Canadian miner pivoting to copper growth. QB2 in Chile ramping. Diversified base metals plus steelmaking coal.",
    market_cap_b: 24, ev_ebitda: 5.7, div_yield: 0.9, pe_ratio: 10,
    metals: {
      copper: { production_mlbs: 890, aisc_per_lb: 1.72, pct_revenue: 0.45 },
      zinc: { production_mlbs: 540, aisc_per_lb: 0.52, pct_revenue: 0.12 }
    },
    financials: {
      revenue_m: 11400, ebitda_m: 4400, net_income_m: 2100,
      operating_costs_m: 7000, capex_m: 2200,
      cash_m: 3800, net_debt_m: 1200,
      shares_m: 510, tax_rate: 0.27
    },
    reserves: { total_mt: 1100, copper_mt_contained: 10.8, mine_life_yrs: 22 },
    rating: "Strong Buy", score: 8.7
  },
  {
    ticker: "HBM", name: "Hudbay Minerals", exchange: "NYSE",
    country: "Canada/Peru", region: "Americas",
    category: "copper", tags: ["copper","zinc","gold","silver"],
    description: "Mid-cap copper-zinc producer with Constancia (Peru), Snow Lake (Canada), and Copper World (Arizona) pipeline.",
    market_cap_b: 5.2, ev_ebitda: 6.9, div_yield: 0.4, pe_ratio: 11,
    metals: {
      copper: { production_mlbs: 290, aisc_per_lb: 1.45, pct_revenue: 0.62 },
      zinc: { production_mlbs: 160, aisc_per_lb: 0.48, pct_revenue: 0.12 },
      gold: { production_koz: 120, aisc_per_oz: 880, pct_revenue: 0.18 },
      silver: { production_koz: 4200, aisc_per_oz: 11.0, pct_revenue: 0.08 }
    },
    financials: {
      revenue_m: 2100, ebitda_m: 850, net_income_m: 310,
      operating_costs_m: 1250, capex_m: 420,
      cash_m: 350, net_debt_m: 680,
      shares_m: 390, tax_rate: 0.28
    },
    reserves: { total_mt: 420, copper_mt_contained: 3.8, mine_life_yrs: 16 },
    rating: "Buy", score: 7.8
  },
  // ── GOLD ──
  {
    ticker: "GOLD", name: "Barrick Gold", exchange: "NYSE",
    country: "US/Canada/DRC/Mali/Tanzania", region: "Global",
    category: "gold", tags: ["gold","copper"],
    description: "Second-largest gold miner globally. Tier One assets across Nevada (JV with Newmont), Africa, and growing copper at Reko Diq.",
    market_cap_b: 38, ev_ebitda: 6.6, div_yield: 2.1, pe_ratio: 15,
    metals: {
      gold: { production_koz: 3900, aisc_per_oz: 1050, pct_revenue: 0.82 },
      copper: { production_mlbs: 420, aisc_per_lb: 1.85, pct_revenue: 0.18 }
    },
    financials: {
      revenue_m: 13200, ebitda_m: 5600, net_income_m: 2200,
      operating_costs_m: 7600, capex_m: 2800,
      cash_m: 4100, net_debt_m: -800,
      shares_m: 1750, tax_rate: 0.28
    },
    reserves: { gold_moz: 77, copper_mt_contained: 6.2, mine_life_yrs: 18 },
    rating: "Strong Buy", score: 9.0
  },
  {
    ticker: "NEM", name: "Newmont Corporation", exchange: "NYSE",
    country: "US/Canada/Australia/Ghana/Peru/Argentina", region: "Global",
    category: "gold", tags: ["gold","silver","copper","zinc"],
    description: "World's largest gold producer following Newcrest acquisition. 12+ operations across 5 continents.",
    market_cap_b: 55, ev_ebitda: 8.6, div_yield: 2.8, pe_ratio: 18,
    metals: {
      gold: { production_koz: 6800, aisc_per_oz: 1150, pct_revenue: 0.88 },
      silver: { production_koz: 28000, aisc_per_oz: 14.0, pct_revenue: 0.05 },
      copper: { production_mlbs: 110, aisc_per_lb: 2.10, pct_revenue: 0.04 }
    },
    financials: {
      revenue_m: 19800, ebitda_m: 6900, net_income_m: 2800,
      operating_costs_m: 12900, capex_m: 3200,
      cash_m: 3400, net_debt_m: 4200,
      shares_m: 1260, tax_rate: 0.30
    },
    reserves: { gold_moz: 135, mine_life_yrs: 20 },
    rating: "Strong Buy", score: 8.6
  },
  {
    ticker: "AEM", name: "Agnico Eagle Mines", exchange: "NYSE",
    country: "Canada/Australia/Mexico/Finland", region: "Americas/Europe",
    category: "gold", tags: ["gold","silver"],
    description: "Senior gold producer with operations exclusively in tier-one jurisdictions (Canada, Australia, Mexico, Finland).",
    market_cap_b: 48, ev_ebitda: 11.0, div_yield: 1.6, pe_ratio: 20,
    metals: {
      gold: { production_koz: 3500, aisc_per_oz: 1020, pct_revenue: 0.96 },
      silver: { production_koz: 3200, aisc_per_oz: 13.0, pct_revenue: 0.04 }
    },
    financials: {
      revenue_m: 8200, ebitda_m: 4400, net_income_m: 1900,
      operating_costs_m: 3800, capex_m: 1650,
      cash_m: 1100, net_debt_m: 600,
      shares_m: 500, tax_rate: 0.26
    },
    reserves: { gold_moz: 54, mine_life_yrs: 15 },
    rating: "Buy", score: 8.3
  },
  {
    ticker: "KGC", name: "Kinross Gold", exchange: "NYSE",
    country: "US/Canada/Brazil/Chile/Mauritania", region: "Americas/Africa",
    category: "gold", tags: ["gold","silver"],
    description: "Mid-tier gold producer focused on the Americas. Great Bear project in Ontario is key growth catalyst.",
    market_cap_b: 15, ev_ebitda: 6.1, div_yield: 1.3, pe_ratio: 12,
    metals: {
      gold: { production_koz: 2100, aisc_per_oz: 1080, pct_revenue: 0.97 },
      silver: { production_koz: 5500, aisc_per_oz: 13.5, pct_revenue: 0.03 }
    },
    financials: {
      revenue_m: 5200, ebitda_m: 2400, net_income_m: 1050,
      operating_costs_m: 2800, capex_m: 900,
      cash_m: 1300, net_debt_m: -400,
      shares_m: 1220, tax_rate: 0.25
    },
    reserves: { gold_moz: 30, mine_life_yrs: 14 },
    rating: "Buy", score: 7.9
  },
  {
    ticker: "BTG", name: "B2Gold Corp", exchange: "NYSE",
    country: "Canada/Mali/Philippines/Namibia", region: "Global",
    category: "gold", tags: ["gold"],
    description: "Low-cost intermediate gold producer. Fekola mine in Mali is flagship. Back River in Nunavut ramping up.",
    market_cap_b: 6.5, ev_ebitda: 6.5, div_yield: 3.8, pe_ratio: 9,
    metals: {
      gold: { production_koz: 900, aisc_per_oz: 980, pct_revenue: 0.99 }
    },
    financials: {
      revenue_m: 2100, ebitda_m: 950, net_income_m: 450,
      operating_costs_m: 1150, capex_m: 380,
      cash_m: 550, net_debt_m: -350,
      shares_m: 1300, tax_rate: 0.22
    },
    reserves: { gold_moz: 10.8, mine_life_yrs: 12 },
    rating: "Buy", score: 7.6
  },
  {
    ticker: "GFI", name: "Gold Fields", exchange: "NYSE",
    country: "South Africa/Ghana/Australia/Peru/Chile", region: "Global",
    category: "gold", tags: ["gold","copper"],
    description: "South African-headquartered gold major with operations across 4 continents. Salares Norte in Chile is new growth asset.",
    market_cap_b: 17, ev_ebitda: 7.3, div_yield: 2.5, pe_ratio: 13,
    metals: {
      gold: { production_koz: 2300, aisc_per_oz: 1100, pct_revenue: 0.94 },
      copper: { production_mlbs: 60, aisc_per_lb: 2.00, pct_revenue: 0.06 }
    },
    financials: {
      revenue_m: 5600, ebitda_m: 2500, net_income_m: 1100,
      operating_costs_m: 3100, capex_m: 1100,
      cash_m: 800, net_debt_m: 1200,
      shares_m: 890, tax_rate: 0.29
    },
    reserves: { gold_moz: 49, mine_life_yrs: 19 },
    rating: "Buy", score: 7.7
  },
  {
    ticker: "AU", name: "AngloGold Ashanti", exchange: "NYSE",
    country: "US/Ghana/Tanzania/Australia/Brazil/Guinea", region: "Global",
    category: "gold", tags: ["gold"],
    description: "Global gold major redomiciled to US. Nine operations across Africa, Americas, and Australia. Nevada expansion underway.",
    market_cap_b: 14, ev_ebitda: 5.7, div_yield: 1.8, pe_ratio: 11,
    metals: {
      gold: { production_koz: 2650, aisc_per_oz: 1140, pct_revenue: 0.98 }
    },
    financials: {
      revenue_m: 6100, ebitda_m: 2600, net_income_m: 980,
      operating_costs_m: 3500, capex_m: 1000,
      cash_m: 1200, net_debt_m: 800,
      shares_m: 420, tax_rate: 0.28
    },
    reserves: { gold_moz: 32, mine_life_yrs: 12 },
    rating: "Buy", score: 7.5
  },
  // ── GOLD / SILVER — PERU ──
  {
    ticker: "BVN", name: "Buenaventura", exchange: "NYSE",
    country: "Peru", region: "Americas",
    category: "gold", tags: ["gold","silver","copper","zinc"],
    description: "Peru's largest publicly listed precious metals company. Operates 6 direct mines plus equity stakes in Yanacocha (43.65%, NEM JV) and Cerro Verde (19.58%, FCX JV). San Gabriel copper-gold project in development.",
    market_cap_b: 9.7, ev_ebitda: 15.6, div_yield: 3.4, pe_ratio: 23,
    metals: {
      gold: { production_koz: 280, aisc_per_oz: 1200, pct_revenue: 0.55 },
      silver: { production_koz: 15000, aisc_per_oz: 16.0, pct_revenue: 0.30 },
      copper: { production_mlbs: 25, aisc_per_lb: 2.10, pct_revenue: 0.08 },
      zinc: { production_mlbs: 50, aisc_per_lb: 0.55, pct_revenue: 0.07 }
    },
    financials: {
      revenue_m: 1155, ebitda_m: 630, net_income_m: 194,
      operating_costs_m: 724, capex_m: 320,
      cash_m: 478, net_debt_m: 148,
      shares_m: 254, tax_rate: 0.30
    },
    reserves: { gold_moz: 6.5, silver_moz: 230, mine_life_yrs: 15 },
    rating: "Buy", score: 7.5
  },
  // ── SILVER ──
  {
    ticker: "PAAS", name: "Pan American Silver", exchange: "NYSE",
    country: "Canada/Mexico/Peru/Bolivia/Argentina/Brazil", region: "Americas",
    category: "silver", tags: ["silver","gold","copper","zinc"],
    description: "World's largest primary silver producer. 10 operations across Latin America. Also significant gold producer.",
    market_cap_b: 10, ev_ebitda: 8.7, div_yield: 1.7, pe_ratio: 16,
    metals: {
      silver: { production_koz: 21000, aisc_per_oz: 15.50, pct_revenue: 0.40 },
      gold: { production_koz: 900, aisc_per_oz: 1050, pct_revenue: 0.48 },
      copper: { production_mlbs: 40, aisc_per_lb: 1.90, pct_revenue: 0.05 },
      zinc: { production_mlbs: 120, aisc_per_lb: 0.50, pct_revenue: 0.07 }
    },
    financials: {
      revenue_m: 3400, ebitda_m: 1200, net_income_m: 420,
      operating_costs_m: 2200, capex_m: 550,
      cash_m: 600, net_debt_m: 400,
      shares_m: 360, tax_rate: 0.27
    },
    reserves: { silver_moz: 600, gold_moz: 10, mine_life_yrs: 14 },
    rating: "Buy", score: 7.6
  },
  {
    ticker: "AG", name: "First Majestic Silver", exchange: "NYSE",
    country: "Canada/Mexico", region: "Americas",
    category: "silver", tags: ["silver","gold"],
    description: "Pure-play silver producer focused on Mexico. Three operating mines plus Jerritt Canyon gold in Nevada.",
    market_cap_b: 3.2, ev_ebitda: 18.1, div_yield: 0.3, pe_ratio: 28,
    metals: {
      silver: { production_koz: 12000, aisc_per_oz: 18.50, pct_revenue: 0.55 },
      gold: { production_koz: 140, aisc_per_oz: 1250, pct_revenue: 0.45 }
    },
    financials: {
      revenue_m: 780, ebitda_m: 180, net_income_m: 40,
      operating_costs_m: 600, capex_m: 160,
      cash_m: 200, net_debt_m: 50,
      shares_m: 290, tax_rate: 0.30
    },
    reserves: { silver_moz: 120, mine_life_yrs: 10 },
    rating: "Hold", score: 6.5
  },
  // ── DIVERSIFIED / MAJORS ──
  {
    ticker: "BHP", name: "BHP Group", exchange: "NYSE",
    country: "Australia/Chile/US/Canada/Brazil", region: "Global",
    category: "diversified", tags: ["copper","iron ore","coal","nickel","potash"],
    description: "World's largest mining company by market cap. Iron ore and copper are core. Major potash project (Jansen) under development.",
    market_cap_b: 155, ev_ebitda: 5.7, div_yield: 5.2, pe_ratio: 12,
    metals: {
      copper: { production_mlbs: 3700, aisc_per_lb: 1.48, pct_revenue: 0.28 },
      iron_ore: { production_mt: 255, aisc_per_t: 18.5, pct_revenue: 0.48 }
    },
    financials: {
      revenue_m: 55600, ebitda_m: 28000, net_income_m: 13500,
      operating_costs_m: 27600, capex_m: 7800,
      cash_m: 12400, net_debt_m: 4500,
      shares_m: 5060, tax_rate: 0.30
    },
    reserves: { copper_mt_contained: 24.0, mine_life_yrs: 30 },
    rating: "Buy", score: 8.4
  },
  {
    ticker: "RIO", name: "Rio Tinto", exchange: "NYSE",
    country: "Australia/Canada/Mongolia/Guinea/US", region: "Global",
    category: "diversified", tags: ["iron ore","copper","aluminum","lithium"],
    description: "Second-largest miner globally. Iron ore dominates. Growing copper via Oyu Tolgoi (Mongolia) and lithium through Rincon.",
    market_cap_b: 110, ev_ebitda: 4.7, div_yield: 5.8, pe_ratio: 10,
    metals: {
      copper: { production_mlbs: 1450, aisc_per_lb: 1.65, pct_revenue: 0.12 },
      iron_ore: { production_mt: 330, aisc_per_t: 21.0, pct_revenue: 0.58 },
      aluminum: { production_kt: 3200, aisc_per_t: 1950, pct_revenue: 0.22 }
    },
    financials: {
      revenue_m: 54000, ebitda_m: 23500, net_income_m: 11200,
      operating_costs_m: 30500, capex_m: 7200,
      cash_m: 9800, net_debt_m: 1600,
      shares_m: 1620, tax_rate: 0.30
    },
    reserves: { copper_mt_contained: 20.0, mine_life_yrs: 30 },
    rating: "Buy", score: 8.3
  },
  {
    ticker: "VALE", name: "Vale S.A.", exchange: "NYSE",
    country: "Brazil/Canada/Indonesia", region: "Americas/Asia",
    category: "diversified", tags: ["iron ore","nickel","copper"],
    description: "World's largest iron ore producer. Also major nickel producer. Based in Brazil with global operations.",
    market_cap_b: 48, ev_ebitda: 3.6, div_yield: 6.8, pe_ratio: 7,
    metals: {
      iron_ore: { production_mt: 310, aisc_per_t: 22.0, pct_revenue: 0.78 },
      copper: { production_mlbs: 340, aisc_per_lb: 1.70, pct_revenue: 0.08 },
      nickel: { production_kt: 160, aisc_per_t: 14000, pct_revenue: 0.10 }
    },
    financials: {
      revenue_m: 41200, ebitda_m: 16200, net_income_m: 7800,
      operating_costs_m: 25000, capex_m: 5800,
      cash_m: 5400, net_debt_m: 9800,
      shares_m: 4320, tax_rate: 0.34
    },
    reserves: { mine_life_yrs: 25 },
    rating: "Buy", score: 7.9
  },
  // ── LITHIUM ──
  {
    ticker: "ALB", name: "Albemarle Corporation", exchange: "NYSE",
    country: "US/Chile/Australia", region: "Americas/Australia",
    category: "lithium", tags: ["lithium","bromine"],
    description: "World's largest lithium producer. Operates brine in Chile (SQM JV region) and hard-rock in Australia (Greenbushes/Wodgina).",
    market_cap_b: 12, ev_ebitda: 10.1, div_yield: 1.8, pe_ratio: 18,
    metals: {
      lithium: { production_kt_lce: 200, aisc_per_t: 8500, pct_revenue: 0.70 }
    },
    financials: {
      revenue_m: 5400, ebitda_m: 1500, net_income_m: 450,
      operating_costs_m: 3900, capex_m: 1800,
      cash_m: 1600, net_debt_m: 3200,
      shares_m: 117, tax_rate: 0.22
    },
    reserves: { mine_life_yrs: 30 },
    rating: "Hold", score: 6.8
  },
  {
    ticker: "LAC", name: "Lithium Americas", exchange: "NYSE",
    country: "US/Argentina", region: "Americas",
    category: "lithium", tags: ["lithium"],
    description: "Developer of Thacker Pass in Nevada — the largest known lithium deposit in North America. GM strategic investment.",
    market_cap_b: 3.5, ev_ebitda: null, div_yield: 0, pe_ratio: null,
    metals: {
      lithium: { production_kt_lce: 0, aisc_per_t: null, pct_revenue: 1.0 }
    },
    financials: {
      revenue_m: 0, ebitda_m: -120, net_income_m: -150,
      operating_costs_m: 120, capex_m: 800,
      cash_m: 400, net_debt_m: 200,
      shares_m: 210, tax_rate: 0.21
    },
    reserves: { mine_life_yrs: 40 },
    rating: "Speculative Buy", score: 6.2
  }
];

var METAL_DEFAULTS = {
  copper:     { unit: "$/lb",  current: 4.80,  label: "Copper" },
  gold:       { unit: "$/oz",  current: 3200,  label: "Gold" },
  silver:     { unit: "$/oz",  current: 38.00, label: "Silver" },
  zinc:       { unit: "$/lb",  current: 1.20,  label: "Zinc" },
  molybdenum: { unit: "$/lb",  current: 22.00, label: "Molybdenum" },
  iron_ore:   { unit: "$/t",   current: 110,   label: "Iron Ore" },
  aluminum:   { unit: "$/t",   current: 2400,  label: "Aluminum" },
  nickel:     { unit: "$/t",   current: 16000, label: "Nickel" },
  lithium:    { unit: "$/t LCE", current: 14000, label: "Lithium" }
};

var NEWS_FALLBACK = [
  { title: "Copper hits $4.80/lb as electrification demand surges", source: "Reuters", date: "2026-04-03", category: "copper", url: "#" },
  { title: "Gold holds near $3,200 on central bank buying momentum", source: "Bloomberg", date: "2026-04-03", category: "gold", url: "#" },
  { title: "Freeport-McMoRan reports record Q1 copper output at Grasberg", source: "Mining.com", date: "2026-04-02", category: "copper", url: "#" },
  { title: "Newmont completes portfolio optimization with $2B in asset sales", source: "Financial Times", date: "2026-04-02", category: "gold", url: "#" },
  { title: "BHP lifts dividend after strong iron ore and copper earnings", source: "WSJ", date: "2026-04-01", category: "diversified", url: "#" },
  { title: "Silver breaks $38 on solar panel demand and monetary hedging", source: "Kitco", date: "2026-04-01", category: "silver", url: "#" },
  { title: "Lithium prices stabilize after 18-month correction — Albemarle CEO", source: "CNBC", date: "2026-03-31", category: "lithium", url: "#" },
  { title: "Barrick Gold advances Reko Diq copper-gold project in Pakistan", source: "Mining Weekly", date: "2026-03-31", category: "gold", url: "#" },
  { title: "Teck Resources QB2 copper mine reaches nameplate capacity in Chile", source: "Reuters", date: "2026-03-30", category: "copper", url: "#" },
  { title: "Rio Tinto's Oyu Tolgoi underground output beats expectations", source: "Financial Review", date: "2026-03-30", category: "diversified", url: "#" },
  { title: "Southern Copper Peru expansion receives environmental approval", source: "BNAmericas", date: "2026-03-29", category: "copper", url: "#" },
  { title: "Pan American Silver reports strong Q4 with rising grades at La Colorada", source: "Mining.com", date: "2026-03-29", category: "silver", url: "#" }
];
