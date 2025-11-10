import { runSqlAsync } from './db';
import uuid from 'react-native-uuid';

export async function saveRoute(route) {
  const id = route.id || uuid.v4();
  await runSqlAsync(
    `INSERT OR REPLACE INTO routes (id,name,sourcePlaceId,destPlaceId,polyline,distance,estimatedTime,lastUpdated,isLocalOnly)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, route.name, route.sourcePlaceId, route.destPlaceId, JSON.stringify(route.polyline), route.distance || 0, route.estimatedTime || 0, Date.now(), route.isLocalOnly ? 1 : 0]
  );
  return id;
}

export async function getRouteById(id) {
  const res = await runSqlAsync(`SELECT * FROM routes WHERE id = ?`, [id]);
  if (res.rows.length === 0) return null;
  const r = res.rows.item(0);
  return { ...r, polyline: JSON.parse(r.polyline) };
}
