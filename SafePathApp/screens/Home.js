import React, { useState, useEffect } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { GOOGLE_MAPS_API_KEY } from "@env";

export default function Home() {
  const [location, setLocation] = useState(null);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState([]); // ✅ start with empty array

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // ✅ fetch Google autocomplete predictions safely
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
        // ✅ Always check if predictions exist
        setPredictions(json.predictions || []);
      } catch (error) {
        console.error("Autocomplete error:", error);
        setPredictions([]); // fallback to empty
      }
    } else {
      setPredictions([]); // clear when query small
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

      {/* Search box */}
      <View style={{ position: "absolute", top: 60, width: "90%", alignSelf: "center" }}>
        <TextInput
          value={query}
          onChangeText={handleSearch}
          placeholder="Search for a place"
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 10,
            elevation: 3,
          }}
        />

        {/* ✅ Only map/filter if predictions is defined & non-empty */}
        {predictions?.length > 0 && (
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ padding: 10, backgroundColor: "#f8f8f8", borderBottomWidth: 1 }}
              >
                <Text>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}
