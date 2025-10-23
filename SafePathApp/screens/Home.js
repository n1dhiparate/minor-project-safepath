import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function Home() {
  const [nightMode, setNightMode] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);
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

  const mapRef = useRef(null);

  const toggleFilter = (key) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  const showSosToast = () => {
    setSosVisible(true);
    setTimeout(() => setSosVisible(false), 2000);
  };

  const locateMe = () => {
    mapRef.current.animateToRegion({
      latitude: 19.076,
      longitude: 72.8777,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SafePath – Safety-Based Navigation</Text>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={nightMode ? nightMapStyle : []}
        initialRegion={{
          latitude: 19.076,
          longitude: 72.8777,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* Example markers */}
        {filters.bus && <Marker coordinate={{ latitude: 19.08, longitude: 72.88 }} title="Bus Stop" pinColor="#9bb8ad" />}
        {filters.police && <Marker coordinate={{ latitude: 19.07, longitude: 72.87 }} title="Police Station" pinColor="#f7dad9" />}
      </MapView>

      {/* Floating Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "#9bb8ad" }]} onPress={() => setNightMode(!nightMode)}>
          <Text style={styles.controlText}>🌙 Night Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "#c9e4c5" }]} onPress={locateMe}>
          <Text style={styles.controlText}>📍 Locate Me</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "#f7dad9" }]} onPress={() => alert("Route calculation here")}>
          <Text style={[styles.controlText, { color: "#444444" }]}>🛣️ Get Route</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "#fff9f0" }]} onPress={() => alert("Clear map")}>
          <Text style={[styles.controlText, { color: "#444444" }]}>❌ Clear Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "#f7dad9" }]} onPress={showSosToast}>
          <Text style={[styles.controlText, { color: "#444444" }]}>🚨 SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      <View style={[styles.infoPanel, { backgroundColor: "#fff9f0" }]}>
        <Text style={[styles.panelHeader, { color: "#444444" }]}>Filters</Text>
        <ScrollView>
          {Object.keys(filters).map((key) => (
            <View key={key} style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
              <Switch
                trackColor={{ false: "#f7dad9", true: "#9bb8ad" }}
                thumbColor={filters[key] ? "#c9e4c5" : "#fff"}
                value={filters[key]}
                onValueChange={() => toggleFilter(key)}
              />
              <Text style={{ marginLeft: 8, color: "#444444" }}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* SOS Toast */}
      {sosVisible && (
        <View style={[styles.sosToast, { backgroundColor: "#f7dad9" }]}>
          <Text style={{ color: "#444444" }}>🚨 SOS Activated!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff9f0" },
  header: { textAlign: "center", paddingTop: 14, paddingBottom: 8, fontWeight: "700", fontSize: 18, color: "#444444" },
  map: { flex: 1 },
  controls: {
    position: "absolute",
    right: 22,
    top: 90,
    zIndex: 1200,
    flexDirection: "column",
    gap: 10,
  },
  controlBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: "center",
  },
  controlText: { color: "#444444", fontWeight: "600" },
  infoPanel: {
    position: "absolute",
    left: 20,
    bottom: 20,
    zIndex: 1100,
    padding: 14,
    borderRadius: 12,
    width: 260,
  },
  panelHeader: { fontWeight: "700", marginBottom: 8 },
  sosToast: {
    position: "absolute",
    right: 20,
    top: 50,
    zIndex: 1400,
    padding: 10,
    borderRadius: 8,
    fontWeight: "700",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
});

// Example Night Map Style (like Google Maps)
const nightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
];
