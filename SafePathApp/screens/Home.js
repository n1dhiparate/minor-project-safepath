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
import MapView, { Marker } from "react-native-maps";
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
  crimeMarker: "#800080", // purple for crime CSV
};

export default function Home() {
  const [location, setLocation] = useState(null);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [heading, setHeading] = useState(0);
  const [safetyData, setSafetyData] = useState([]);
  const [filterType, setFilterType] = useState("none"); // ✅ added

  const micAnim = useRef(new Animated.Value(1)).current;

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

  // ✅ Load current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // ✅ Load multiple CSVs from GitHub
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
        console.log("✅ Loaded all CSVs:", allData.length, "rows");
      } catch (error) {
        console.error("❌ Error loading CSVs:", error);
      }
    };

    loadSafetyData();
  }, []);

  // ✅ Compass functionality
  useEffect(() => {
    const sub = Magnetometer.addListener((data) => {
      const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      setHeading(angle >= 0 ? angle : angle + 360);
    });
    return () => sub && sub.remove();
  }, []);

  // ✅ Mic animation toggle
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

  // ✅ Handle search (Google Places API)
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
      } catch {
        setPredictions([]);
      }
    } else setPredictions([]);
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
        {/* 🔴 Unsafe spots (static) */}
        {unsafeSpots
          .filter((spot) => {
            if (filterType === "none") return false;
            if (filterType === "safe") return spot.safetyStatus === "safe";
            if (filterType === "unsafe") return spot.safetyStatus !== "safe";
            return true; // both
          })
          .map((spot, i) => (
            <Marker
              key={`unsafe-${i}`}
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

        {/* 🟢/🟣 CSV Safety / Crime Markers */}
        {safetyData.map((a, i) => {
          let color = "blue";
          let desc = "";

          if (a._type === "safety") {
            const score = parseFloat(a["Safety_Score_0_10"]);
            color = score >= 7 ? "green" : score >= 4 ? "yellow" : "red";
            desc = `Safety Score: ${score.toFixed(1)}/10`;
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

        {/* 📍 Current Location */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
          />
        )}
      </MapView>

      {/* 🔎 Search bar */}
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search location..."
            placeholderTextColor="#666"
            style={styles.searchInput}
          />
          <TouchableOpacity onPress={toggleMic}>
            <Animated.View style={{ transform: [{ scale: micAnim }] }}>
              <MaterialIcons
                name="mic"
                size={22}
                color={isListening ? "#d32f2f" : colors.text}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🧭 Compass */}
      <View style={styles.compassContainer}>
        <Animated.View style={{ transform: [{ rotate: `${heading}deg` }] }}>
          <Feather name="navigation" size={28} color={colors.text} />
        </Animated.View>
      </View>

      {/* ⚙️ Floating action buttons */}
      <>
        <TouchableOpacity
          onPress={() => setMenuOpen(!menuOpen)}
          style={styles.quickNavButton}
        >
          <Feather name={menuOpen ? "x" : "navigation"} size={26} color="#fff" />
        </TouchableOpacity>

        {menuOpen && (
          <>
            <TouchableOpacity style={[styles.smallButton, { right: 95, bottom: 35 }]}>
              <Feather name="map" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallButton, { right: 75, bottom: 95 }]}>
              <Feather name="shield" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallButton, { right: 15, bottom: 95 }]}>
              <Feather name="alert-triangle" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallButton, { right: -45, bottom: 35 }]}>
              <Feather name="phone-call" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </>

      {/* 🧾 Prediction dropdown */}
      {predictions?.length > 0 && (
        <FlatList
          style={styles.predictionList}
          data={predictions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.predictionItem}>
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 🗺 Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: "green" }]} />
          <Text>Safe (Safety CSV)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: "yellow" }]} />
          <Text>Moderate (Safety CSV)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: "red" }]} />
          <Text>Unsafe (Safety CSV)</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[styles.legendColor, { backgroundColor: colors.crimeMarker }]}
          />
          <Text>Crime Data</Text>
        </View>

        {/* ✅ Filter buttons inside legend */}
        <View style={styles.filterToggleContainer}>
          {[
            { label: "🚫 None", value: "none" },
            { label: "🟢 Safe", value: "safe" },
            { label: "🔴 Unsafe", value: "unsafe" },
            { label: "⚪ Both", value: "both" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.filterButton,
                filterType === opt.value && styles.filterButtonActive,
              ]}
              onPress={() => setFilterType(opt.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === opt.value && styles.filterButtonTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    paddingHorizontal: 15,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 10,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    color: colors.text,
  },
  predictionList: {
    position: "absolute",
    top: 100,
    width: "90%",
    alignSelf: "center",
    backgroundColor: colors.background,
    borderRadius: 10,
    elevation: 3,
    maxHeight: 200,
  },
  predictionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  compassContainer: {
    position: "absolute",
    bottom: 35,
    left: 25,
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
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 5,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 4,
  },
  legendTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  filterToggleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 8,
    gap: 6,
  },
  filterButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: colors.buttons,
  },
  filterButtonText: {
    fontSize: 12,
    color: colors.text,
  },
  filterButtonTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
});
