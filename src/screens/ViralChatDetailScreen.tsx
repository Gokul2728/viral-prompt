/**
 * ViralChatDetailScreen - Full view of a viral chat prompt
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { openGeminiWithPrompt } from '@/utils/gemini';
import { useAppStore } from '@/store';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/theme';
import { ViralChat } from '@/types';
import { GlassCard, Button, Header } from '@/components';

// Mock data - in real app, fetch by ID
const MOCK_CHATS: Record<string, ViralChat> = {
  '1': {
    id: '1',
    title: 'Roast Me as a Movie Villain',
    description: 'Turn any name into a dramatic movie villain roast with epic dialogue. Perfect for social media posts and fun interactions with AI.',
    example: 'Roast [Your Name] as if they were the main villain in a Christopher Nolan film. Include dramatic monologue, villain backstory, and a plot twist.',
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
  '2': {
    id: '2',
    title: 'Cyberpunk Character Generator',
    description: 'Transform any name into a detailed cyberpunk character with augmented abilities, a unique backstory, and a hidden agenda.',
    example: 'Turn [Name] into a cyberpunk hacker with augmented reality eyes and a secret past. Include their street name, abilities, and nemesis.',
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
};

export const ViralChatDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];

  const { chatId } = route.params;
  const chat = MOCK_CHATS[chatId] || MOCK_CHATS['1'];

  const [copied, setCopied] = useState(false);

  const getCategoryConfig = () => {
    const configs: Record<string, { gradient: [string, string]; emoji: string }> = {
      roast: { gradient: ['#FF6B6B', '#FF8E53'], emoji: '🔥' },
      transform: { gradient: ['#8B5CF6', '#06B6D4'], emoji: '✨' },
      describe: { gradient: ['#10B981', '#3B82F6'], emoji: '👁️' },
      game: { gradient: ['#F59E0B', '#EF4444'], emoji: '🎮' },
      fun: { gradient: ['#EC4899', '#8B5CF6'], emoji: '😄' },
    };
    return configs[chat.category] || configs.fun;
  };

  const config = getCategoryConfig();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(chat.example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    openGeminiWithPrompt(chat.example);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this viral AI prompt:\n\n🎭 ${chat.title}\n\n"${chat.example}"\n\n🔥 Trend Score: ${chat.trendScore}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Viral Prompt"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={[styles.heroCard, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.heroHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: `${config.gradient[0]}20` }]}>
                  <Text style={styles.categoryEmoji}>{config.emoji}</Text>
                  <Text style={[styles.categoryText, { color: config.gradient[0] }]}>
                    {chat.category.toUpperCase()}
                  </Text>
                </View>
                {chat.isViral && (
                  <View style={[styles.viralBadge, { backgroundColor: colors.viral }]}>
                    <Ionicons name="flame" size={14} color="#FFFFFF" />
                    <Text style={styles.viralText}>VIRAL</Text>
                    <Text style={styles.trendScore}>{chat.trendScore}</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {chat.title}
              </Text>

              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {chat.description}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Prompt Example */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <GlassCard padding="lg">
            <View style={styles.promptHeader}>
              <Text style={[styles.promptLabel, { color: colors.textTertiary }]}>
                EXAMPLE PROMPT
              </Text>
              <Pressable onPress={handleCopy} style={styles.copyInlineBtn}>
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color={copied ? colors.success : colors.primary}
                />
              </Pressable>
            </View>
            <Text style={[styles.promptText, { color: colors.textPrimary }]}>
              "{chat.example}"
            </Text>
            {copied && (
              <Text style={[styles.copiedText, { color: colors.success }]}>
                Copied to clipboard!
              </Text>
            )}
          </GlassCard>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <GlassCard padding="lg">
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Stats
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>🎯</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {formatCount(chat.uses)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Uses
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>❤️</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {formatCount(chat.likes)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Likes
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {formatCount(chat.fires)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Fires
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>📋</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {formatCount(chat.copies)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Copies
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.actionsContainer}>
          {/* Copy Button */}
          <Button
            title={copied ? 'Copied!' : 'Copy Prompt'}
            onPress={handleCopy}
            variant="glass"
            icon={copied ? 'checkmark-circle' : 'copy-outline'}
            fullWidth
          />

          {/* Share Button */}
          <Button
            title="Share"
            onPress={handleShare}
            variant="outline"
            icon="share-outline"
            fullWidth
          />
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Generate FAB */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(400)}
        style={[styles.generateContainer, { paddingBottom: insets.bottom + Spacing.md }]}
      >
        <Pressable onPress={handleGenerate}>
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateButton}
          >
            <Ionicons name="flash" size={24} color="#FFFFFF" />
            <Text style={styles.generateText}>Generate in Gemini</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  heroGradient: {
    borderRadius: BorderRadius.card,
    padding: 1.5,
    ...Shadows.lg,
  },
  heroCard: {
    borderRadius: BorderRadius.card - 1,
    padding: Spacing.xl,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  viralBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  viralText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  trendScore: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  title: {
    fontSize: Typography.fontSize.display,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.md,
    lineHeight: 24,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  promptLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 1,
  },
  copyInlineBtn: {
    padding: Spacing.xs,
  },
  promptText: {
    fontSize: Typography.fontSize.lg,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  copiedText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  generateContainer: {
    position: 'absolute',
    bottom: 0,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: BorderRadius.button,
    gap: Spacing.sm,
    ...Shadows.lg,
  },
  generateText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
  },
});

export default ViralChatDetailScreen;
