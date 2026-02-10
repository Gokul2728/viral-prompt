/**
 * HomeScreen - Main discovery feed
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useAppStore } from '@/store';
import { Colors, Spacing, Typography, BorderRadius, Gradients } from '@/theme';
import { Prompt, PromptType, Platform, AITool } from '@/types';
import {
  PromptCard,
  ChipFilter,
  Header,
  OfflineBanner,
  EmptyState,
} from '@/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for demonstration
const MOCK_PROMPTS: Prompt[] = [
  {
    id: '1',
    text: 'A cyberpunk samurai standing in neon-lit Tokyo streets, rain reflecting colorful lights, ultra detailed, cinematic lighting, 8K',
    type: 'image',
    previewUrl: 'https://picsum.photos/800/600?random=1',
    previewType: 'image',
    platforms: ['youtube', 'reddit', 'twitter'],
    aiTools: ['midjourney', 'stable-diffusion'],
    tags: ['cyberpunk', 'samurai', 'neon'],
    style: 'cyberpunk',
    trendScore: 95,
    likes: 12500,
    fires: 8200,
    wows: 3400,
    copies: 5600,
    generates: 2100,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
    firstSeenAt: '2026-01-28T10:00:00Z',
    crossPlatformCount: 3,
    creatorCount: 45,
    engagementVelocity: 850,
    isApproved: true,
  },
  {
    id: '2',
    text: 'Cinematic drone shot flying through ancient ruins, golden hour lighting, mist in the air, epic scale, movie quality',
    type: 'video',
    previewUrl: 'https://picsum.photos/800/600?random=2',
    previewType: 'image',
    platforms: ['youtube', 'twitter', 'instagram'],
    aiTools: ['runway', 'sora'],
    tags: ['cinematic', 'ruins', 'epic'],
    style: 'cinematic',
    trendScore: 88,
    likes: 9800,
    fires: 6500,
    wows: 4200,
    copies: 3800,
    generates: 1500,
    createdAt: '2026-02-02T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
    firstSeenAt: '2026-01-30T10:00:00Z',
    crossPlatformCount: 3,
    creatorCount: 32,
    engagementVelocity: 720,
    isApproved: true,
  },
  {
    id: '3',
    text: 'Ethereal fairy garden with bioluminescent flowers, magical particles floating, dreamlike atmosphere, fantasy art style',
    type: 'image',
    previewUrl: 'https://picsum.photos/800/600?random=3',
    previewType: 'image',
    platforms: ['pinterest', 'reddit', 'lexica'],
    aiTools: ['midjourney', 'gemini'],
    tags: ['fantasy', 'fairy', 'magical'],
    style: 'fantasy',
    trendScore: 82,
    likes: 7600,
    fires: 4800,
    wows: 5100,
    copies: 2900,
    generates: 1800,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
    firstSeenAt: '2026-01-29T10:00:00Z',
    crossPlatformCount: 3,
    creatorCount: 28,
    engagementVelocity: 580,
    isApproved: true,
  },
  {
    id: '4',
    text: 'Smooth camera orbit around a floating island with waterfalls, clouds passing by, serene and peaceful, Studio Ghibli inspired',
    type: 'video',
    previewUrl: 'https://picsum.photos/800/600?random=4',
    previewType: 'image',
    platforms: ['youtube', 'twitter'],
    aiTools: ['pika', 'luma'],
    tags: ['ghibli', 'floating island', 'peaceful'],
    style: 'anime',
    trendScore: 76,
    likes: 5400,
    fires: 3200,
    wows: 4800,
    copies: 2100,
    generates: 980,
    createdAt: '2026-02-02T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
    firstSeenAt: '2026-01-31T10:00:00Z',
    crossPlatformCount: 2,
    creatorCount: 19,
    engagementVelocity: 420,
    isApproved: true,
  },
];

const TYPE_FILTERS = [
  { id: 'image', label: 'Images', icon: 'image' as const },
  { id: 'video', label: 'Videos', icon: 'videocam' as const },
];

const PLATFORM_FILTERS = [
  { id: 'youtube', label: 'YouTube', icon: 'logo-youtube' as const, color: '#FF0000' },
  { id: 'reddit', label: 'Reddit', icon: 'logo-reddit' as const, color: '#FF4500' },
  { id: 'twitter', label: 'X', icon: 'logo-twitter' as const, color: '#1DA1F2' },
  { id: 'pinterest', label: 'Pinterest', icon: 'logo-pinterest' as const, color: '#E60023' },
];

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  const isOnline = useAppStore((state) => state.isOnline);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const recordCopy = useAppStore((state) => state.recordCopy);
  const recordGeneration = useAppStore((state) => state.recordGeneration);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter prompts based on selections
  const filteredPrompts = MOCK_PROMPTS.filter((prompt) => {
    if (selectedTypes.length > 0 && !selectedTypes.includes(prompt.type)) {
      return false;
    }
    if (
      selectedPlatforms.length > 0 &&
      !prompt.platforms.some((p) => selectedPlatforms.includes(p))
    ) {
      return false;
    }
    return true;
  });
  
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);
  
  const handleTypeSelect = (id: string) => {
    if (id === 'all') {
      setSelectedTypes([]);
    } else {
      setSelectedTypes((prev) =>
        prev.includes(id) ? prev.filter((t) => t !== id) : [id]
      );
    }
  };
  
  const handlePlatformSelect = (id: string) => {
    if (id === 'all') {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      );
    }
  };
  
  const handlePromptPress = (prompt: Prompt) => {
    navigation.navigate('PromptDetail', { promptId: prompt.id });
  };
  
  const handleCopy = async (prompt: Prompt) => {
    await Clipboard.setStringAsync(prompt.text);
    recordCopy(prompt.id);
    // TODO: Show toast notification
  };
  
  const handleGenerate = (prompt: Prompt) => {
    recordGeneration(prompt.id);
    // Open Gemini with pre-filled prompt
    const geminiUrl = `https://gemini.google.com/app?prompt=${encodeURIComponent(prompt.text)}`;
    Linking.openURL(geminiUrl);
  };
  
  const renderHeader = () => (
    <View>
      {/* Greeting */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.greeting}>
        <Text style={[styles.greetingText, { color: colors.textSecondary }]}>
          Discover
        </Text>
        <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>
          Trending AI Prompts 🔥
        </Text>
      </Animated.View>
      
      {/* Offline banner */}
      {!isOnline && <OfflineBanner lastSyncTime={syncStatus.lastSyncAt} />}
      
      {/* Type filter */}
      <View style={styles.filterSection}>
        <ChipFilter
          options={TYPE_FILTERS}
          selectedIds={selectedTypes}
          onSelect={handleTypeSelect}
        />
      </View>
      
      {/* Platform filter */}
      <View style={styles.filterSection}>
        <ChipFilter
          options={PLATFORM_FILTERS}
          selectedIds={selectedPlatforms}
          onSelect={handlePlatformSelect}
          multiSelect
        />
      </View>
      
      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {filteredPrompts.length} prompts found
        </Text>
        <Pressable style={styles.sortButton}>
          <Ionicons name="funnel-outline" size={16} color={colors.textTertiary} />
          <Text style={[styles.sortText, { color: colors.textTertiary }]}>
            Trending
          </Text>
        </Pressable>
      </View>
    </View>
  );
  
  const renderPromptCard = ({ item, index }: { item: Prompt; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      style={styles.cardContainer}
    >
      <PromptCard
        prompt={item}
        onPress={() => handlePromptPress(item)}
        onCopy={() => handleCopy(item)}
        onGenerate={() => handleGenerate(item)}
      />
    </Animated.View>
  );
  
  const renderEmpty = () => (
    <EmptyState
      icon="search-outline"
      title="No prompts found"
      description="Try adjusting your filters or check back later for new trending prompts."
      actionTitle="Clear Filters"
      onAction={() => {
        setSelectedTypes([]);
        setSelectedPlatforms([]);
      }}
    />
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Viral Prompt"
        showNotification
        showSearch
        onNotification={() => navigation.navigate('Notifications')}
        onSearch={() => navigation.navigate('Search')}
      />
      
      <FlatList
        data={filteredPrompts}
        renderItem={renderPromptCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={isLoading ? null : renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredPrompts.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.huge,
  },
  emptyListContent: {
    flex: 1,
  },
  greeting: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greetingText: {
    fontSize: Typography.fontSize.md,
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
  },
  filterSection: {
    marginBottom: Spacing.xs,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  resultsCount: {
    fontSize: Typography.fontSize.sm,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: Typography.fontSize.sm,
  },
  cardContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
});

export default HomeScreen;
