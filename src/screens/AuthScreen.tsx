/**
 * AuthScreen - Google Login & Guest Mode
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store";
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Gradients,
  Shadows,
} from "@/theme";
import { Button } from "@/components";
import { authService } from "@/services/auth";
import type { User } from "@/types";

const { width, height } = Dimensions.get("window");

interface AuthScreenProps {
  onGoogleLogin?: () => Promise<void>;
  onGuestContinue?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onGoogleLogin,
  onGuestContinue,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useAppStore((state) => state.theme);
  const setUser = useAppStore((state) => state.setUser);
  const colors = Colors[theme];
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth setup
  const [request, response, promptAsync] = authService.useGoogleAuth();
  
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleToken(id_token);
      }
    } else if (response?.type === 'error') {
      Alert.alert('Login Error', response.error?.message || 'Google login failed. Please check your OAuth configuration.');
    }
  }, [response]);

  const handleGoogleToken = async (idToken: string) => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithGoogle(idToken);
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        Alert.alert('Login Failed', result.error || 'Could not sign in with Google');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Error', 'Something went wrong during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      if (!request) {
        Alert.alert(
          'Google Login Not Configured',
          'In the meantime, you can continue as a guest.',
          [{ text: 'OK', onPress: () => setIsLoading(false) }],
        );
        return;
      }
      
      if (onGoogleLogin) {
        await onGoogleLogin();
      } else {
        await promptAsync();
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not initiate Google sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    if (onGuestContinue) {
      onGuestContinue();
    } else {
      setIsLoading(true);
      try {
        const result = await authService.signInAsGuest();
        if (result.success && result.user) {
          setUser(result.user);
        }
      } catch (error) {
        // Offline fallback
        const guestUser: User = {
          id: `guest_${Date.now()}`,
          displayName: 'Guest User',
          isGuest: true,
          preferredTheme: 'dark',
          notificationsEnabled: false,
          savedPrompts: [],
          reactions: [],
          generations: [],
          copies: [],
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        setUser(guestUser);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <LinearGradient
      colors={
        theme === "dark"
          ? ["#0D0D0F", "#1A1A2E", "#0D0D0F"]
          : ["#F8F9FC", "#E8EDF5", "#F8F9FC"]
      }
      style={styles.container}
    >
      {/* Background decoration */}
      <View style={styles.decorationContainer}>
        <Animated.View
          entering={FadeInDown.delay(300).duration(800)}
          style={[styles.decorCircle, styles.decorCircle1]}
        >
          <LinearGradient
            colors={["rgba(139, 92, 246, 0.3)", "rgba(139, 92, 246, 0.05)"]}
            style={styles.decorGradient}
          />
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(500).duration(800)}
          style={[styles.decorCircle, styles.decorCircle2]}
        >
          <LinearGradient
            colors={["rgba(6, 182, 212, 0.3)", "rgba(6, 182, 212, 0.05)"]}
            style={styles.decorGradient}
          />
        </Animated.View>
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + Spacing.xxl }]}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={Gradients.primary as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logo}
            >
              <Ionicons name="sparkles" size={32} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Viral Prompt
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Discover trending AI prompts for{"\n"}images and videos
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          style={styles.features}
        >
          {[
            {
              icon: "trending-up",
              text: "Trending prompts from YouTube, Reddit, X & more",
            },
            { icon: "image", text: "Image & video AI prompts" },
            { icon: "download", text: "Works offline with cached content" },
            { icon: "flash", text: "One-tap generate in Gemini" },
          ].map((feature, index) => (
            <View
              key={index}
              style={[
                styles.featureItem,
                {
                  backgroundColor: colors.glass,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[styles.featureText, { color: colors.textSecondary }]}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Auth buttons */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(600)}
          style={[
            styles.authContainer,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
        >
          {/* Google Login */}
          <Pressable
            style={[
              styles.googleButton,
              { backgroundColor: colors.backgroundSecondary },
            ]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <View style={styles.googleIcon}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={[styles.googleText, { color: colors.textPrimary }]}>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: colors.glassBorder },
              ]}
            />
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>
              or
            </Text>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: colors.glassBorder },
              ]}
            />
          </View>

          {/* Guest mode */}
          <Pressable
            style={[
              styles.guestButton,
              {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
              },
            ]}
            onPress={handleGuestContinue}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={[styles.guestText, { color: colors.textSecondary }]}>
              Continue as Guest
            </Text>
          </Pressable>

          {/* Terms */}
          <Text style={[styles.terms, { color: colors.textTertiary }]}>
            By continuing, you agree to our{" "}
            <Text style={{ color: colors.primary }}>Terms of Service</Text> and{" "}
            <Text style={{ color: colors.primary }}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorationContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 999,
  },
  decorCircle1: {
    width: 300,
    height: 300,
    top: -50,
    right: -100,
  },
  decorCircle2: {
    width: 250,
    height: 250,
    bottom: 100,
    left: -100,
  },
  decorGradient: {
    flex: 1,
    borderRadius: 999,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: Typography.fontSize.hero,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    textAlign: "center",
    lineHeight: 26,
  },
  features: {
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
  },
  authContainer: {
    gap: Spacing.md,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.button,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleText: {
    fontSize: Typography.fontSize.md,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: Typography.fontSize.sm,
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  guestText: {
    fontSize: Typography.fontSize.md,
    fontWeight: "500",
  },
  terms: {
    fontSize: Typography.fontSize.xs,
    textAlign: "center",
    lineHeight: 18,
    marginTop: Spacing.sm,
  },
});

export default AuthScreen;
