import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View } from "react-native";

export default function App() {
  return (
    <View style={[styles.container,{ backgroundColor: isNightMode ? "#121212" : "#fff9f0ff" },]}
>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 19.0823,
          longitude: 72.8407,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{ latitude: 19.0823, longitude: 72.8407 }}
          title="Santacruz"
          description="Start point"
        />
        {routeCoords.length > 0 && (
  <Polyline coordinates={routeCoords} strokeColor="#007AFF" strokeWidth={5} />
)}

      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
