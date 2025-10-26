// screens/Login.js
import React, { useState, useEffect } from "react";
import { auth, clientId } from "../firebaseConfig";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

const colors = {
  primary: "#C9E4C5",
  accent: "#F7DAD9",
  background: "#FFF9F0",
  buttons: "#9BB8AD",
  text: "#444444",
};

WebBrowser.maybeCompleteAuthSession();

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: clientId,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => navigation.replace("Home"))
        .catch((error) => Alert.alert("Google Login Failed", error.message));
    }
  }, [response]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigation.replace("Home");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Account created!", "You can now log in.");
        setIsLogin(true);
      }
    } catch (error) {
      Alert.alert("Authentication Failed", error.message);
    }
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.accent, colors.background]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* ✨ App Logo */}
        <View style={styles.logoWrapper}>
          <Image
            source={require("../assets/images/safepath_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* ✨ Input Fields */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#777"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#777"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* ✨ Auth Button */}
        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>
            {isLogin ? "Login" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        {/* ✨ Google Sign-In */}
        <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()}>
          <Image
            source={require("../assets/images/google_icon.png")}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* ✨ Switch Text */}
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin
              ? "New here? Create an account"
              : "Already have an account? Log in"}
          </Text>
        </TouchableOpacity>

        {/* 🌿 Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>SafePath • 2025</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  logoWrapper: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 40,
  },
  logo: {
    width: 110,
    height: 110,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    color: colors.text,
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: colors.buttons,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  googleButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleText: {
    color: colors.text,
    fontWeight: "600",
  },
  switchText: {
    color: colors.text,
    marginTop: 25,
    fontSize: 14,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
    width: "100%",
  },
  footerDivider: {
    width: "40%",
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginBottom: 6,
  },
  footerText: {
    fontSize: 13,
    color: "rgba(68,68,68,0.8)",
    opacity: 0.85,
    letterSpacing: 0.5,
  },
});
