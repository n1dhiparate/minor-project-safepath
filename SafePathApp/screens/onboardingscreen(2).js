import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const colors = {
  primary: "#C9E4C5",
  accent: "#F7DAD9",
  background: "#FFF9F0",
  buttons: "#9BB8AD",
  text: "#444444",
};

const { width } = Dimensions.get("window");

export default function Onboarding({ navigation }) {
  const [scrollX] = useState(new Animated.Value(0));

  const slides = [
    {
      title: "SafePath",
      subtitle: "Safety-Based Navigation",
      description:
        "🚶‍♀️ Prioritize safety over shortest or fastest routes.\n\n" +
        "🔒 Real-time crowdsourced data to mark safe and unsafe areas.\n\n" +
        "🌃 Safety scoring for night routes.\n\n" +
        "🚨 Emergency tools like SOS alerts & shake-to-share location.\n\n" +
        "📶 Offline access to trusted safe places.",
    },
  ];

  return (
    <LinearGradient colors={[colors.primary, colors.accent]} style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
            <View style={styles.card}>
              <Text style={styles.text}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, i) => {
          const dotOpacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return <Animated.View key={i} style={[styles.dot, { opacity: dotOpacity }]} />;
        })}
      </View>

      {/* Get Started Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.replace("Home")}
        style={{ width: "100%", alignItems: "center", marginBottom: 30 }}
      >
        <LinearGradient
          colors={[colors.buttons, "#7fae8f"]}
          start={[0, 0]}
          end={[1, 0]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    width: width,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "#6b6b6b",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: "100%",
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 120,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: "bold",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: colors.buttons,
    marginHorizontal: 6,
  },
});
