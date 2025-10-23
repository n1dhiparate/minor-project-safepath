import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./screens/splashscreen";
import Onboarding from "./screens/onboardingscreen(2)";
import Home from "./screens/Home";

const Stack = createNativeStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showSplash ? (
          // Splash first
          <Stack.Screen name="Splash">
            {props => <SplashScreen {...props} onFinish={() => setShowSplash(false)} />}
          </Stack.Screen>
        ) : (
          <>
            {/* Onboarding second */}
            <Stack.Screen name="Onboarding" component={Onboarding} />
            {/* Main home */}
            <Stack.Screen name="Home" component={Home} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
