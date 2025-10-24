import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const colors = {
  gradientStart: "#F7DAD9",
  gradientMiddle: "#FFF9F0",
  gradientEnd: "#C9E4C5",
  text: "#444444",
  tagline: "#666666",
  logoBackground: "#FFF",
};

export default function SplashScreen({ onFinish }) {
  const bounceValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bounce animation loop
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: -15, // bounce up
          duration: 1000, // slower bounce
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0, // back to original
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => bounce());
    };

    bounce();

    // Call onFinish safely after 3 seconds
    const timer = setTimeout(() => {
      if (onFinish && typeof onFinish === "function") {
        onFinish();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={styles.logoWrapper}>
        <Animated.View
          style={[
            styles.logoBackground,
            { transform: [{ translateY: bounceValue }] },
          ]}
        >
          <Image
            source={require("../assets/images/safepath_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Text style={styles.appName}>SAFEPATH</Text>
        <Text style={styles.tagline}>Safety-Based Navigation for Women</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoWrapper: {
    alignItems: "center",
  },
  logoBackground: {
    backgroundColor: colors.logoBackground,
    borderRadius: 25,
    padding: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: colors.tagline,
    textAlign: "center",
    lineHeight: 20,
  },
});