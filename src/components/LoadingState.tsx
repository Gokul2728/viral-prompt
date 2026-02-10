/**
 * LoadingState & EmptyState Components
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/store';
import { Colors, BorderRadius, Spacing, Typography, Gradients } from '@/theme';
import { Button } from './Button';

/**
 * LoadingState - Full screen loading indicator
 */
interface LoadingStateProps {
  message?: string;
  variant?: 'default' | 'overlay' | 'inline';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  variant = 'default',
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const rotation = useSharedValue(0);
  
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1500 }),
      -1,
      false
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  
  if (variant === 'inline') {
    return (
      <View style={styles.inlineContainer}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={[styles.inlineText, { color: colors.textSecondary }]}>
          {message}
        </Text>
      </View>
    );
  }
  
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        styles.container,
        variant === 'overlay' && styles.overlay,
        { backgroundColor: variant === 'overlay' ? 'rgba(0,0,0,0.7)' : colors.background },
      ]}
    >
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={Gradients.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loaderGradient}
        >
          <View
            style={[
              styles.loaderInner,
              { backgroundColor: variant === 'overlay' ? 'rgba(0,0,0,0.9)' : colors.background },
            ]}
          />
        </LinearGradient>
      </Animated.View>
      
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

/**
 * SkeletonLoader - Content placeholder
 */
interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.md,
  style,
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const opacity = useSharedValue(0.3);
  
  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surface,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

/**
 * PromptCardSkeleton - Skeleton for prompt cards
 */
export const PromptCardSkeleton: React.FC = () => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  return (
    <View
      style={[
        styles.cardSkeleton,
        { backgroundColor: colors.glass, borderColor: colors.glassBorder },
      ]}
    >
      <SkeletonLoader height={180} borderRadius={BorderRadius.lg} />
      <View style={styles.cardSkeletonContent}>
        <View style={styles.cardSkeletonRow}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader width={24} height={24} borderRadius={12} />
        </View>
        <SkeletonLoader width="90%" height={16} />
        <SkeletonLoader width="70%" height={16} />
        <View style={styles.cardSkeletonRow}>
          <SkeletonLoader width={60} height={24} borderRadius={BorderRadius.full} />
          <SkeletonLoader width={60} height={24} borderRadius={BorderRadius.full} />
          <SkeletonLoader width={80} height={32} borderRadius={BorderRadius.button} />
        </View>
      </View>
    </View>
  );
};

/**
 * EmptyState - Empty content placeholder
 */
interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'offline' | 'error';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionTitle,
  onAction,
  variant = 'default',
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const getDefaultIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (variant) {
      case 'search':
        return 'search-outline';
      case 'offline':
        return 'cloud-offline-outline';
      case 'error':
        return 'warning-outline';
      default:
        return 'albums-outline';
    }
  };
  
  const getIconColor = () => {
    switch (variant) {
      case 'error':
        return colors.error;
      case 'offline':
        return colors.warning;
      default:
        return colors.textTertiary;
    }
  };
  
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          {
            backgroundColor:
              theme === 'dark'
                ? `${getIconColor()}20`
                : `${getIconColor()}10`,
          },
        ]}
      >
        <Ionicons
          name={icon || getDefaultIcon()}
          size={48}
          color={getIconColor()}
        />
      </View>
      
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      
      {description && (
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}
      
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="md"
          style={{ marginTop: Spacing.lg }}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  loaderGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 3,
  },
  loaderInner: {
    flex: 1,
    borderRadius: 27,
  },
  message: {
    fontSize: Typography.fontSize.md,
    marginTop: Spacing.lg,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  inlineText: {
    fontSize: Typography.fontSize.sm,
  },
  // Skeleton styles
  cardSkeleton: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardSkeletonContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardSkeletonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
