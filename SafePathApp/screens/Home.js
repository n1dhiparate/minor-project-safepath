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
import { Magnetometer } from "expo-sensors"; // ✅ Added
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { GOOGLE_MAPS_API_KEY } from "@env";

const { width } = Dimensions.get("window");

const colors = {
  primary: "#C9E4C5",
  accent: "#F7DAD9",
  background: "#FFF9F0",
  buttons: "#9BB8AD",
  text: "#444444",
};

export default function Home() {
  const [location, setLocation] = useState(null);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const micAnim = useRef(new Animated.Value(1)).current;
  const drawerAnim = useRef(new Animated.Value(-width * 0.7)).current;

  // ✅ Floating Menu
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Compass State
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // ✅ Magnetometer (Compass Direction)
  useEffect(() => {
    let subscription = Magnetometer.addListener((data) => {
      let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      setHeading(angle >= 0 ? angle : angle + 360);
    });
    return () => subscription && subscription.remove();
  }, []);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            text
          )}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const json = await response.json();
        setPredictions(json.predictions || []);
      } catch (error) {
        setPredictions([]);
      }
    } else {
      setPredictions([]);
    }
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

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

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={{
          latitude: location?.latitude || 19.076,
          longitude: location?.longitude || 72.8777,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
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

      {/* SEARCH BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={openDrawer}>
          <Feather name="menu" size={26} color={colors.text} />
        </TouchableOpacity>

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

      {/* ✅ COMPASS NEEDLE */}
      <View style={styles.compassContainer}>
        <Animated.View style={{ transform: [{ rotate: `${heading}deg` }] }}>
          <Feather name="navigation" size={28} color={colors.text} />
        </Animated.View>
      </View>

      {/* ✅ FLOATING EXPAND MENU */}
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

  /* ✅ COMPASS STYLE */
  compassContainer: {
    position: "absolute",
    bottom: 35,
    left: 25,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 40,
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
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
});
