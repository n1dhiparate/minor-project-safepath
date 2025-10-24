import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./screens/splashscreen";
import Onboarding from "./screens/onboardingscreen(2)";
import Home from "./screens/Home"; // your full-featured Home

const Stack = createNativeStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showSplash && (
          <Stack.Screen name="Splash">
            {props => (
              <SplashScreen
                {...props}
                onFinish={() => {
                  setShowSplash(false);
                  setShowOnboarding(true);
                }}
              />
            )}
          </Stack.Screen>
        )}

        {showOnboarding && (
          <Stack.Screen name="Onboarding">
            {props => (
              <Onboarding
                {...props}
                onFinish={() => {
                  setShowOnboarding(false);
                  props.navigation.replace("Home");
                }}
              />
            )}
          </Stack.Screen>
        )}

        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}