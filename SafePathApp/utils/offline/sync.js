import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { runSqlAsync } from './db';

const SERVER_BASE = 'https://your-server.com/api'; // change later

export function startSyncService() {
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      syncWithServer().catch(err => console.warn('Sync failed', err));
    }
  });
}

export async function syncWithServer() {
  const lastSync = Number(await AsyncStorage.getItem('lastSync') || 0);
  const res = await fetch(`${SERVER_BASE}/updates?since=${lastSync}`);
  const data = await res.json();

  const { places = [], routes = [], serverTime } = data;
  for (const p of places) {
    await runSqlAsync(
      `INSERT OR REPLACE INTO places (id,name,type,lat,lng,address,phone,metadata,lastUpdated)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [p.id, p.name, p.type, p.lat, p.lng, p.address, p.phone, JSON.stringify(p.metadata || {}), p.lastUpdated]
    );
  }

  for (const r of routes) {
    await runSqlAsync(
      `INSERT OR REPLACE INTO routes (id,name,sourcePlaceId,destPlaceId,polyline,distance,estimatedTime,lastUpdated,isLocalOnly)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [r.id, r.name, r.sourcePlaceId, r.destPlaceId, JSON.stringify(r.polyline), r.distance, r.estimatedTime, r.lastUpdated, 0]
    );
  }

  await AsyncStorage.setItem('lastSync', String(serverTime || Date.now()));
}
