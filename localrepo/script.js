// Create map centered on Mumbai
var map = L.map('map').setView([19.0760, 72.8777], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Example Marker
L.marker([19.0760, 72.8777]).addTo(map)
  .bindPopup("SafePath starting point<br>Mumbai")
  .openPopup();
