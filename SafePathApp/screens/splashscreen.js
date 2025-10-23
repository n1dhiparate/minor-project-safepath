import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const colors = { 
  primary: "#C9E4C5",
  accent: "#F7DAD9",
  background: "#FFF9F0",
  buttons: "#9bb8ad",
  text: "#444444",
};

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => onFinish(), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[colors.accent, colors.background, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={{
          alignItems: "center",
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <View style={styles.logoShadow}>
          <Image
            source={require("../assets/images/safepath_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.appName}>SafePath</Text>
        <Text style={styles.tagline}>A Safety-Based Navigation System for Women</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoShadow: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#9BB8AD",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 25,
      },
      android: {
        elevation: 25,
      },
    }),
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 2,
    marginTop: 20,
    textTransform: "uppercase",
  },
  tagline: {
    fontSize: 14,
    color: colors.text,
    marginTop: 10,
    letterSpacing: 1,
  },
});
