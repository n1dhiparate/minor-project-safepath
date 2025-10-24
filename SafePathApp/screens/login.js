// screens/Login.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { auth } from "../firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  // Google AuthSession
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "574601310005-bjv2p7gh6s6dci84dlslviq3t57kpmo4.apps.googleusercontent.com", // Firebase Web Client ID
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
        navigation.replace("Home"); // Navigate to Home after successful login
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isLogin ? "Login" : "Sign Up"}</Text>
      </TouchableOpacity>

      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#DB4437", marginTop: 15 }]}
        onPress={() => promptAsync()}
      >
        <Text style={styles.buttonText}>Login with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin ? "New here? Create an account" : "Already have an account? Log in"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#FFF9F0" },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 40 },
  input: { width: "100%", height: 50, borderColor: "#ccc", borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, backgroundColor: "#fff" },
  button: { width: "100%", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  switchText: { color: "#555", marginTop: 20 },
});
