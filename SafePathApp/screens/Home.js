import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
// Assuming @env is configured correctly, otherwise replace with actual key
import { GOOGLE_MAPS_API_KEY } from "@env"; 
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const { height } = Dimensions.get("window");

// --- START: Added nightMapStyle definition (Required by your MapView props) ---
const nightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
];
// --- END: Added nightMapStyle definition ---

export default function Home() {
  const [nightMode, setNightMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    bus: true,
    police: true,
    hospital: true,
    school: false,
    college: false,
    market: false,
    restaurant: false,
    temple: false,
  });
  const [sosVisible, setSosVisible] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);

  const mapRef = useRef(null);

  // Request location permission
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Enable location permission to use this feature.");
      return false;
    }
    return true;
  };

  // Fetch nearby places safely
  const fetchNearbyPlaces = async (lat, lng) => {
    try {
      // Safe check for filters
      const currentFilters = filters || {};
      const selectedTypes = Object.keys(currentFilters).filter((key) => currentFilters[key]);

      if (selectedTypes.length === 0) {
        setPlaces([]); // no filters selected
        return;
      }

      const typeQuery = selectedTypes.join("|");

      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=${typeQuery}&key=${GOOGLE_MAPS_API_KEY}`
      );

      // Safe check for results
      setPlaces(res.data.results ?? []);
    } catch (err) {
      console.error("Error fetching nearby places:", err);
      setPlaces([]); // fail-safe
    }
  };
  // Get current location once
  const getLocation = async () => {
    if (!(await requestLocationPermission())) return;

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    setCurrentLocation({ latitude, longitude });
    fetchNearbyPlaces(latitude, longitude);

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    setAutoFollow(true);
  };

  // Watch user location continuously with auto-follow
  useEffect(() => {
    const subscribe = async () => {
      if (!(await requestLocationPermission())) return;

      const watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 2 },
        (location) => {
          const { latitude, longitude } = location.coords;
          setCurrentLocation({ latitude, longitude });

          if (autoFollow && mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }

          // Update nearby places dynamically
          fetchNearbyPlaces(latitude, longitude);
        }
      );

      return () => watcher.remove();
    };
    subscribe();
  }, [autoFollow, filters]); // Refetch when filters change

  const toggleFilter = (key) => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);
    if (currentLocation) {
      fetchNearbyPlaces(currentLocation.latitude, currentLocation.longitude);
    }
  };

  const showSosToast = () => {
    setSosVisible(true);
    setTimeout(() => setSosVisible(false), 2000);
  };

  if (!currentLocation) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar with Google Places Autocomplete */}
      <GooglePlacesAutocomplete
        placeholder="Search location"
        fetchDetails={true}
        onPress={(data, details = null) => {
          if (!details) return;
          const lat = details.geometry.location.lat;
          const lng = details.geometry.location.lng;
          mapRef.current.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }}
        // --- START: The crucial fix for 'filter' of undefined error ---
        // This ensures the library's internal list component has a valid render function.
        renderRow={(data) => <Text style={{ padding: 10 }}>{data.description}</Text>}
        // --- END: The crucial fix for 'filter' of undefined error ---
        query={{ key: GOOGLE_MAPS_API_KEY, language: "en" }}
        styles={{
          container: { position: "absolute", top: 50, width: "90%", alignSelf: "center", zIndex: 1000 },
          textInput: { backgroundColor: "#fff", borderRadius: 12, fontSize: 16 },
        }}
      />

      {/* Google Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={nightMode ? nightMapStyle : []}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        onPanDrag={() => setAutoFollow(false)}
      >
        {(places || []).map((place) => (
          <Marker
            key={place.place_id}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
            description={place.vicinity}
          />
        ))}
      </MapView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: "#9bb8ad" }]} onPress={getLocation}>
          <Text style={styles.fabText}>📍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, { backgroundColor: "#f7dad9" }]} onPress={() => alert("Route calculation")}>
          <Text style={styles.fabText}>🛣️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, { backgroundColor: "#ff6b6b" }]} onPress={showSosToast}>
          <Text style={styles.fabText}>🚨</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, { backgroundColor: "#444" }]} onPress={() => setNightMode(!nightMode)}>
          <Text style={[styles.fabText, { color: "#fff" }]}>🌙</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Filters */}
      <View style={styles.bottomSheet}>
        <TouchableOpacity style={styles.sheetHeader} onPress={() => setFiltersVisible(!filtersVisible)}>
          <Text style={{ fontWeight: "700" }}>Filters ▾</Text>
        </TouchableOpacity>
        {filtersVisible && (
          <ScrollView style={{ maxHeight: height * 0.2 }}>
            {Object.keys(filters).map((key) => (
              <View key={key} style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
                <Switch
                  trackColor={{ false: "#f7dad9", true: "#9bb8ad" }}
                  thumbColor={filters[key] ? "#c9e4c5" : "#fff"}
                  value={filters[key]}
                  onValueChange={() => toggleFilter(key)}
                />
                <Text style={{ marginLeft: 8, color: "#444444" }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* SOS Toast */}
      {sosVisible && (
        <View style={styles.sosToast}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>🚨 SOS Activated!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: height * 0.28,
    flexDirection: "column",
    gap: 12,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  fabText: { fontSize: 24 },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 8,
    maxHeight: height * 0.35,
  },
  sheetHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  sosToast: {
    position: "absolute",
    right: 20,
    top: 120,
    zIndex: 1600,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ff6b6b",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
});