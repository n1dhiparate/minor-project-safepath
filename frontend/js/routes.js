import { map, spots } from "./map.js";

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
    document.getElementById("routeInfo").innerText=`Route Safety: ${score}`;
  }
}

export function resetMarkers(){
  if(startMarker) map.removeLayer(startMarker);
  if(destMarker) map.removeLayer(destMarker);
  if(routeLine) map.removeLayer(routeLine);
  startMarker=destMarker=routeLine=null;
  document.getElementById("routeInfo").innerText="No route calculated.";
}
document.getElementById("clearBtn").addEventListener("click", resetMarkers);