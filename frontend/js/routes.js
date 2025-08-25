// Load GeoJSON routes (if you want to use your data/routes.geojson)
fetch("data/routes.geojson")
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: { color: "blue", weight: 3 }
    }).addTo(map)
    .bindPopup("Route Data");
  })
  .catch(err => console.error("Error loading routes:", err));

// Example route test marker
L.marker([19.1, 72.85]).addTo(map)
  .bindPopup("Route point popup!");
