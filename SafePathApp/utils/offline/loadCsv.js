import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePlace } from './places';

/**
 * Loads CSV data of safe hubs (police, hospitals, shelters) from assets.
 * - Copies to FileSystem
 * - Parses CSV
 * - Saves into SQLite/AsyncStorage via savePlace()
 * - Only runs once (cached via AsyncStorage)
 */
export async function loadCsvDataOnce() {
  try {
    console.log('📂 Starting CSV load...');

    // ✅ Step 1: Check if already loaded
    const alreadyLoaded = await AsyncStorage.getItem('csvLoaded');
    if (alreadyLoaded) {
      console.log('✅ CSV data already loaded earlier, skipping import');
      return;
    }

    // ✅ Step 2: Prepare asset and target file URIs
    const assetUri = require('../../assets/data/combined_safety_data.csv');
    const fileUri = FileSystem.cacheDirectory + 'combined_safety_data.csv';
    console.log('✅ Asset URI:', assetUri);
    console.log('✅ Target cache path:', fileUri);

    // ✅ Step 3: Copy or download CSV file to cache
    await FileSystem.downloadAsync(assetUri, fileUri);
    console.log('📦 CSV file copied to cache');

    // ✅ Step 4: Read and parse CSV
    const file = await FileSystem.readAsStringAsync(fileUri);
    const parsed = Papa.parse(file, { header: true }).data;
    console.log('📊 Parsed rows count:', parsed.length);

    // ✅ Step 5: Loop through rows and save each place
    let count = 0;
    for (const row of parsed) {
      if (row.lat && row.lng) {
        await savePlace({
          name: row.name || 'Unknown Place',
          type: row.type || 'general',
          lat: parseFloat(row.lat),
          lng: parseFloat(row.lng),
          address: row.address || '',
        });
        count++;
        console.log(`💾 Saved: ${row.name || 'Unnamed'} (${row.type})`);
      }
    }

    // ✅ Step 6: Mark as loaded to avoid re-import
    await AsyncStorage.setItem('csvLoaded', 'true');
    console.log(`✅ Imported ${count} safe places from CSV successfully!`);
  } catch (err) {
    console.error('❌ Error loading CSV:', err);
  }
}
