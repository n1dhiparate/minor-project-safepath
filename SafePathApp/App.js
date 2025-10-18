import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function App() {
  const [nightMode, setNightMode] = useState(false);
  const [filters, setFilters] = useState({
    bus: true,
    police: true,
    hospital: true,
    school: true,
    college: true,
    market: true,
    restaurant: true,
    temple: true,
  });

  const toggleFilter = (key) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  return (
    <View style={[styles.container, nightMode && { backgroundColor: "#222" }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.heading, nightMode && { color: "#fff" }]}>SafePath – Safety-Based Navigation</Text>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 19.0823,
          longitude: 72.8407,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        mapType={nightMode ? "mutedStandard" : "standard"}
      >
        <Marker coordinate={{ latitude: 19.0823, longitude: 72.8407 }} title="SafePath Location" />
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={() => setNightMode(!nightMode)}>
          <Text style={styles.controlBtnText}>🌙 Night Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "#0984e3" }]}>
          <Text style={styles.controlBtnText}>📍 Locate Me</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "#00b894" }]}>
          <Text style={styles.controlBtnText}>🛣️ Get Route</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "#d63031" }]}>
          <Text style={styles.controlBtnText}>❌ Clear Map</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "#ff3b30" }]}>
          <Text style={styles.controlBtnText}>🚨 SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      <View style={styles.filters}>
        <Text style={styles.filtersHeading}>Filters</Text>
        <ScrollView>
          {Object.keys(filters).map((key) => (
            <View key={key} style={styles.filterRow}>
              <Text style={[styles.filterText, nightMode && { color: "#fff" }]}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Switch
                value={filters[key]}
                onValueChange={() => toggleFilter(key)}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={filters[key] ? "#0984e3" : "#f4f3f4"}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  header: { alignItems: "center", paddingTop: 40, paddingBottom: 10 },
  heading: { fontSize: 20, fontWeight: "700", color: "#223" },
  map: { flex: 1, marginHorizontal: 10, borderRadius: 10 },
  controls: {
    position: "absolute",
    right: 20,
    top: 100,
    width: 140,
    zIndex: 1000,
  },
  controlBtn: {
    backgroundColor: "#0984e3",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  controlBtnText: { color: "#fff", fontWeight: "600" },
  filters: {
    position: "absolute",
    left: 20,
    bottom: 20,
    zIndex: 1000,
    backgroundColor: "rgba(255,255,255,0.98)",
    padding: 14,
    borderRadius: 12,
    width: 260,
    maxHeight: 300,
  },
  filtersHeading: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#0b7bdc" },
  filterRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, alignItems: "center" },
  filterText: { fontSize: 14, color: "#222" },
});
