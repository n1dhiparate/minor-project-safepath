import { map, spots } from "./map.js";

// Ensure Leaflet is available
// If using a module system, import Leaflet as below, otherwise make sure L is globally available
// import L from 'leaflet';

let startMarker=null, destMarker=null, routeLine=null;

map.on('click', e=>{
  if(!startMarker) startMarker=L.marker(e.latlng,{draggable:true}).addTo(map).bindPopup("Start").openPopup();
  else if(!destMarker) destMarker=L.marker(e.latlng,{draggable:true}).addTo(map).bindPopup("Destination").openPopup();
  drawRoute();
});

export function drawRoute(){
  if(routeLine) map.removeLayer(routeLine);
  if(startMarker && destMarker){
    routeLine=L.polyline([startMarker.getLatLng(),destMarker.getLatLng()],{color:"blue",weight:4,opacity:0.7}).addTo(map);
    
    // Route safety calculation
    let score="Safe";
    const unsafe=spots.filter(s=>s.safetyStatus==="unsafe");
    const caution=spots.filter(s=>s.safetyStatus==="caution");
    routeLine.getLatLngs().forEach(p=>{
      unsafe.forEach(s=>{if(map.distance(p,[s.lat,s.lng])<50) score="Unsafe";});
      caution.forEach(s=>{if(map.distance(p,[s.lat,s.lng])<50 && score!=="Unsafe") score="Caution";});
    });
    const routeInfoElem = document.getElementById("routeInfo");
    if(routeInfoElem) routeInfoElem.innerText=`Route Safety: ${score}`;
  }
}

export function resetMarkers(){
  if(startMarker) map.removeLayer(startMarker);
  if(destMarker) map.removeLayer(destMarker);
  if(routeLine) map.removeLayer(routeLine);
  startMarker=destMarker=routeLine=null;
  const routeInfoElem = document.getElementById("routeInfo");
  if(routeInfoElem) routeInfoElem.innerText="No route calculated.";
}
const clearBtnElem = document.getElementById("clearBtn");
if(clearBtnElem) clearBtnElem.addEventListener("click", resetMarkers);