/**
 * OfflineBanner - Elegant offline status indicator
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  FadeInDown,
  FadeOutUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';
import { Colors, BorderRadius, Spacing, Typography } from '@/theme';

interface OfflineBannerProps {
  lastSyncTime?: string | null;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ lastSyncTime }) => {
  const theme = useAppStore((state) => state.theme);
  const isOnline = useAppStore((state) => state.isOnline);
  const colors = Colors[theme];
  
  const pulse = useSharedValue(1);
  
  useEffect(() => {
    if (!isOnline) {
      pulse.value = withRepeat(
        withSequence(
          withSpring(1.1, { damping: 5 }),
          withSpring(1, { damping: 5 })
        ),
        -1,
        true
      );
    }
  }, [isOnline]);
  
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  
  if (isOnline) return null;
  
  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never synced';
    
    const date = new Date(lastSyncTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
  
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      exiting={FadeOutUp.springify().damping(15)}
      style={[
        styles.container,
        {
          backgroundColor:
            theme === 'dark'
              ? 'rgba(239, 68, 68, 0.15)'
              : 'rgba(239, 68, 68, 0.1)',
          borderColor:
            theme === 'dark'
              ? 'rgba(239, 68, 68, 0.3)'
              : 'rgba(239, 68, 68, 0.2)',
        },
      ]}
    >
      <Animated.View style={pulseStyle}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-offline" size={18} color="#EF4444" />
        </View>
      </Animated.View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: '#EF4444' }]}>
          You're Offline
        </Text>
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
          Showing cached content • Last sync: {formatLastSync()}
        </Text>
      </View>
      
      <View style={styles.indicator}>
        <View style={styles.indicatorDot} />
      </View>
    </Animated.View>
  );
};

/**
 * SyncStatusBadge - Compact sync status indicator
 */
interface SyncStatusBadgeProps {
  variant?: 'inline' | 'floating';
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  variant = 'inline',
}) => {
  const theme = useAppStore((state) => state.theme);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const isOnline = useAppStore((state) => state.isOnline);
  const colors = Colors[theme];
  
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: 'cloud-offline' as const,
        color: '#EF4444',
        label: 'Offline',
      };
    }
    if (syncStatus.pendingChanges > 0) {
      return {
        icon: 'sync' as const,
        color: '#F59E0B',
        label: `${syncStatus.pendingChanges} pending`,
      };
    }
    return {
      icon: 'checkmark-circle' as const,
      color: '#10B981',
      label: 'Synced',
    };
  };
  
  const config = getStatusConfig();
  
  if (variant === 'floating') {
    return (
      <View
        style={[
          styles.floatingBadge,
          {
            backgroundColor: `${config.color}20`,
            borderColor: `${config.color}40`,
          },
        ]}
      >
        <Ionicons name={config.icon} size={14} color={config.color} />
      </View>
    );
  }
  
  return (
    <View
      style={[
        styles.inlineBadge,
        { backgroundColor: `${config.color}15` },
      ]}
    >
      <Ionicons name={config.icon} size={14} color={config.color} />
      <Text style={[styles.badgeText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

/**
 * CacheIndicator - Shows cached content indicator on cards
 */
export const CacheIndicator: React.FC = () => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  return (
    <View
      style={[
        styles.cacheIndicator,
        { backgroundColor: colors.glass, borderColor: colors.glassBorder },
      ]}
    >
      <Ionicons name="download-outline" size={12} color={colors.textTertiary} />
      <Text style={[styles.cacheText, { color: colors.textTertiary }]}>
        Cached
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  // Badge styles
  floatingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  // Cache indicator
  cacheIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    gap: 4,
  },
  cacheText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default OfflineBanner;
