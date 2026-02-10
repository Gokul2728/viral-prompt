/**
 * GlassCard - Premium Glassmorphic Card Component
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  PressableProps,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAppStore } from '@/store';
import { Colors, BorderRadius, Shadows, Spacing } from '@/theme';

interface GlassCardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'highlight' | 'viral';
  blur?: number;
  borderGradient?: boolean;
  glowColor?: string;
  animated?: boolean;
  padding?: keyof typeof Spacing | number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
  blur = 20,
  borderGradient = false,
  glowColor,
  animated = true,
  padding = 'lg',
  onPress,
  ...pressableProps
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  const handlePressIn = () => {
    if (animated && onPress) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.9, { duration: 100 });
    }
  };
  
  const handlePressOut = () => {
    if (animated && onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 100 });
    }
  };
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'elevated':
        return colors.surfaceElevated;
      case 'highlight':
        return colors.surfaceHighlight;
      case 'viral':
        return theme === 'dark'
          ? 'rgba(255, 107, 107, 0.1)'
          : 'rgba(225, 29, 72, 0.08)';
      default:
        return colors.glass;
    }
  };
  
  const getBorderColor = () => {
    switch (variant) {
      case 'viral':
        return theme === 'dark'
          ? 'rgba(255, 107, 107, 0.3)'
          : 'rgba(225, 29, 72, 0.2)';
      default:
        return colors.glassBorder;
    }
  };
  
  const paddingValue = typeof padding === 'number' ? padding : Spacing[padding];
  
  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: borderGradient ? 'transparent' : getBorderColor(),
          padding: paddingValue,
        },
        ...(glowColor ? [Shadows.glow(glowColor, 0.2)] : []),
        style,
      ]}
    >
      {children}
    </View>
  );
  
  if (borderGradient) {
    return (
      <AnimatedPressable
        style={animatedStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        {...pressableProps}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View
            style={[
              styles.innerCard,
              {
                backgroundColor:
                  theme === 'dark'
                    ? Colors.dark.backgroundSecondary
                    : Colors.light.backgroundSecondary,
                padding: paddingValue,
              },
              style,
            ]}
          >
            {children}
          </View>
        </LinearGradient>
      </AnimatedPressable>
    );
  }
  
  if (onPress) {
    return (
      <AnimatedPressable
        style={animatedStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        {...pressableProps}
      >
        {cardContent}
      </AnimatedPressable>
    );
  }
  
  return cardContent;
};

/**
 * GlassCardBlur - Card with native blur effect
 */
export const GlassCardBlur: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
  blur = 50,
  padding = 'lg',
  onPress,
  ...props
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  const paddingValue = typeof padding === 'number' ? padding : Spacing[padding];
  
  const content = (
    <BlurView
      intensity={blur}
      tint={theme === 'dark' ? 'dark' : 'light'}
      style={[
        styles.blurCard,
        {
          borderColor: colors.glassBorder,
          padding: paddingValue,
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
  
  if (onPress) {
    return (
      <Pressable onPress={onPress} {...props}>
        {content}
      </Pressable>
    );
  }
  
  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  blurCard: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gradientBorder: {
    borderRadius: BorderRadius.card,
    padding: 1.5,
  },
  innerCard: {
    borderRadius: BorderRadius.card - 1,
    overflow: 'hidden',
  },
});

export default GlassCard;
