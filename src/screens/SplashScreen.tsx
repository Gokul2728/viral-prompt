/**
 * SplashScreen - Animated splash with gradient background
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Gradients } from '@/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Logo animation
    logoScale.value = withDelay(
      200,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
    logoOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 600 })
    );
    
    // Glow animation
    glowScale.value = withDelay(
      400,
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 600 })
      )
    );
    glowOpacity.value = withDelay(
      400,
      withSequence(
        withTiming(0.8, { duration: 800 }),
        withTiming(0.4, { duration: 600 })
      )
    );
    
    // Title animation
    titleOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 500 })
    );
    titleTranslateY.value = withDelay(
      600,
      withSpring(0, { damping: 15, stiffness: 100 })
    );
    
    // Subtitle animation
    subtitleOpacity.value = withDelay(
      900,
      withTiming(1, { duration: 500 })
    );
    
    // Complete after animations
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));
  
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));
  
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));
  
  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));
  
  return (
    <LinearGradient
      colors={['#0D0D0F', '#1A1A2E', '#0D0D0F']}
      style={styles.container}
    >
      {/* Background particles */}
      <View style={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                width: 2 + Math.random() * 4,
                height: 2 + Math.random() * 4,
                opacity: 0.1 + Math.random() * 0.3,
              },
            ]}
          />
        ))}
      </View>
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        {/* Glow effect */}
        <Animated.View style={[styles.glow, glowAnimatedStyle]}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.5)', 'rgba(6, 182, 212, 0.3)']}
            style={styles.glowGradient}
          />
        </Animated.View>
        
        {/* Logo icon */}
        <Animated.View style={[styles.logoIcon, logoAnimatedStyle]}>
          <LinearGradient
            colors={Gradients.primary as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Ionicons name="sparkles" size={40} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>
      </View>
      
      {/* Title */}
      <Animated.Text style={[styles.title, titleAnimatedStyle]}>
        Viral Prompt
      </Animated.Text>
      
      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
        Discover Trending AI Prompts
      </Animated.Text>
      
      {/* Loading indicator */}
      <Animated.View style={[styles.loadingContainer, subtitleAnimatedStyle]}>
        <View style={styles.loadingBar}>
          <Animated.View style={styles.loadingProgress} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: Colors.dark.primary,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 80,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
  },
  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSize.hero,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.dark.textSecondary,
    marginBottom: 48,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    width: 120,
  },
  loadingBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '60%',
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
});

export default SplashScreen;
