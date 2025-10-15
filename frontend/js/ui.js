import { map, dayTiles, nightTiles } from "./map.js";
import { resetMarkers } from "./routes.js";
import { db, collection, addDoc } from "../../backend/firebase.js";

// Night Mode
document.getElementById("nightModeBtn").addEventListener("click",()=>{
  if(map.hasLayer(dayTiles)) map.removeLayer(dayTiles);
  if(!map.hasLayer(nightTiles)) map.addLayer(nightTiles);
});

// Locate Me
document.getElementById("locateBtn").addEventListener("click",()=>{map.locate({setView:true,maxZoom:16});});
map.on('locationfound', e=>L.marker(e.latlng).addTo(map).bindPopup("You are here!").openPopup());
map.on('locationerror',()=>alert("Location denied"));

// Clear
document.getElementById("clearBtn").addEventListener("click",resetMarkers);

// SOS
document.getElementById("sosButton").addEventListener("click",async()=>{
  try{
    await addDoc(collection(db,"reports"),{location:"User SOS",dangerLevel:"UNSAFE",timestamp:new Date()});
    const toast=document.createElement("div");
    toast.className="sos-toast"; toast.innerText="SOS Sent!";
    document.body.appendChild(toast);
    setTimeout(()=>toast.remove(),2200);
  }catch(err){console.error(err); alert("SOS failed");}
});

// Apply filters
document.getElementById("applyFilters").addEventListener("click",()=>{
  const checkboxes=document.querySelectorAll(".cat-filter");
  const activeCats=[...checkboxes].filter(c=>c.checked).map(c=>c.value);
  import("./map.js").then(m=>{
    m.spotMarkers.forEach(sm=>{
      if(activeCats.includes(sm.spot.category)) sm.marker.addTo(map);
      else map.removeLayer(sm.marker);
    });
  });
});