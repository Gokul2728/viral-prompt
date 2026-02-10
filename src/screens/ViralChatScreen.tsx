/**
 * ViralChatScreen - Fun viral prompts section
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { useAppStore } from '@/store';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { ViralChat } from '@/types';
import { Header, ViralChatCard, ViralChatCardMini, GlassCard, ChipFilter } from '@/components';
import { useViralChats } from '@/hooks/useApi';
import { openGeminiWithPrompt } from '@/utils/gemini';

// Mock data
const MOCK_VIRAL_CHATS: ViralChat[] = [
  {
    id: '1',
    title: 'Roast Me as a Movie Villain',
    description: 'Turn any name into a dramatic movie villain roast with epic dialogue',
    example: 'Roast [Your Name] as if they were the main villain in a Christopher Nolan film',
    category: 'roast',
    uses: 45200,
    likes: 12800,
    fires: 8900,
    wows: 5600,
    copies: 9200,
    createdAt: '2026-01-28T10:00:00Z',
    isViral: true,
    trendScore: 96,
  },
  {
    id: '2',
    title: 'Cyberpunk Character Generator',
    description: 'Transform any name into a detailed cyberpunk character with backstory',
    example: 'Turn [Name] into a cyberpunk hacker with augmented reality eyes and a secret past',
    category: 'transform',
    uses: 38500,
    likes: 10200,
    fires: 7800,
    wows: 6100,
    copies: 7600,
    createdAt: '2026-01-29T10:00:00Z',
    isViral: true,
    trendScore: 92,
  },
  {
    id: '3',
    title: 'Anime Protagonist Maker',
    description: 'Create an anime protagonist with special abilities based on personality',
    example: 'Create an anime protagonist version of [Name] with hidden powers awakening',
    category: 'transform',
    uses: 32100,
    likes: 9500,
    fires: 6200,
    wows: 7800,
    copies: 6400,
    createdAt: '2026-01-30T10:00:00Z',
    isViral: false,
    trendScore: 88,
  },
  {
    id: '4',
    title: 'Describe Me as a Food',
    description: 'Get a hilarious food-based personality description',
    example: 'Describe [Name]\'s personality as if they were a gourmet dish',
    category: 'describe',
    uses: 28900,
    likes: 8100,
    fires: 5400,
    wows: 9200,
    copies: 5800,
    createdAt: '2026-01-31T10:00:00Z',
    isViral: false,
    trendScore: 84,
  },
  {
    id: '5',
    title: 'Guess the Prompt Game',
    description: 'Generate an image and let friends guess the prompt',
    example: 'Create a mysterious scene that could have multiple interpretations',
    category: 'game',
    uses: 24500,
    likes: 7200,
    fires: 4800,
    wows: 4500,
    copies: 4900,
    createdAt: '2026-02-01T10:00:00Z',
    isViral: false,
    trendScore: 79,
  },
  {
    id: '6',
    title: 'Pet as Renaissance Art',
    description: 'Transform your pet into a majestic Renaissance painting',
    example: 'Paint [Pet Name] as a noble aristocrat in Renaissance Italy',
    category: 'fun',
    uses: 21800,
    likes: 11500,
    fires: 3200,
    wows: 8900,
    copies: 4200,
    createdAt: '2026-02-02T10:00:00Z',
    isViral: false,
    trendScore: 75,
  },
];

const CATEGORY_OPTIONS = [
  { id: 'roast', label: '🔥 Roast' },
  { id: 'transform', label: '✨ Transform' },
  { id: 'describe', label: '👁️ Describe' },
  { id: 'game', label: '🎮 Games' },
  { id: 'fun', label: '😄 Fun' },
];

export const ViralChatScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const { data: apiChats, loading, refetch } = useViralChats();
  const allChats = (apiChats && apiChats.length > 0) ? apiChats : MOCK_VIRAL_CHATS;
  
  const filteredChats = selectedCategories.length > 0
    ? allChats.filter((chat) => selectedCategories.includes(chat.category))
    : allChats;
  
  const viralChats = allChats.filter((chat) => chat.isViral);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  const handleCategorySelect = (id: string) => {
    if (id === 'all') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories((prev) =>
        prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
      );
    }
  };
  
  const handleChatPress = (chat: ViralChat) => {
    navigation.navigate('ViralChatDetail', { chatId: chat.id });
  };
  
  const handleCopy = async (chat: ViralChat) => {
    await Clipboard.setStringAsync(chat.example);
    // TODO: Show toast
  };
  
  const renderHeader = () => (
    <View>
      {/* Hero section */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.heroSection}
      >
        <Text style={styles.heroEmoji}>🎭</Text>
        <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
          Viral Chat Prompts
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          Fun prompts to roast, transform, and create magic with AI
        </Text>
      </Animated.View>
      
      {/* Trending section */}
      <View style={styles.trendingSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          🔥 Trending Now
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingScroll}
        >
          {viralChats.map((chat, index) => (
            <Animated.View
              key={chat.id}
              entering={FadeInDown.delay(index * 100).duration(400)}
            >
              <ViralChatCardMini
                chat={chat}
                onPress={() => handleChatPress(chat)}
              />
            </Animated.View>
          ))}
        </ScrollView>
      </View>
      
      {/* Category filter */}
      <ChipFilter
        options={CATEGORY_OPTIONS}
        selectedIds={selectedCategories}
        onSelect={handleCategorySelect}
        multiSelect
      />
      
      {/* Section title */}
      <View style={styles.allPromptsHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          All Prompts
        </Text>
        <Text style={[styles.promptCount, { color: colors.textTertiary }]}>
          {filteredChats.length} prompts
        </Text>
      </View>
    </View>
  );
  
  const renderChatCard = ({ item, index }: { item: ViralChat; index: number }) => (
    <View style={styles.cardContainer}>
      <ViralChatCard
        chat={item}
        index={index}
        onPress={() => handleChatPress(item)}
        onCopy={() => handleCopy(item)}
      />
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Viral Chat" showSearch onSearch={() => navigation.navigate('Search')} />
      
      <FlatList
        data={filteredChats}
        renderItem={renderChatCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
  },
  trendingSection: {
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  trendingScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  allPromptsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  promptCount: {
    fontSize: Typography.fontSize.sm,
  },
  cardContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});

export default ViralChatScreen;
