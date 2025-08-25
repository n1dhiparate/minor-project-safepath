// Create map
var map = L.map('map').setView([19.0760, 72.8777], 10);

// Add tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Zoom controls
L.control.zoom({ position: 'topright' }).addTo(map);

// Popup test
L.marker([19.0760, 72.8777]).addTo(map)
  .bindPopup("Hello, this is a test popup!")
  .openPopup();
