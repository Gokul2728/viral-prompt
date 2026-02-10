/**
 * ClusterCard Component
 * Displays a viral prompt cluster with trend info
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/theme';
import { Cluster, ClusterStatus } from '@/types';

interface ClusterCardProps {
  cluster: Cluster;
  index?: number;
  onPress?: () => void;
}

const STATUS_GRADIENTS: Record<ClusterStatus, readonly [string, string]> = {
  viral: ['#FF6B6B', '#FF8E53'] as const,
  trending: ['#667EEA', '#764BA2'] as const,
  emerging: ['#11998E', '#38EF7D'] as const,
  stable: ['#606060', '#808080'] as const,
  declining: ['#404040', '#606060'] as const,
};

const STATUS_LABELS: Record<ClusterStatus, string> = {
  viral: 'VIRAL',
  trending: 'TRENDING',
  emerging: 'EMERGING',
  stable: 'STABLE',
  declining: 'DECLINING',
};

const STATUS_ICONS: Record<ClusterStatus, keyof typeof Ionicons.glyphMap> = {
  viral: 'flame',
  trending: 'trending-up',
  emerging: 'sparkles',
  stable: 'analytics',
  declining: 'trending-down',
};

function getPlatformIcon(platform: string): keyof typeof Ionicons.glyphMap {
  switch (platform.toLowerCase()) {
    case 'youtube': return 'logo-youtube';
    case 'reddit': return 'logo-reddit';
    case 'twitter': return 'logo-twitter';
    case 'instagram': return 'logo-instagram';
    case 'pinterest': return 'logo-pinterest';
    default: return 'globe-outline';
  }
}

export function ClusterCard({ cluster, index = 0, onPress }: ClusterCardProps) {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  // Get status config
  const statusGradient = STATUS_GRADIENTS[cluster.status];
  const statusLabel = STATUS_LABELS[cluster.status];
  const statusIcon = STATUS_ICONS[cluster.status];
  
  // Status color based on type
  const getStatusColor = () => {
    switch (cluster.status) {
      case 'viral': return colors.fire;
      case 'trending': return colors.primary;
      case 'emerging': return colors.wow;
      case 'stable': return colors.textSecondary;
      case 'declining': return colors.textMuted;
      default: return colors.textSecondary;
    }
  };
  
  // Generate preview from visual features
  const mainSubject = cluster.visualFeatures.subjects[0] || 'Trend';
  const mainStyle = cluster.visualFeatures.style[0] || '';
  const mainEmotion = cluster.visualFeatures.emotion[0] || '';
  
  return (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed,
        ]}
      >
        <LinearGradient
          colors={[colors.surfaceElevated, colors.surface]}
          style={[styles.gradient, { borderColor: colors.glassBorder }]}
        >
          {/* Status Badge */}
          <LinearGradient
            colors={statusGradient}
            style={styles.statusBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons
              name={statusIcon}
              size={12}
              color="#FFFFFF"
            />
            <Text style={styles.statusText}>{statusLabel}</Text>
          </LinearGradient>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Title */}
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
              {cluster.name || `${mainSubject} ${mainStyle} ${mainEmotion}`.trim()}
            </Text>

            {/* Generated Prompt Preview */}
            <Text style={[styles.promptPreview, { color: colors.textSecondary }]} numberOfLines={3}>
              {cluster.generatedPrompt}
            </Text>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {cluster.visualFeatures.subjects.slice(0, 3).map((tag, i) => (
                <View key={i} style={[styles.tag, { backgroundColor: colors.surfaceHighlight }]}>
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
                </View>
              ))}
              {cluster.visualFeatures.style.slice(0, 2).map((tag, i) => (
                <View key={`style-${i}`} style={[styles.tag, { backgroundColor: colors.primaryLight + '30' }]}>
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Metrics Row */}
            <View style={[styles.metricsRow, { borderTopColor: colors.glassBorder }]}>
              {/* Trend Score */}
              <View style={styles.metricItem}>
                <Ionicons
                  name="flash"
                  size={16}
                  color={getStatusColor()}
                />
                <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{cluster.trendScore}</Text>
                <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>Score</Text>
              </View>

              {/* Cross-Platform */}
              <View style={styles.metricItem}>
                <Ionicons
                  name="globe-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                  {cluster.metrics.platformCount}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>Platforms</Text>
              </View>

              {/* Creators */}
              <View style={styles.metricItem}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                  {cluster.metrics.creatorCount}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>Creators</Text>
              </View>

              {/* Posts */}
              <View style={styles.metricItem}>
                <Ionicons
                  name="images-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                  {cluster.metrics.totalPosts}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>Posts</Text>
              </View>
            </View>

            {/* Platforms */}
            <View style={styles.platformsRow}>
              {cluster.platforms.map((platform, i) => (
                <View key={i} style={[styles.platformBadge, { backgroundColor: colors.background }]}>
                  <Ionicons
                    name={getPlatformIcon(platform)}
                    size={12}
                    color={colors.textTertiary}
                  />
                  <Text style={[styles.platformText, { color: colors.textTertiary }]}>{platform}</Text>
                </View>
              ))}
            </View>

            {/* Media Type Badge */}
            <View style={[styles.mediaTypeBadge, { backgroundColor: colors.background }]}>
              <Ionicons
                name={cluster.mediaType === 'video' ? 'videocam' : 'image'}
                size={14}
                color={colors.textSecondary}
              />
              <Text style={[styles.mediaTypeText, { color: colors.textSecondary }]}>
                {cluster.mediaType.toUpperCase()}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomRightRadius: BorderRadius.md,
    gap: 4,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  promptPreview: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    marginBottom: Spacing.sm,
  },
  metricItem: {
    alignItems: 'center',
    gap: 2,
  },
  metricValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  platformsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  platformText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  mediaTypeBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  mediaTypeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
});

export default ClusterCard;
