import { getDBConnection } from "./db";

export async function savePlace(place) {
  const db = await getDBConnection();
  await db.runAsync(
    "INSERT INTO safe_places (name, type, lat, lng, address) VALUES (?, ?, ?, ?, ?)",
    [place.name, place.type, place.lat, place.lng, place.address]
  );
}

export async function getPlaces() {
  const db = await getDBConnection();
  const results = await db.getAllAsync("SELECT * FROM safe_places");
  return results;
}
