import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { GOOGLE_MAPS_API_KEY } from "@env";
import { unsafeSpots } from "../assets/data/unsafeSpots";
import Papa from "papaparse";

const { width } = Dimensions.get("window");

const colors = {
  primary: "#C9E4C5",
  accent: "#F7DAD9",
  background: "#FFF9F0",
  buttons: "#9BB8AD",
  text: "#444444",
  crimeMarker: "#800080",
};

export default function Home() {
  const [location, setLocation] = useState(null);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [heading, setHeading] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [safetyData, setSafetyData] = useState([]);
  const [filterType, setFilterType] = useState("none");
  const [showFilters, setShowFilters] = useState(false);

  // new routing states (added)
  const [destination, setDestination] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  const micAnim = useRef(new Animated.Value(1)).current;
  const drawerAnim = useRef(new Animated.Value(-width * 0.7)).current;

  const csvUrls = [
    {
      url: "https://raw.githubusercontent.com/n1dhiparate/minor-project-safepath/main/combined_safety_data.csv",
      type: "safety",
    },
    {
      url: "https://raw.githubusercontent.com/n1dhiparate/minor-project-safepath/refs/heads/main/crime_santacruz_juhu%20(1).csv",
      type: "crime",
    },
  ];

  // 📍 Get current location
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      } catch (err) {
        console.error("Error getting location:", err);
      }
    })();
  }, []);

  // 🧭 Compass
  useEffect(() => {
    const sub = Magnetometer.addListener((data) => {
      const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      setHeading(angle >= 0 ? angle : angle + 360);
    });
    return () => sub && sub.remove();
  }, []);

  // 📊 Load CSV data
  useEffect(() => {
    const loadSafetyData = async () => {
      try {
        let allData = [];
        for (const csv of csvUrls) {
          const response = await fetch(csv.url);
          const csvString = await response.text();
          const parsed = Papa.parse(csvString, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
          });
          const clean = parsed.data.filter((r) => r.Latitude && r.Longitude);
          const typedData = clean.map((row) => ({ ...row, _type: csv.type }));
          allData = allData.concat(typedData);
        }
        setSafetyData(allData);
      } catch (error) {
        console.error("❌ Error loading CSVs:", error);
      }
    };
    loadSafetyData();
  }, []);

  // 🎤 Mic Animation
  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
      Animated.timing(micAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      setIsListening(true);
      Animated.loop(
        Animated.sequence([
          Animated.timing(micAnim, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(micAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  };

  // 🔍 Search Places
  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            text
          )}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const json = await res.json();
        setPredictions(json.predictions || []);
      } catch (err) {
        console.warn("Autocomplete failed:", err);
        setPredictions([]);
      }
    } else setPredictions([]);
  };

  // -------------------------
  // Safety-based routing
  // -------------------------
  const generateSafeRoute = async (destPlaceId) => {
    try {
      if (!location) {
        console.warn("Current location unknown. Cannot generate route.");
        return;
      }

      // 1) Place details to get destination coords
      const placeRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${destPlaceId}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const placeJson = await placeRes.json();
      const destLoc = placeJson?.result?.geometry?.location;
      if (!destLoc) {
        console.warn("Place details not found for:", destPlaceId);
        return;
      }
      setDestination({ latitude: destLoc.lat, longitude: destLoc.lng });

      // 2) Directions with alternatives
      const dirRes = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${destLoc.lat},${destLoc.lng}&alternatives=true&mode=walking&key=${GOOGLE_MAPS_API_KEY}`
      );
      const dirJson = await dirRes.json();
      if (!dirJson.routes || dirJson.routes.length === 0) {
        console.warn("No routes from Directions API");
        return;
      }

      // 3) Score routes by safety & pick best
      const scored = dirJson.routes.map((route) => {
        const points = decodePolyline(route.overview_polyline?.points || "");
        const penalty = calculateSafetyPenalty(points); // larger = worse
        const distanceMeters = route.legs?.[0]?.distance?.value || 0;
        const durationSec = route.legs?.[0]?.duration?.value || 0;

        const distanceKm = distanceMeters / 1000;
        // Score: prefer shorter routes and lower penalty. Tweak weights if needed.
        const score = -distanceKm - penalty * 0.6 + 1 / Math.max(1, durationSec / 60);
        return { points, score, penalty, distanceKm };
      });

      scored.sort((a, b) => b.score - a.score);
      const best = scored[0];
      if (best) {
        setRouteCoords(best.points);
      } else {
        setRouteCoords([]);
      }
    } catch (err) {
      console.error("Error generating safe route:", err);
    }
  };

  // Penalize route points near unsafe/crime spots
  const calculateSafetyPenalty = (points) => {
    if (!safetyData || safetyData.length === 0 || !points || points.length === 0) return 0;
    let penalty = 0;
    for (const p of points) {
      for (const spot of safetyData) {
        const lat = parseFloat(spot.Latitude);
        const lng = parseFloat(spot.Longitude);
        if (Number.isNaN(lat) || Number.isNaN(lng)) continue;
        const dKm = getDistance(p, { latitude: lat, longitude: lng });
        if (dKm < 0.15) {
          if (spot._type === "crime") {
            penalty += 10;
          } else {
            const score = parseFloat(spot["Safety_Score_0_10"] ?? 5);
            penalty += Math.max(0, 10 - score) * 0.8;
          }
        }
      }
    }
    return penalty / Math.max(1, points.length);
  };

  // Haversine distance (km)
  const getDistance = (a, b) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const val =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return R * 2 * Math.atan2(Math.sqrt(val), Math.sqrt(1 - val));
  };

  // Decode Google polyline
  const decodePolyline = (encoded) => {
    if (!encoded) return [];
    let points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  // 🧾 Drawer Animation
  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };
  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -width * 0.7,
      duration: 250,
      useNativeDriver: false,
    }).start(() => setDrawerOpen(false));
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 🗺 MAP VIEW */}
      <MapView
        style={{ flex: 1 }}
        region={{
          latitude: location?.latitude || 19.076,
          longitude: location?.longitude || 72.8777,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* 🔴 Unsafe Spots */}
        {unsafeSpots
          .filter((spot) => {
            if (filterType === "none") return false;
            if (filterType === "safe") return spot.safetyStatus === "safe";
            if (filterType === "unsafe") return spot.safetyStatus !== "safe";
            return true;
          })
          .map((spot, i) => (
            <Marker
              key={`spot-${i}`}
              coordinate={{ latitude: spot.lat, longitude: spot.lng }}
              title={spot.name}
              description={`${spot.category} • ${spot.safetyStatus}`}
              pinColor={
                spot.safetyStatus === "safe"
                  ? "green"
                  : spot.safetyStatus === "caution"
                  ? "yellow"
                  : "red"
              }
            />
          ))}

        {/* 🟢 / 🟣 CSV markers */}
        {safetyData.map((a, i) => {
          let color = "blue";
          let desc = "";
          if (a._type === "safety") {
            const score = parseFloat(a["Safety_Score_0_10"]);
            color = score >= 7 ? "green" : score >= 4 ? "yellow" : "red";
            desc = `Safety Score: ${score.toFixed ? score.toFixed(1) : score}/10`;
          } else if (a._type === "crime") {
            color = colors.crimeMarker;
            desc = "Crime Data Location";
          }
          return (
            <Marker
              key={`marker-${i}`}
              coordinate={{
                latitude: parseFloat(a.Latitude),
                longitude: parseFloat(a.Longitude),
              }}
              title={a["Area"] || a["Location"] || "Unknown Area"}
              description={desc}
              pinColor={color}
            />
          );
        })}

        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
          />
        )}

        {/* route polyline */}
        {routeCoords && routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeColor="#007AFF" strokeWidth={5} />
        )}

        {/* destination marker */}
        {destination && <Marker coordinate={destination} title="Destination" pinColor="#2E8B57" />}
      </MapView>

      {/* 🔍 Top bar: menu + search + mic */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Feather name="menu" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search location..."
            style={styles.searchInput}
          />
          <TouchableOpacity onPress={toggleMic}>
            <Animated.View style={{ transform: [{ scale: micAnim }] }}>
              <MaterialIcons name="mic" size={22} color={isListening ? "#d32f2f" : "#555"} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Autocomplete predictions list (appears under top bar) */}
      {predictions && predictions.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: 110,
            left: 15,
            right: 15,
            backgroundColor: colors.background,
            borderRadius: 8,
            elevation: 6,
            maxHeight: 250,
            paddingVertical: 6,
            zIndex: 50,
          }}
        >
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setQuery(item.description);
                  setPredictions([]);
                  generateSafeRoute(item.place_id);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: "#eee",
                }}
              >
                <Text>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* 🧭 Compass */}
      <View style={styles.compassContainer}>
        <Animated.View style={{ transform: [{ rotate: `${heading}deg` }] }}>
          <Feather name="navigation" size={24} color={colors.text} />
        </Animated.View>
      </View>

      {/* 🟣 Floating Action Button (Added Here) */}
      <>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.quickNavButton}>
          <Feather name={menuOpen ? "x" : "plus"} size={26} color="#fff" />
        </TouchableOpacity>

        {menuOpen && (
          <>
            <TouchableOpacity style={[styles.smallButton, { right: 90, bottom: 30 }]}>
              <Feather name="map" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallButton, { right: 70, bottom: 85 }]}>
              <Feather name="shield" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallButton, { right: 15, bottom: 95 }]}>
              <Feather name="alert-triangle" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </>

      {/* 🧾 Legend + Filter */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend:</Text>
        {[
          ["green", "Safe (Safety CSV)"],
          ["yellow", "Moderate (Safety CSV)"],
          ["red", "Unsafe (Safety CSV)"],
          [colors.crimeMarker, "Crime Data"],
        ].map(([clr, lbl]) => (
          <View key={lbl} style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: clr }]} />
            <Text>{lbl}</Text>
          </View>
        ))}

        <View style={styles.filterToggleContainer}>
          <TouchableOpacity
            style={styles.mainFilterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.mainFilterButtonText}>🔍 Filter: {filterType.toUpperCase()}</Text>
          </TouchableOpacity>

          {showFilters && (
            <View style={styles.filterOptionsContainer}>
              {[
                { label: "🚫 None", value: "none" },
                { label: "🟢 Safe", value: "safe" },
                { label: "🔴 Unsafe", value: "unsafe" },
                { label: "⚪ Both", value: "both" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.filterButton, filterType === opt.value && styles.filterButtonActive]}
                  onPress={() => {
                    setFilterType(opt.value);
                    setShowFilters(false);
                  }}
                >
                  <Text
                    style={[styles.filterButtonText, filterType === opt.value && styles.filterButtonTextActive]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 👤 Drawer */}
      {drawerOpen && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPressOut={closeDrawer}>
          <Animated.View style={[styles.drawerContainer, { left: drawerAnim }]}>
            <View style={styles.profileHeader}>
              <MaterialIcons name="account-circle" size={60} color="#4a4a4a" />
              <Text style={styles.accName}>Manva Kulkarni</Text>
            </View>

            <View style={styles.optionSection}>
              {[
                ["settings", "Settings"],
                ["bell", "Emergency Options"],
                ["map-pin", "Saved Locations"],
                ["user", "Profile Settings"],
              ].map(([icon, label]) => (
                <TouchableOpacity key={label} style={styles.optionItem}>
                  <Feather name={icon} size={20} color="#333" />
                  <Text style={styles.optionText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.footerSection}>
              <Text style={styles.footerText}>App version 1.0.0</Text>
              <Text style={styles.footerText}>Developed by Team SafePath</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 15,
    gap: 10,
  },
  menuButton: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    elevation: 2,
  },
  searchInput: { flex: 1, paddingVertical: 11 },
  compassContainer: {
    position: "absolute",
    top: 115,
    right: 15,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 40,
    elevation: 8,
  },
  quickNavButton: {
    position: "absolute",
    bottom: 35,
    right: 25,
    backgroundColor: colors.buttons,
    width: 60,
    height: 60,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
  },
  smallButton: {
    position: "absolute",
    backgroundColor: colors.buttons,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  legendContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 10,
    elevation: 8,
  },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 4, gap: 5 },
  legendColor: { width: 15, height: 15, borderRadius: 4 },
  legendTitle: { fontWeight: "bold", marginBottom: 5 },
  mainFilterButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  mainFilterButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  filterOptionsContainer: {
    marginTop: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    padding: 8,
    width: "80%",
  },
  filterButton: { paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  filterButtonActive: { backgroundColor: colors.buttons },
  filterButtonText: { color: "#fff", fontSize: 15 },
  filterButtonTextActive: { fontWeight: "bold" },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  drawerContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: width * 0.7,
    backgroundColor: colors.background,
    padding: 15,
    elevation: 8,
  },
  profileHeader: { alignItems: "center", marginTop: 60, marginBottom: 15 },
  accName: { fontSize: 16, fontWeight: "bold", marginTop: 5 },
  optionSection: { borderTopWidth: 1, borderTopColor: "#ddd", paddingTop: 10 },
  optionItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 10 },
  optionText: { fontSize: 15, color: "#333" },
  footerSection: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  footerText: { fontSize: 12, color: "#888", textAlign: "center" },
});
