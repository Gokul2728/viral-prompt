/**
 * Button Components - Premium Gradient & Glass Buttons
 */

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';
import { Colors, BorderRadius, Spacing, Typography, Shadows, Gradients } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'viral';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: string[];
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  gradient,
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
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(0.9, { duration: 100 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(1, { duration: 100 });
  };
  
  const getSizeStyles = (): { button: ViewStyle; text: TextStyle; icon: number } => {
    switch (size) {
      case 'sm':
        return {
          button: { paddingVertical: 8, paddingHorizontal: 14 },
          text: { fontSize: Typography.fontSize.sm },
          icon: 16,
        };
      case 'lg':
        return {
          button: { paddingVertical: 16, paddingHorizontal: 28 },
          text: { fontSize: Typography.fontSize.lg },
          icon: 22,
        };
      case 'xl':
        return {
          button: { paddingVertical: 18, paddingHorizontal: 32 },
          text: { fontSize: Typography.fontSize.xl },
          icon: 24,
        };
      default:
        return {
          button: { paddingVertical: 12, paddingHorizontal: 20 },
          text: { fontSize: Typography.fontSize.md },
          icon: 20,
        };
    }
  };
  
  const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          button: { backgroundColor: colors.secondary },
          text: { color: '#FFFFFF' },
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.primary,
          },
          text: { color: colors.primary },
        };
      case 'ghost':
        return {
          button: { backgroundColor: 'transparent' },
          text: { color: colors.primary },
        };
      case 'glass':
        return {
          button: {
            backgroundColor: colors.glass,
            borderWidth: 1,
            borderColor: colors.glassBorder,
          },
          text: { color: colors.textPrimary },
        };
      case 'viral':
        return {
          button: {
            backgroundColor: colors.viral,
            ...Shadows.glow(colors.viral, 0.4),
          },
          text: { color: '#FFFFFF' },
        };
      default:
        return {
          button: {},
          text: { color: '#FFFFFF' },
        };
    }
  };
  
  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  
  const isGradient = variant === 'primary' || gradient;
  const gradientColors = gradient || Gradients.primary;
  
  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sizeStyles.icon}
              color={variantStyles.text.color}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              variantStyles.text,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sizeStyles.icon}
              color={variantStyles.text.color}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </View>
  );
  
  if (isGradient) {
    return (
      <AnimatedPressable
        style={[
          animatedStyle,
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            sizeStyles.button,
            Shadows.md,
            fullWidth && styles.fullWidth,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }
  
  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        styles.button,
        sizeStyles.button,
        variantStyles.button,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {renderContent()}
    </AnimatedPressable>
  );
};

/**
 * IconButton - Circular icon button
 */
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'glass' | 'viral';
  active?: boolean;
  badge?: number;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  active = false,
  badge,
  style,
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };
  
  const getSizeValue = () => {
    switch (size) {
      case 'sm':
        return { container: 36, icon: 18 };
      case 'lg':
        return { container: 52, icon: 26 };
      default:
        return { container: 44, icon: 22 };
    }
  };
  
  const sizeValue = getSizeValue();
  
  const getBackgroundColor = () => {
    if (active) return colors.primary;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'glass':
        return colors.glass;
      case 'viral':
        return colors.viral;
      default:
        return colors.surface;
    }
  };
  
  const getIconColor = () => {
    if (active || variant === 'primary' || variant === 'viral') return '#FFFFFF';
    return colors.textSecondary;
  };
  
  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        styles.iconButton,
        {
          width: sizeValue.container,
          height: sizeValue.container,
          backgroundColor: getBackgroundColor(),
          borderColor: variant === 'glass' ? colors.glassBorder : 'transparent',
          borderWidth: variant === 'glass' ? 1 : 0,
        },
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Ionicons name={icon} size={sizeValue.icon} color={getIconColor()} />
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.viral }]}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

/**
 * ReactionButton - Animated reaction button with counter
 */
interface ReactionButtonProps {
  type: 'like' | 'fire' | 'wow' | 'copy' | 'generate';
  count: number;
  active?: boolean;
  onPress: () => void;
  size?: 'sm' | 'md';
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  type,
  count,
  active = false,
  onPress,
  size = 'md',
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePress = () => {
    scale.value = withSpring(1.3, { damping: 10, stiffness: 400 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    }, 100);
    onPress();
  };
  
  const getEmoji = () => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'fire':
        return '🔥';
      case 'wow':
        return '😮';
      case 'copy':
        return '📋';
      case 'generate':
        return '⚡';
    }
  };
  
  const getColor = () => {
    if (!active) return colors.textTertiary;
    return colors[type];
  };
  
  const isSmall = size === 'sm';
  
  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        styles.reactionButton,
        isSmall && styles.reactionButtonSmall,
        active && {
          backgroundColor:
            theme === 'dark'
              ? `${colors[type]}20`
              : `${colors[type]}15`,
        },
      ]}
      onPress={handlePress}
    >
      <Text style={[styles.reactionEmoji, isSmall && styles.reactionEmojiSmall]}>
        {getEmoji()}
      </Text>
      <Text
        style={[
          styles.reactionCount,
          isSmall && styles.reactionCountSmall,
          { color: getColor() },
        ]}
      >
        {formatCount(count)}
      </Text>
    </AnimatedPressable>
  );
};

const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  iconButton: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  reactionButtonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 18,
  },
  reactionEmojiSmall: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  reactionCountSmall: {
    fontSize: Typography.fontSize.xs,
  },
});

export default Button;
