// screens/onboardingscreen(2).js
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const colors = {
  primary: "#C9E4C5",
  accent: "#F7DAD9",
  background: "#FFF9F0",
  buttons: "#9BB8AD",
  text: "#444444",
};

export default function Onboarding({ onFinish }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim]);

  return (
    <LinearGradient colors={[colors.primary, colors.accent]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 🌸 Logo / Image with bounce */}
        <Animated.View
          style={[
            {
              transform: [{ translateY: bounceAnim }],
              backgroundColor: "#ffffff",
              borderRadius: 12, // subtle roundness
              padding: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 17,
              elevation: 8, // Android shadow
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
            },
          ]}
        >
          <Image
            source={require("../assets/images/safepath_logo.png")}
            style={{
              width: 140,
              height: 140,
              borderRadius: 8, // slight soft edge
            }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* 🌸 Title */}
        <Text style={styles.title}>Welcome to SafePath</Text>
        <Text style={styles.subtitle}>Safety-Based Navigation for Women.</Text>

        {/* 🌸 Key Points */}
        <View style={styles.card}>
          <Text style={styles.point}>
            1. Navigate with safety as your first priority, not just speed or distance.
          </Text>
          <Text style={styles.point}>
            2. Get real-time updates on safe and unsafe zones with detailed visuals.
          </Text>
          <Text style={styles.point}>
            3. View area safety ratings based on lighting, CCTV presence, and past reports.
          </Text>
          <Text style={styles.point}>
            4. Use smart SOS and shake-to-share emergency tools when you feel unsafe.
          </Text>
          <Text style={styles.point}>
            5. Access verified safe spots, like police stations or open stores, even offline.
          </Text>
        </View>

        {/* 🌸 Get Started Button */}
        <TouchableOpacity onPress={onFinish} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.buttons, "#7fae8f"]}
            start={[0, 0]}
            end={[1, 0]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* 🌿 Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>SafePath | 2025 </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  image: {
    width: 180, // smaller logo
    height: 180,
    marginTop: 30,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 22,
    marginBottom: 40,
    width: "100%",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  point: {
    fontSize: 15,
    color: "#444",
    marginBottom: 10,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: colors.background,
    fontWeight: "bold",
    fontSize: 18,
  },
  footer: {
    position: "absolute",
    bottom: 15,
    alignItems: "center",
    width: "100%",
  },
  footerText: {
    fontSize: 13,
    color: "#555",
    opacity: 0.8,
    letterSpacing: 0.5,
  },
});
