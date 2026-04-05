/*
 * mine-coordinates.js — Approximate lat/lng for mines in MINES_DATA.
 * Keyed by mine name (must match mines-data.js exactly).
 * Sources: public mine location data, company reports.
 */
var MINE_COORDS = {
  // ── FCX ──
  "Grasberg":                [-4.053, 137.116],
  "Cerro Verde":             [-16.541, -71.601],
  "El Abra":                 [-21.920, -68.834],
  "Morenci":                 [33.080, -109.355],
  "Bagdad":                  [34.588, -113.210],
  "Safford / Lone Star":     [32.834, -109.682],
  "Sierrita":                [31.870, -111.095],
  "Chino":                   [32.800, -108.075],
  "Tyrone":                  [32.640, -108.370],
  "Miami":                   [33.398, -110.870],
  "Atlantic Copper":         [37.253, -6.940],

  // ── GOLD (Barrick) ──
  "Carlin Complex":          [40.872, -116.333],
  "Cortez Complex":          [40.190, -116.600],
  "Turquoise Ridge":         [41.233, -117.225],
  "Phoenix (NGM)":           [40.840, -117.150],
  "Pueblo Viejo":            [19.000, -70.167],
  "Loulo-Gounkoto":          [13.820, -11.580],
  "Kibali":                  [3.283, 30.233],
  "North Mara":              [-1.483, 34.600],
  "Bulyanhulu":              [-3.370, 31.940],
  "Tongon":                  [9.700, -5.680],
  "Veladero":                [-29.350, -69.280],
  "Porgera":                 [-5.467, 143.117],
  "Lumwana":                 [-12.283, 25.867],
  "Reko Diq":                [29.033, 62.067],

  // ── NEM (Newmont) ──
  "Boddington":              [-32.750, 116.383],
  "Tanami":                  [-20.033, 129.783],
  "Cadia":                   [-33.467, 149.000],
  "Lihir":                   [-3.117, 152.617],
  "Ahafo":                   [7.083, -2.367],
  "Akyem":                   [6.200, -0.750],
  "PeÃ±asquito":             [24.517, -102.033],
  "Merian":                  [4.650, -54.550],
  "Cerro Negro":             [-46.517, -70.000],
  "Yanacocha":               [-6.967, -78.500],
  "Brucejack":               [56.467, -130.200],
  "Red Chris":               [57.683, -129.767],

  // ── SCCO (Southern Copper) ──
  "Buenavista":              [30.967, -109.900],
  "La Caridad":              [30.367, -109.067],
  "IMMSA underground mines": [22.500, -102.000],
  "Toquepala":               [-17.250, -70.600],
  "Cuajone":                 [-17.050, -70.700],
  "TÃ­a MarÃ­a":             [-17.020, -71.850],
  "Los Chancas":             [-14.250, -73.100],

  // ── TECK ──
  "Highland Valley Copper":  [50.500, -121.050],
  "Antamina":                [-9.550, -77.067],
  "Quebrada Blanca Phase 2 (QB2)": [-20.983, -68.783],
  "Carmen de Andacollo":     [-30.267, -71.083],
  "Red Dog":                 [68.067, -162.867],

  // ── HBM ──
  "Constancia + Pampacancha":  [-14.533, -71.750],
  "Constancia / Pampacancha":  [-14.533, -71.750],
  "Lalor / New Britannia":     [55.067, -96.800],
  "Stall":                     [54.633, -100.600],
  "Copper Mountain":           [49.333, -120.533],
  "Copper World":              [31.750, -110.750],

  // ── AEM (Agnico Eagle) ──
  "Canadian Malartic / Odyssey": [48.117, -78.117],
  "Detour Lake":                 [50.067, -79.717],
  "Macassa":                     [48.267, -80.033],
  "LaRonde Complex":             [48.233, -78.233],
  "Goldex":                      [48.200, -78.050],
  "Meadowbank / Amaruq":        [65.017, -96.067],
  "Meliadine":                   [63.017, -92.217],
  "Fosterville":                 [-36.700, 144.700],
  "Pinos Altos":                 [27.900, -108.200],
  "Kittila":                     [67.917, 25.400],

  // ── KGC (Kinross) ──
  "Fort Knox / Manh Choh":  [64.883, -147.633],
  "Round Mountain":          [38.717, -117.083],
  "Bald Mountain":           [40.633, -115.517],
  "Paracatu":                [-17.217, -46.883],
  "La Coipa":                [-27.200, -69.250],
  "Tasiast":                 [20.500, -15.500],
  "Great Bear":              [49.800, -82.600],

  // ── BTG (B2Gold) ──
  "Fekola":                  [13.267, -11.333],
  "Masbate":                 [12.367, 123.617],
  "Otjikoto":                [-19.850, 16.983],
  "Goose / Back River":      [65.300, -106.100],
  "Gramalote":               [6.917, -75.267],

  // ── GFI (Gold Fields) ──
  "St Ives":                 [-31.233, 121.633],
  "Granny Smith":            [-28.983, 122.150],
  "Agnew":                   [-27.600, 120.700],
  "South Deep":              [-26.417, 27.683],
  "Tarkwa":                  [5.367, -1.983],
  "Damang":                  [5.517, -1.867],
  "Cerro Corona":            [-6.750, -78.567],
  "Salares Norte":           [-26.283, -69.217],

  // ── AU (AngloGold Ashanti) ──
  "Obuasi":                  [6.183, -1.667],
  "Iduapriem":               [5.283, -1.983],
  "Siguiri":                 [11.417, -9.183],
  "Geita":                   [-2.867, 32.200],
  "Sunrise Dam":             [-29.133, 122.550],
  "Tropicana":               [-29.217, 124.567],
  "Serra Grande":            [-14.367, -49.317],
  "CuiabÃ¡ / Lamego":        [-19.917, -43.917],

  // ── PAAS (Pan American Silver) ──
  "La Colorada":             [24.400, -105.950],
  "Huaron":                  [-11.067, -76.433],
  "San Vicente":             [-13.467, -69.283],
  "Cerro Moro":              [-47.517, -67.250],
  "Jacobina":                [-11.167, -40.500],
  "El PeÃ±Ã³n":              [-23.350, -69.267],
  "Shahuindo":               [-7.533, -78.200],
  "Timmins":                 [48.483, -81.333],
  "Minera Florida":          [-33.867, -71.483],
  "Dolores":                 [26.733, -108.600],

  // ── AG (First Majestic Silver) ──
  "San Dimas":               [24.050, -105.617],
  "Santa Elena":             [28.433, -108.900],
  "La Encantada":            [27.200, -102.867],
  "Jerritt Canyon":          [41.200, -115.683],

  // ── BHP ──
  "Escondida":               [-24.267, -69.067],
  "Spence":                  [-22.867, -69.267],
  "Olympic Dam":             [-30.433, 136.883],
  "WAIO (Pilbara iron ore)": [-22.700, 118.300],
  "BMA metallurgical coal":  [-22.100, 148.100],
  "Jansen potash":           [51.917, -104.500],

  // ── RIO ──
  "Pilbara iron ore":                 [-22.300, 118.700],
  "Kennecott":                        [40.650, -112.133],
  "Oyu Tolgoi":                       [43.017, 106.850],
  "Resolution Copper":                [33.283, -111.100],
  "Rincon lithium":                   [-23.750, -66.833],
  "IOC (Iron Ore Company of Canada)": [52.950, -66.917],
  "Weipa / Gove bauxite":             [-12.650, 141.900],
  "Kitimat aluminum smelter":         [54.050, -128.667],
  "Diavik diamond mine":              [64.500, -110.283],

  // ── VALE ──
  "CarajÃ¡s / Northern System":  [-6.067, -50.200],
  "Southeastern System":         [-20.167, -43.467],
  "Southern System":             [-20.067, -44.050],
  "Salobo":                      [-5.800, -50.533],
  "Voisey's Bay":                [56.333, -62.050],
  "Sudbury":                     [46.483, -81.000],
  "OnÃ§a Puma":                  [-6.550, -51.067],
  "PT Vale Indonesia":           [-2.517, 121.467],

  // ── ALB (Albemarle) ──
  "Salar de Atacama":        [-23.500, -68.250],
  "Greenbushes":             [-33.850, 116.067],
  "Wodgina":                 [-20.983, 118.683],
  "Kemerton":                [-33.133, 115.833],
  "Silver Peak":             [37.750, -117.633],
  "Kings Mountain":          [35.250, -81.350],

  // ── BVN (Buenaventura) ──
  "El Brocal (Colquijirca)": [-10.733, -76.300],
  "Orcopampa":               [-15.267, -72.333],
  "Tambomayo":               [-15.100, -72.067],
  "Yumpag":                  [-10.617, -76.517],
  "Uchucchacua":             [-10.650, -76.767],
  "Julcani":                 [-12.900, -75.017],
  "La Zanja":                [-6.833, -78.717],
  "San Gabriel":             [-16.500, -70.483],
  "Coimolache":              [-6.750, -78.650],
  "Cerro Verde (equity)":    [-16.541, -71.601],

  // ── LAC ──
  "Thacker Pass":            [41.667, -117.317]
};
