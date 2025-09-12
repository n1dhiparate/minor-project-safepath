// Example UI popup marker
L.marker([19.05, 72.88]).addTo(map)
  .bindPopup("UI test popup!");
// ui.js

// Define tile layers
let dayTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
let nightTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
});

// Start with Day Mode
map.addLayer(dayTiles);

// Night Mode button
document.getElementById("nightModeBtn").addEventListener("click", () => {
    if (map.hasLayer(dayTiles)) {
        map.removeLayer(dayTiles);
    }
    if (!map.hasLayer(nightTiles)) {
        map.addLayer(nightTiles);
    }
});


// Locate Me button
document.getElementById("locateBtn").addEventListener("click", () => {
    map.locate({ setView: true, maxZoom: 16 });
});
map.on('locationfound', (e) => {
    L.marker(e.latlng).addTo(map)
        .bindPopup("You are here!").openPopup();
}
);
map.on('locationerror', (e) => {
    alert("Location access denied.");
});