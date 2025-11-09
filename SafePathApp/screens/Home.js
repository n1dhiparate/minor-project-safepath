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
  Modal,
  Alert,
  Linking,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { GOOGLE_MAPS_API_KEY } from "@env";
import { unsafeSpots } from "../assets/data/unsafeSpots";
import Papa from "papaparse";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-audio"; // fixed import

import { db } from "../firebaseConfig";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

const { width } = Dimensions.get("window");

const colors = {
  primary: "#C9E4C5",
  accent: "#F7DAD9",
  background: "#fff9f0ff",
  buttons: "#9BB8AD",
  text: "#444444",
  crimeMarker: "#800080",
  reportMarker: "#FF8C00",
};

export default function Home() {
  // ------------------ STATES ------------------
  const [recording, setRecording] = useState(null);
  const [isNightMode, setIsNightMode] = useState(false);
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

  const [destination, setDestination] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [incidentType, setIncidentType] = useState("");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [reports, setReports] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const micAnim = useRef(new Animated.Value(1)).current;
  const drawerAnim = useRef(new Animated.Value(-width * 0.7)).current;
  const [routeColor, setRouteColor] = useState("#007AFF"); 

  const determineRouteColor = (penalty) => {
    if (penalty < 3) return "green";
    else if (penalty < 7) return "yellow";
    else return "red";
  };

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

  // ------------------ AUDIO RECORDING ------------------
  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted)  {
      Alert.alert("Permission denied", "Audio permission is required to record.");
      return;
    }

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    console.log("Recording started...");
  } catch (err) {
    console.error("Recording failed:", err);
  }
};

const stopRecording = async () => {
  if (!recording) return;
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log("Recording saved at:", uri);
    setRecording(null);
  } catch (err) {
    console.error("Stopping recording failed:", err);
  }
};

  // ------------------ SOS FUNCTION ------------------
  const sendSOS = async () => {
    if (!location) {
      Alert.alert("Location not available", "Cannot send SOS without location.");
      return;
    }

    const message = `🚨 Emergency! My current location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

    emergencyContacts.forEach((contact) => {
      const url = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch((err) => console.warn(err));
    });

    Alert.alert("SOS Sent", "Your emergency message has been sent!");
  };

  // ------------------ LOCATION ------------------
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

  useEffect(() => {
    const loadContacts = async () => {
      const saved = await AsyncStorage.getItem("emergencyContacts");
      if (saved) setEmergencyContacts(JSON.parse(saved));
    };
    loadContacts();
  }, []);

  const saveContacts = async (contacts) => {
    setEmergencyContacts(contacts);
    await AsyncStorage.setItem("emergencyContacts", JSON.stringify(contacts));
  };

  // ------------------ COMPASS ------------------
  useEffect(() => {
    const sub = Magnetometer.addListener((data) => {
      const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      setHeading(angle >= 0 ? angle : angle + 360);
    });
    return () => sub && sub.remove();
  }, []);

  // ------------------ LOAD CSV DATA ------------------
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

  // ------------------ FIRESTORE REAL-TIME REPORTS ------------------
  useEffect(() => {
    try {
      const q = collection(db, "reports");
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const fetched = snapshot.docs.map((doc) => {
            const data = doc.data();
            let coords = data.coords;
            if (coords && coords.lat !== undefined && coords.lng !== undefined) {
              coords = { latitude: coords.lat, longitude: coords.lng };
            }
            return { id: doc.id, ...data, coords };
          });
          setReports(fetched);
        },
        (err) => {
          console.warn("reports onSnapshot error:", err);
        }
      );
      return () => unsub && unsub();
    } catch (err) {
      console.warn("Could not attach reports listener:", err);
    }
  }, []);

  // ------------------ MIC ANIMATION ------------------
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
  // ------------------ LOCATION PERMISSION CHECK ------------------
  const checkLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required to submit a report.");
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 10000,
    });

    if (!loc || !loc.coords) {
      Alert.alert("Location Unavailable", "Couldn't fetch your location. Try again.");
      return null;
    }

    return loc.coords;
  };

  // ------------------ SEARCH PLACES ------------------
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

  // ------------------ REPORT SUBMISSION ------------------
  const handleReportSubmit = async () => {
    try {
      const coords = await checkLocationPermission();
      if (!coords) {
        Alert.alert("Location Error", "Unable to get your current location.");
        return;
      }

      const isDuplicate = reports.some((r) => {
        const rc = r.coords.latitude !== undefined
          ? r.coords
          : { latitude: r.coords.lat, longitude: r.coords.lng };
        const dKm = getDistance(rc, { latitude: coords.latitude, longitude: coords.longitude });
        return dKm < 0.1 && (r.type || "").toLowerCase() === incidentType.toLowerCase();
      });

      if (isDuplicate) {
        Alert.alert("Duplicate Report", "A similar incident was already reported nearby.");
        return;
      }

      const payload = {
        id: Date.now(),
        type: incidentType,
        desc: incidentDesc,
        coords: { lat: coords.latitude, lng: coords.longitude },
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, "reports"), payload);

      setReportModalVisible(false);
      setIncidentType("");
      setIncidentDesc("");
      Alert.alert("✅ Report Submitted", "Thank you for contributing to safer routes!");
    } catch (error) {
      console.error("Report submission error:", error);
      Alert.alert("Error", "Something went wrong while submitting your report.");
    }
  };

  // ------------------ SAFE ROUTE GENERATION ------------------
  const generateSafeRoute = async (destPlaceId) => {
    try {
      if (!location) {
        console.warn("Current location unknown. Cannot generate route.");
        return;
      }

      const placeRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${destPlaceId}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const placeJson = await placeRes.json();
      const destLoc = placeJson?.result?.geometry?.location;
      if (!destLoc) return;

      setDestination({ latitude: destLoc.lat, longitude: destLoc.lng });

      const dirRes = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${destLoc.lat},${destLoc.lng}&alternatives=true&mode=walking&key=${GOOGLE_MAPS_API_KEY}`
      );
      const dirJson = await dirRes.json();
      if (!dirJson.routes || dirJson.routes.length === 0) return;

      const scoredRoutes = dirJson.routes.map((route) => {
        const points = decodePolyline(route.overview_polyline?.points || "");
        const penalty = calculateSafetyPenalty(points);
        const distanceKm = (route.legs?.[0]?.distance?.value || 0) / 1000;
        const score = -distanceKm - penalty * 0.6;
        return { points, score, penalty };
      });

      scoredRoutes.sort((a, b) => b.score - a.score);
      const bestRoute = scoredRoutes[0];
      if (bestRoute) {
        setRouteCoords(bestRoute.points);
        setRouteColor(determineRouteColor(bestRoute.penalty));
      } else {
        setRouteCoords([]);
      }
    } catch (err) {
      console.error("Error generating safe route:", err);
    }
  };

  // ------------------ SAFETY PENALTY ------------------
  const calculateSafetyPenalty = (points) => {
    if (!safetyData || safetyData.length === 0 || !points || points.length === 0) return 0;
    let penalty = 0;
    const currentHour = new Date().getHours();

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

      if (isNightMode && (currentHour >= 20 || currentHour <= 5)) penalty += 5;
      const randomTrafficFactor = Math.random();
      if (randomTrafficFactor < 0.3) penalty += 3;

      const safeHubs = [
        { latitude: 19.115, longitude: 72.845 },
        { latitude: 19.076, longitude: 72.8777 },
      ];
      for (const hub of safeHubs) {
        const dHub = getDistance(p, hub);
        if (dHub < 0.3) penalty -= 2;
      }
    }

    return penalty / Math.max(1, points.length);
  };

  // ------------------ HAVERSINE DISTANCE ------------------
  const getDistance = (loc1, loc2) => {
    const R = 6371;
    const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;
    const lat1 = (loc1.latitude * Math.PI) / 180;
    const lat2 = (loc2.latitude * Math.PI) / 180;
    const val =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return R * 2 * Math.atan2(Math.sqrt(val), Math.sqrt(1 - val));
  };

  // ------------------ POLYLINE DECODING ------------------
  const decodePolyline = (encoded) => {
    if (!encoded) return [];
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
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

  // ------------------ DRAWER ANIMATION ------------------
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

  const nightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

  return (
    <View style={{ flex: 1   }}>
      
      {/* 🗺 MAP VIEW */}
      <MapView
  style={[styles.map, { flex: 1 }]}
  customMapStyle={isNightMode ? nightMapStyle : []}
  region={{
    latitude: location?.latitude || 19.076,
    longitude: location?.longitude || 72.8777,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
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

        {/* ✅ Safe route line */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={6}
            strokeColor={routeColor}
          />
        )}

        {/* 🔵 Real-time Firestore reports */}
        {reports
          .filter((r) => {
            const c = r.coords || {};
            const lat = c.latitude ?? c.lat;
            const lng = c.longitude ?? c.lng;
            return lat && lng && !isNaN(lat) && !isNaN(lng);
          })
          .map((r, index) => {
            const c = r.coords || {};
            const lat = c.latitude ?? c.lat;
            const lng = c.longitude ?? c.lng;

            return (
              <Marker
                key={index}
                coordinate={{ latitude: lat, longitude: lng }}
                title={`Report: ${r.type || "Incident"}`}
                description={
                  r.timestamp
                    ? new Date(
                        r.timestamp.seconds
                          ? r.timestamp.seconds * 1000
                          : r.timestamp
                      ).toLocaleString()
                    : "Recent report"
                }
                pinColor={colors.reportMarker}
              />
            );
          })}
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
              <MaterialIcons
                name="mic"
                size={22}
                color={isListening ? "#d32f2f" : "#555"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Autocomplete predictions */}
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

      {/* 🟣 Floating Action Button */}
      <>
        <TouchableOpacity
          onPress={() => setMenuOpen(!menuOpen)}
          style={styles.quickNavButton}
        >
          <Feather name={menuOpen ? "x" : "plus"} size={25} color="#fff" />
        </TouchableOpacity>

        {menuOpen && (
          <>
            <TouchableOpacity
              style={[styles.smallButton, { right: 90, bottom: 5 }]}
            >
              <Feather name="map" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, { right: 90, bottom: 55 }]}
            >
              <Feather name="shield" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, { right: 55, bottom: 95 }]}
              onPress={() => setReportModalVisible(true)}
            >
              <Feather name="alert-triangle" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, { right: 5, bottom: 90 }]}
              onPress={sendSOS}
            >
              <Feather name="alert-octagon" size={20} color="#f7f3f3ff" />
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
            <Text style={styles.mainFilterButtonText}>
              🔍 Filter: {filterType.toUpperCase()}
            </Text>
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
                  style={[
                    styles.filterButton,
                    filterType === opt.value && styles.filterButtonActive,
                  ]}
                  onPress={() => {
                    setFilterType(opt.value);
                    setShowFilters(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterType === opt.value && styles.filterButtonTextActive,
                    ]}
                  >
                    {opt.label}
                    <Text style={{ marginLeft: 5 }}>
                      {filterType === opt.value ? "✔️" : "❌"}
                    </Text>
                    
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
      </View>

      {/* 🧾 Report Modal */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Report an Incident</Text>
            <TextInput
              placeholder="Type (e.g., Poor Lighting, Harassment)"
              value={incidentType}
              onChangeText={setIncidentType}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Description..."
              value={incidentDesc}
              onChangeText={setIncidentDesc}
              style={[styles.modalInput, { height: 80 }]}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setReportModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReportSubmit}
                style={styles.submitBtn}
              >
                <Text style={styles.submitTxt}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* 🧾 Emergency Contacts Modal */}
      <Modal visible={contactModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Emergency Contacts</Text>

            <FlatList
              data={emergencyContacts}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item, index }) => (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginVertical: 5,
                  }}
                >
                  <Text>
                    {item.name} ({item.phone})
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newContacts = emergencyContacts.filter(
                        (_, i) => i !== index
                      );
                      saveContacts(newContacts);
                    }}
                  >
                    <Text style={{ color: "red" }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <TextInput
              placeholder="Name"
              value={newName}
              onChangeText={setNewName}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Phone"
              value={newPhone}
              onChangeText={setNewPhone}
              style={styles.modalInput}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              onPress={() => {
                const updated = [
                  ...emergencyContacts,
                  { name: newName, phone: newPhone },
                ];
                saveContacts(updated);
                setNewName("");
                setNewPhone("");
              }}
              style={styles.submitBtn}
            >
              <Text style={styles.submitTxt}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 👤 Drawer */}
      {drawerOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={closeDrawer}
        >
          <Animated.View style={[styles.drawerContainer, { left: drawerAnim }]}>
            <View style={styles.profileHeader}>
              <MaterialIcons name="account-circle" size={60} color="#4a4a4a" />
              <Text style={styles.accName}>Mrudul </Text>
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
      <View style={styles.nightContainer}>
        <TouchableOpacity
          style={{
            backgroundColor: isNightMode ? "#333" : "#fff9f0ff",
             paddingVertical: 10,
             paddingHorizontal: 10,
             borderRadius: 100,
             alignSelf: "center",
             }}
           onPress={() => setIsNightMode((prev) => !prev)}
        >
        <Text
           style={{ color: isNightMode ? "#fff" : "#000000ff", fontWeight: "bold" }}
         >
            {isNightMode? "🌙": "☀️"}
          </Text>
        </TouchableOpacity>
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
  nightContainer: {
    position: "absolute",
    top: 170,
    right: 15,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalInput: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelBtn: {
    backgroundColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    flex: 0.45,
  },
  submitBtn: {
    backgroundColor: colors.buttons,
    borderRadius: 8,
    padding: 10,
    flex: 0.45,
  },
  cancelTxt: { textAlign: "center", color: "#333" },
  submitTxt: { textAlign: "center", color: "#fff", fontWeight: "bold" },
});
