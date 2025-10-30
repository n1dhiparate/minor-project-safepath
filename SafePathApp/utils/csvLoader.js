import * as FileSystem from "expo-file-system";
import * as Papa from "papaparse";

export const loadCSV = async (relativePath) => {
  try {
    const fileUri = FileSystem.documentDirectory + relativePath;
    const csv = await FileSystem.readAsStringAsync(fileUri);
    return Papa.parse(csv, { header: true }).data;
  } catch (error) {
    console.error("Error loading CSV:", error);
    throw error;
  }
};
