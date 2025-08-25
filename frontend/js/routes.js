// Create map centered on Santacruz
var map = L.map('map').setView([19.0823, 72.8407], 14);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 50+ Safe & Unsafe Spots in Santacruz
var spots = [
  // 🚉 Stations & Bus Depots
  { name:"Santacruz Railway Station", lat:19.0817, lng:72.8410, category:"station", safetyStatus:"caution" },
  { name:"Santacruz Bus Depot", lat:19.0822, lng:72.8490, category:"bus", safetyStatus:"safe" },
  { name:"Vakola BEST Bus Stop", lat:19.0895, lng:72.8512, category:"bus", safetyStatus:"safe" },
{ name:"Hasnabad Bus Stop", lat:19.0832, lng:72.8355, category:"bus", safetyStatus:"safe" },
{ name: "Bus Stop 1", lat: 19.092106453242643, lng: 72.82807971731967, category:"bus", safetyStatus: "safe" },
{ name: "Bus Stop 2", lat: 19.09000914625635, lng: 72.82773688740409, category:"bus", safetyStatus: "safe" },
{ name: "Bus Stop 3", lat: 19.08838925682091, lng: 72.82721362069083, category:"bus", safetyStatus: "safe" },
{ name: "Bus Stop 4", lat: 19.08645234425011, lng: 72.828050179592, category:"bus", safetyStatus: "safe" },
{ name: "Bus Stop 5", lat: 19.08562094157304, lng: 72.82946638596779, category:"bus", safetyStatus: "safe" },
{ name: "Bus Stop 6", lat: 19.085418159799065, lng: 72.83081821932652, category:"bus", safetyStatus: "safe" },
{ name: "Bus Stop 7", lat: 19.084676450132747, lng: 72.83265285031331, category:"bus", safetyStatus: "safe" },
{ name: "Bus Stop 8", lat: 19.084340646375953, lng: 72.83542437184953, category:"bus", safetyStatus: "safe" },
{ name: "Bus Stop 9", lat: 19.08414994104227, lng: 72.83722011244473, category:"bus", safetyStatus: "safe" },
{ name: "Bus Stop 10", lat: 19.08351901629522, lng: 72.8380681653938, category:"bus", safetyStatus: "safe" },
{ name: "Bus Stop 11", lat: 19.082956297601097, lng: 72.83442334208075, category:"bus", safetyStatus: "safe" },
{ name: "Bus Stop 12", lat: 19.081979724366974, lng: 72.83802235694947, category:"bus", safetyStatus: "safe" },
{ name: "Bus Stop 13", lat: 19.08187833128177, lng: 72.83804381462183, category:"bus", safetyStatus: "unsafe" },
{ name: "Bus Stop 14", lat: 19.080316869931856, lng: 72.83776486488114, category:"bus", safetyStatus: "unsafe" },
{ name: "Bus Stop 15", lat: 19.08102662691571, lng: 72.83858025643084, category:"bus", safetyStatus: "unsafe" },
{ name: "Bus Stop 16", lat: 19.082101395987273, lng: 72.84130538082061, category:"bus", safetyStatus: "unsafe" },
{ name: "Bus Stop 17", lat: 19.081351086238243, lng: 72.8425070104728, category:"bus", safetyStatus: "unsafe" },
{ name: "Bus Stop 18", lat: 19.085041766379224, lng: 72.83806527228357, category:"bus", safetyStatus: "unsafe" },
{ name: "Bus Stop 19", lat: 19.086968187584656, lng: 72.83817256064536, category:"bus", safetyStatus: "unsafe" },
{ name: "Bus Stop 20", lat: 19.08715068948404, lng: 72.8346320447059, category:"bus", safetyStatus: "unsafe" },
{ name: "Bus Stop 21", lat: 19.08980708324636, lng: 72.8333231266919, category:"bus", safetyStatus: "unsafe" },
{ name: "Bus Stop 22", lat: 19.08970569495378, lng: 72.83630574315, category:"bus", safetyStatus: "unsafe" },
{ name: "Bus Stop 23", lat: 19.091915945654193, lng: 72.83879483314382, category:"bus", safetyStatus: "unsafe" },
{ name: "Bus Stop 24", lat: 19.079415349953123, lng: 72.83446727495458, safetyStatus: "safe" }, // Marked safe
{ name: "Bus Stop 25", lat: 19.075973866552673, lng: 72.83410312617936, safetyStatus: "unsafe" },  // Marked unsafe
{ name: "Bus Stop 26", lat: 19.090812, lng: 72.841572, safetyStatus: "safe" },
{ name: "Bus Stop 27", lat: 19.088121, lng: 72.845291, safetyStatus: "safe" },
{ name: "Bus Stop 28", lat: 19.086243, lng: 72.843158, safetyStatus: "safe" },
{ name: "Bus Stop 29", lat: 19.084566, lng: 72.838932, safetyStatus: "safe" },
{ name: "Bus Stop 30", lat: 19.082002, lng: 72.841020, safetyStatus: "safe" },
{ name: "Bus Stop 31", lat: 19.078432, lng: 72.832341, safetyStatus: "unsafe" },
{ name: "Bus Stop 32", lat: 19.077103, lng: 72.830224, safetyStatus: "unsafe" },
{ name: "Bus Stop 33", lat: 19.074910, lng: 72.835610, safetyStatus: "unsafe" },
{ name: "Bus Stop 34", lat: 19.073801, lng: 72.833478, safetyStatus: "unsafe" },
{ name: "Bus Stop 35", lat: 19.071652, lng: 72.834140, safetyStatus: "unsafe" },



// 🚔 Police Stations
{ name:"Vakola Police Station", lat:19.0901, lng:72.8550, category:"police", safetyStatus:"safe" },
  { name:"Juhu Police Station", lat:19.1003, lng:72.8279, category:"police", safetyStatus:"safe" },

  // 🏥 Hospitals
  { name:"VN Desai Municipal Hospital", lat:19.0890, lng:72.8575, category:"hospital", safetyStatus:"safe" },
  { name:"Nanavati Hospital", lat:19.0983, lng:72.8402, category:"hospital", safetyStatus:"safe" },
  { name:"Surya Hospital", lat:19.1018, lng:72.8395, category:"hospital", safetyStatus:"safe" },
  { name:"Asha Parekh Hospital", lat:19.0799, lng:72.8420, category:"hospital", safetyStatus:"safe" },
  { name:"Niron Hospital", lat:19.0805, lng:72.8432, category:"hospital", safetyStatus:"safe" },

  // 🏫 Schools & Colleges
  { name:"Podar International School", lat:19.0808, lng:72.8425, category:"school", safetyStatus:"safe" },
  { name:"St Teresa’s Convent High School", lat:19.0852, lng:72.8390, category:"school", safetyStatus:"safe" },
  { name:"Lilavatibai Podar High School", lat:19.0812, lng:72.8420, category:"school", safetyStatus:"safe" },
  { name:"SNDT Women’s University", lat:19.1071, lng:72.8365, category:"college", safetyStatus:"safe" },
  { name:"Mumbai University (Kalina Campus)", lat:19.0726, lng:72.8590, category:"college", safetyStatus:"safe" },
  { name:"Rizvi College", lat:19.0880, lng:72.8378, category:"college", safetyStatus:"safe" },
  { name:"L S Raheja School of Art", lat:19.0859, lng:72.8368, category:"college", safetyStatus:"safe" },
  { name:"SVKM’s NMIMS University (Vile Parle)", lat:19.1032, lng:72.8366, category:"college", safetyStatus:"safe" },

  // 🏘️ Colonies / Residential
  { name:"Prabhat Colony", lat:19.0800, lng:72.8450, category:"colony", safetyStatus:"safe" },
  { name:"Saraswat Colony", lat:19.0825, lng:72.8375, category:"colony", safetyStatus:"safe" },
  { name:"Vakola Bridge Area", lat:19.0855, lng:72.8535, category:"colony", safetyStatus:"caution" },
  { name:"Golibar Area", lat:19.0803, lng:72.8521, category:"colony", safetyStatus:"unsafe" },
  { name:"Kalina Village", lat:19.0720, lng:72.8560, category:"colony", safetyStatus:"caution" },
  { name:"Khotwadi Colony", lat:19.0840, lng:72.8430, category:"colony", safetyStatus:"safe" },

  // ☕ Cafés & Restaurants
  { name:"Blue Tokai Coffee", lat:19.0847, lng:72.8419, category:"cafe", safetyStatus:"safe" },
  { name:"Starbucks Juhu", lat:19.1060, lng:72.8270, category:"cafe", safetyStatus:"safe" },
  { name:"McDonald’s Santacruz", lat:19.0831, lng:72.8411, category:"restaurant", safetyStatus:"safe" },
  { name:"Domino’s Pizza Santacruz", lat:19.0819, lng:72.8408, category:"restaurant", safetyStatus:"safe" },
  { name:"Natural Ice Cream", lat:19.0827, lng:72.8395, category:"restaurant", safetyStatus:"safe" },
  { name:"Street Food Corner", lat:19.0795, lng:72.8430, category:"food", safetyStatus:"caution" },

  // 🕌 Temples / Religious
  { name:"Hanuman Mandir Vakola", lat:19.0862, lng:72.8529, category:"temple", safetyStatus:"safe" },
  { name:"ISKCON Juhu", lat:19.1182, lng:72.8296, category:"temple", safetyStatus:"safe" },

  // 🏬 Markets & Malls
  { name:"Santacruz Market", lat:19.0820, lng:72.8428, category:"market", safetyStatus:"caution" },
  { name:"Juhu Market", lat:19.1000, lng:72.8282, category:"market", safetyStatus:"safe" },

  // 🏟️ Others
  { name:"Juhu Beach Entry", lat:19.0989, lng:72.8265, category:"beach", safetyStatus:"caution" },
  { name:"Jogger’s Park", lat:19.0850, lng:72.8290, category:"park", safetyStatus:"safe" },
  { name:"Milan Subway", lat:19.0955, lng:72.8433, category:"subway", safetyStatus:"unsafe" },
  { name:"Western Express Highway Entry", lat:19.0833, lng:72.8500, category:"road", safetyStatus:"caution" },
  { name: "Spot A", lat: 19.084261317900587, lng: 72.82930640899332, category: "other", safetyStatus: "safe" },
  { name: "Spot B", lat: 19.08304952787996, lng: 72.83395699462642, category: "other", safetyStatus: "caution" },
  { name: "Spot C", lat: 19.084783941521604, lng: 72.82749551764235, category: "other", safetyStatus: "unsafe" },
  { name: "Spot D", lat: 19.088072456099816, lng: 72.82806411332662, category: "other", safetyStatus: "safe" },
  { name: "Spot E", lat: 19.088028385023353, lng: 72.82800272479918, category: "other", safetyStatus: "safe" },
  { name: "Spot F", lat: 19.085695793545643, lng: 72.83099580575265, category: "other", safetyStatus: "caution" },
  { name: "Spot G", lat: 19.085373877503976, lng: 72.83158052732396, category: "other", safetyStatus: "unsafe" },
  { name: "Spot H", lat: 19.085825066733307, lng: 72.83214379122343, category: "other", safetyStatus: "safe" },
  { name: "Spot I", lat: 19.084037596196733, lng: 72.82886836909081, category: "other", safetyStatus: "caution" },
  { name: "Spot J", lat: 19.08613582954777, lng: 72.83519510710131, category: "other", safetyStatus: "safe" }


];

// Show each spot on map
spots.forEach(spot => {
  var color = (spot.safetyStatus === "safe") ? "green" : 
              (spot.safetyStatus === "caution") ? "orange" : "red";

  // Circle marker
  L.circle([spot.lat, spot.lng], {
    color: color,
    fillColor: color,
    fillOpacity: 0.4,
    radius: 30
  }).addTo(map).bindPopup(`<b>${spot.name}</b><br>Category: ${spot.category}<br>Status: ${spot.safetyStatus.toUpperCase()}`);
});