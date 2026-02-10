/**
 * Viral Prompt Discovery App
 * Main entry point
 */

import React, { useEffect } from "react";
import {
  StatusBar,
  StyleSheet,
  LogBox,
  AppState,
  AppStateStatus,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useAppStore } from "@/store";
import { RootNavigator } from "@/navigation";
import { databaseService } from "@/services/database";
import { authService } from "@/services/auth";

// Suppress specific warnings in development
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const theme = useAppStore((state) => state.theme);
  const setUser = useAppStore((state) => state.setUser);
  const setSyncStatus = useAppStore((state) => state.setSyncStatus);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize SQLite database for offline cache
        await databaseService.initialize();

        // Restore auth session
        const authState = await authService.initialize();
        if (authState.isAuthenticated && authState.user) {
          setUser(authState.user);
        }

        // Check connectivity with manual timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(
            "https://dev-api-test.x1.stage.hostnmeet.com/api/health",
            {
              method: "HEAD",
              signal: controller.signal,
            },
          );

          clearTimeout(timeoutId);
          setSyncStatus({ isOnline: response.ok });
        } catch {
          setSyncStatus({ isOnline: false });
        }
      } catch (error) {
        console.error("App initialization error:", error);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    initApp();

    // Listen to app state changes for background sync
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          // Re-check connectivity when app comes to foreground
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          fetch("https://dev-api-test.x1.stage.hostnmeet.com/api/health", {
            method: "HEAD",
            signal: controller.signal,
          })
            .then(() => {
              clearTimeout(timeoutId);
              setSyncStatus({ isOnline: true });
            })
            .catch(() => {
              clearTimeout(timeoutId);
              setSyncStatus({ isOnline: false });
            });
        }
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
