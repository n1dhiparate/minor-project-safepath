import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

import SplashScreen from "./screens/splashscreen";
import Onboarding from "./screens/onboardingscreen(2)";
import Login from "./screens/login";
import Home from "./screens/Home";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash">
          {(props) => (
            <SplashScreen
              {...props}
              onFinish={() => props.navigation.replace("Onboarding")}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Onboarding">
          {(props) => (
            <Onboarding
              {...props}
              onFinish={() =>
                user
                  ? props.navigation.replace("Home")
                  : props.navigation.replace("Login")
              }
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
