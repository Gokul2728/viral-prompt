/**
 * TrendingScreen - Charts & Rankings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';
import { Colors, Spacing, Typography, BorderRadius, Gradients, Shadows } from '@/theme';
import { Prompt, ChartPeriod, ChartCategory } from '@/types';
import { Header, GlassCard, PromptCardMini, ChipFilter } from '@/components';

// Mock data
const MOCK_CHART_DATA: Prompt[] = [
  {
    id: '1',
    text: 'A cyberpunk samurai standing in neon-lit Tokyo streets, rain reflecting colorful lights',
    type: 'image',
    previewUrl: 'https://picsum.photos/200/200?random=1',
    thumbnailUrl: 'https://picsum.photos/100/100?random=1',
    previewType: 'image',
    platforms: ['youtube', 'reddit'],
    aiTools: ['midjourney'],
    tags: ['cyberpunk'],
    trendScore: 98,
    likes: 15200,
    fires: 9800,
    wows: 4500,
    copies: 6200,
    generates: 2800,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
    firstSeenAt: '2026-01-28T10:00:00Z',
    crossPlatformCount: 2,
    creatorCount: 52,
    engagementVelocity: 920,
    isApproved: true,
  },
  {
    id: '2',
    text: 'Ethereal goddess emerging from cosmic nebula, divine lighting, photorealistic',
    type: 'image',
    previewUrl: 'https://picsum.photos/200/200?random=2',
    thumbnailUrl: 'https://picsum.photos/100/100?random=2',
    previewType: 'image',
    platforms: ['twitter', 'pinterest'],
    aiTools: ['stable-diffusion'],
    tags: ['cosmic'],
    trendScore: 94,
    likes: 12800,
    fires: 7600,
    wows: 5200,
    copies: 4800,
    generates: 2100,
    createdAt: '2026-02-02T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
    firstSeenAt: '2026-01-29T10:00:00Z',
    crossPlatformCount: 2,
    creatorCount: 38,
    engagementVelocity: 780,
    isApproved: true,
  },
  {
    id: '3',
    text: 'Cinematic drone shot of ancient temple in mist, golden hour, epic scale',
    type: 'video',
    previewUrl: 'https://picsum.photos/200/200?random=3',
    thumbnailUrl: 'https://picsum.photos/100/100?random=3',
    previewType: 'image',
    platforms: ['youtube'],
    aiTools: ['runway', 'sora'],
    tags: ['cinematic'],
    trendScore: 91,
    likes: 11200,
    fires: 8100,
    wows: 4800,
    copies: 3900,
    generates: 1850,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
    firstSeenAt: '2026-01-30T10:00:00Z',
    crossPlatformCount: 1,
    creatorCount: 29,
    engagementVelocity: 650,
    isApproved: true,
  },
  {
    id: '4',
    text: 'Magical forest with bioluminescent creatures, fairy tale atmosphere',
    type: 'image',
    previewUrl: 'https://picsum.photos/200/200?random=4',
    thumbnailUrl: 'https://picsum.photos/100/100?random=4',
    previewType: 'image',
    platforms: ['pinterest', 'lexica'],
    aiTools: ['midjourney', 'gemini'],
    tags: ['fantasy'],
    trendScore: 87,
    likes: 9800,
    fires: 5400,
    wows: 6100,
    copies: 3200,
    generates: 1600,
    createdAt: '2026-02-02T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
    firstSeenAt: '2026-01-31T10:00:00Z',
    crossPlatformCount: 2,
    creatorCount: 24,
    engagementVelocity: 520,
    isApproved: true,
  },
  {
    id: '5',
    text: 'Steampunk airship fleet battle above Victorian London, dramatic clouds',
    type: 'image',
    previewUrl: 'https://picsum.photos/200/200?random=5',
    thumbnailUrl: 'https://picsum.photos/100/100?random=5',
    previewType: 'image',
    platforms: ['reddit', 'civitai'],
    aiTools: ['stable-diffusion'],
    tags: ['steampunk'],
    trendScore: 84,
    likes: 8500,
    fires: 4900,
    wows: 3800,
    copies: 2800,
    generates: 1400,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
    firstSeenAt: '2026-01-29T10:00:00Z',
    crossPlatformCount: 2,
    creatorCount: 21,
    engagementVelocity: 480,
    isApproved: true,
  },
];

const PERIOD_OPTIONS = [
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'all-time', label: 'All Time' },
];

const CATEGORY_OPTIONS = [
  { id: 'trending', label: '🔥 Trending', icon: 'trending-up' as const },
  { id: 'most-liked', label: '❤️ Most Liked', icon: 'heart' as const },
  { id: 'most-copied', label: '📋 Most Copied', icon: 'copy' as const },
  { id: 'most-generated', label: '⚡ Most Generated', icon: 'flash' as const },
];

export const TrendingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<ChartCategory>('trending');
  
  const handlePeriodSelect = (id: string) => {
    if (id !== 'all') {
      setSelectedPeriod(id as ChartPeriod);
    }
  };
  
  const handleCategorySelect = (category: ChartCategory) => {
    setSelectedCategory(category);
  };
  
  const handlePromptPress = (prompt: Prompt) => {
    navigation.navigate('PromptDetail', { promptId: prompt.id });
  };
  
  const renderTopThree = () => (
    <View style={styles.topThreeContainer}>
      {/* Second place */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.topThreeItem}
      >
        <GlassCard style={styles.topCard} padding="md">
          <View style={[styles.rankBadge, styles.rankSecond]}>
            <Text style={styles.rankNumber}>2</Text>
          </View>
          <View style={styles.topCardImage}>
            <Animated.Image
              source={{ uri: MOCK_CHART_DATA[1]?.previewUrl }}
              style={styles.topCardImageInner}
            />
          </View>
          <Text style={[styles.topCardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {MOCK_CHART_DATA[1]?.text}
          </Text>
          <Text style={[styles.topCardStats, { color: colors.textSecondary }]}>
            ❤️ {formatCount(MOCK_CHART_DATA[1]?.likes || 0)}
          </Text>
        </GlassCard>
      </Animated.View>
      
      {/* First place */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={[styles.topThreeItem, styles.topThreeFirst]}
      >
        <LinearGradient
          colors={Gradients.primary as [string, string, ...string[]]}
          style={styles.topCardGradientBorder}
        >
          <View style={[styles.topCardFirst, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={[styles.rankBadge, styles.rankFirst]}>
              <Text style={styles.rankNumber}>1</Text>
              <Text style={styles.crownEmoji}>👑</Text>
            </View>
            <View style={styles.topCardImageFirst}>
              <Animated.Image
                source={{ uri: MOCK_CHART_DATA[0]?.previewUrl }}
                style={styles.topCardImageInner}
              />
            </View>
            <Text style={[styles.topCardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
              {MOCK_CHART_DATA[0]?.text}
            </Text>
            <View style={styles.topCardStatsRow}>
              <Text style={[styles.topCardStats, { color: colors.textSecondary }]}>
                ❤️ {formatCount(MOCK_CHART_DATA[0]?.likes || 0)}
              </Text>
              <Text style={[styles.topCardStats, { color: colors.textSecondary }]}>
                🔥 {MOCK_CHART_DATA[0]?.trendScore}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Third place */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={styles.topThreeItem}
      >
        <GlassCard style={styles.topCard} padding="md">
          <View style={[styles.rankBadge, styles.rankThird]}>
            <Text style={styles.rankNumber}>3</Text>
          </View>
          <View style={styles.topCardImage}>
            <Animated.Image
              source={{ uri: MOCK_CHART_DATA[2]?.previewUrl }}
              style={styles.topCardImageInner}
            />
          </View>
          <Text style={[styles.topCardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {MOCK_CHART_DATA[2]?.text}
          </Text>
          <Text style={[styles.topCardStats, { color: colors.textSecondary }]}>
            ❤️ {formatCount(MOCK_CHART_DATA[2]?.likes || 0)}
          </Text>
        </GlassCard>
      </Animated.View>
    </View>
  );
  
  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryTabs}
    >
      {CATEGORY_OPTIONS.map((category) => {
        const isSelected = category.id === selectedCategory;
        return (
          <Pressable
            key={category.id}
            style={[
              styles.categoryTab,
              {
                backgroundColor: isSelected ? colors.primary : colors.glass,
                borderColor: isSelected ? colors.primary : colors.glassBorder,
              },
            ]}
            onPress={() => handleCategorySelect(category.id as ChartCategory)}
          >
            <Text
              style={[
                styles.categoryTabText,
                { color: isSelected ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Charts" subtitle="Top trending prompts" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period filter */}
        <ChipFilter
          options={PERIOD_OPTIONS}
          selectedIds={[selectedPeriod]}
          onSelect={handlePeriodSelect}
          showAll={false}
        />
        
        {/* Top 3 podium */}
        {renderTopThree()}
        
        {/* Category tabs */}
        {renderCategoryTabs()}
        
        {/* Rankings list */}
        <View style={styles.rankingsList}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Full Rankings
          </Text>
          
          {MOCK_CHART_DATA.slice(3).map((prompt, index) => (
            <Animated.View
              key={prompt.id}
              entering={FadeInRight.delay(index * 100).duration(400)}
            >
              <PromptCardMini
                prompt={prompt}
                rank={index + 4}
                onPress={() => handlePromptPress(prompt)}
              />
              <View style={{ height: Spacing.sm }} />
            </Animated.View>
          ))}
        </View>
        
        {/* Stats summary */}
        <View style={styles.statsContainer}>
          <GlassCard borderGradient padding="lg">
            <Text style={[styles.statsTitle, { color: colors.textPrimary }]}>
              This Week's Stats
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  1.2M
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total Likes
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.secondary }]}>
                  456K
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Copies
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  189K
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Generates
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.viral }]}>
                  892
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  New Prompts
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>
        
        <View style={{ height: Spacing.huge }} />
      </ScrollView>
    </View>
  );
};

const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  topThreeItem: {
    flex: 1,
  },
  topThreeFirst: {
    marginBottom: 20,
  },
  topCard: {
    alignItems: 'center',
  },
  topCardGradientBorder: {
    borderRadius: BorderRadius.card,
    padding: 2,
    ...Shadows.lg,
  },
  topCardFirst: {
    borderRadius: BorderRadius.card - 2,
    padding: Spacing.md,
    alignItems: 'center',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -14,
    zIndex: 1,
  },
  rankFirst: {
    backgroundColor: '#FFD700',
    width: 36,
    height: 36,
    borderRadius: 18,
    top: -18,
  },
  rankSecond: {
    backgroundColor: '#C0C0C0',
  },
  rankThird: {
    backgroundColor: '#CD7F32',
  },
  rankNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: '#000000',
  },
  crownEmoji: {
    fontSize: 12,
    position: 'absolute',
    top: -14,
  },
  topCardImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  topCardImageFirst: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  topCardImageInner: {
    width: '100%',
    height: '100%',
  },
  topCardTitle: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  topCardStats: {
    fontSize: Typography.fontSize.xs,
  },
  topCardStatsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  categoryTabs: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  categoryTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  rankingsList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  statsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  statsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
  },
});

export default TrendingScreen;
