/**
 * PromptDetailScreen - Full prompt view with generate option
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import { openGeminiWithPrompt } from '@/utils/gemini';
import { useAppStore } from '@/store';
import { Colors, Spacing, Typography, BorderRadius, Gradients, Shadows } from '@/theme';
import { Prompt, AITool, Platform } from '@/types';
import { GlassCard, Button, ReactionButton, Header, LoadingState } from '@/components';
import { usePromptById } from '@/hooks/useApi';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock data - in real app, fetch by ID
const MOCK_PROMPT: Prompt = {
  id: '1',
  text: 'A cyberpunk samurai standing in neon-lit Tokyo streets, rain reflecting colorful lights, ultra detailed, cinematic lighting, 8K, dramatic composition, blade runner aesthetic, volumetric fog, ray tracing',
  type: 'image',
  previewUrl: 'https://picsum.photos/800/1200?random=1',
  previewType: 'image',
  platforms: ['youtube', 'reddit', 'twitter', 'pinterest'],
  aiTools: ['midjourney', 'stable-diffusion', 'gemini'],
  tags: ['cyberpunk', 'samurai', 'neon', 'tokyo', 'cinematic'],
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
  crossPlatformCount: 4,
  creatorCount: 45,
  engagementVelocity: 850,
  isApproved: true,
};

export const PromptDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  const userReactions = useAppStore((state) => state.userReactions);
  const addReaction = useAppStore((state) => state.addReaction);
  const removeReaction = useAppStore((state) => state.removeReaction);
  const savedPromptIds = useAppStore((state) => state.savedPromptIds);
  const savePrompt = useAppStore((state) => state.savePrompt);
  const unsavePrompt = useAppStore((state) => state.unsavePrompt);
  const recordCopy = useAppStore((state) => state.recordCopy);
  const recordGeneration = useAppStore((state) => state.recordGeneration);
  
  const { promptId } = route.params;
  const { data: apiPrompt, loading } = usePromptById(promptId);
  const prompt = apiPrompt || MOCK_PROMPT;
  
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  
  if (loading && !apiPrompt) {
    return <LoadingState message="Loading prompt..." />;
  }
  
  const isSaved = savedPromptIds.includes(prompt.id);
  const reactions = userReactions[prompt.id] || [];
  
  const handleReaction = (type: 'like' | 'fire' | 'wow') => {
    if (reactions.includes(type)) {
      removeReaction(prompt.id, type);
    } else {
      addReaction(prompt.id, type);
    }
  };
  
  const handleSave = () => {
    if (isSaved) {
      unsavePrompt(prompt.id);
    } else {
      savePrompt(prompt.id);
    }
  };
  
  const handleCopy = async () => {
    await Clipboard.setStringAsync(prompt.text);
    recordCopy(prompt.id);
    // TODO: Show toast
  };
  
  const handleGenerate = () => {
    recordGeneration(prompt.id);
    // Open native Gemini app with prompt pre-filled
    openGeminiWithPrompt(prompt.text);
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this viral AI prompt:\n\n"${prompt.text}"\n\n🔥 ${prompt.trendScore} trend score`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };
  
  const handleFeedback = () => {
    navigation.navigate('Feedback', { promptId: prompt.id });
  };
  
  const renderPlatformBadges = () => {
    const platformConfig: Record<Platform, { icon: keyof typeof Ionicons.glyphMap; color: string; name: string }> = {
      youtube: { icon: 'logo-youtube', color: colors.youtube, name: 'YouTube' },
      reddit: { icon: 'logo-reddit', color: colors.reddit, name: 'Reddit' },
      twitter: { icon: 'logo-twitter', color: colors.twitter, name: 'X (Twitter)' },
      pinterest: { icon: 'logo-pinterest', color: colors.pinterest, name: 'Pinterest' },
      instagram: { icon: 'logo-instagram', color: colors.instagram, name: 'Instagram' },
      lexica: { icon: 'sparkles', color: colors.primary, name: 'Lexica' },
      krea: { icon: 'color-palette', color: colors.secondary, name: 'Krea' },
      prompthero: { icon: 'trophy', color: colors.accent, name: 'PromptHero' },
      civitai: { icon: 'cube', color: colors.stableDiffusion, name: 'CivitAI' },
      'nano-banana': { icon: 'flash', color: colors.pika, name: 'Nano Banana' },
    };
    
    return (
      <View style={styles.badgesContainer}>
        {prompt.platforms.map((platform) => {
          const config = platformConfig[platform];
          return (
            <View
              key={platform}
              style={[styles.platformBadge, { backgroundColor: `${config.color}20` }]}
            >
              <Ionicons name={config.icon} size={14} color={config.color} />
              <Text style={[styles.platformBadgeText, { color: config.color }]}>
                {config.name}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };
  
  const renderAIToolBadges = () => {
    const toolConfig: Record<AITool, { color: string; name: string }> = {
      gemini: { color: colors.gemini, name: 'Gemini' },
      midjourney: { color: colors.midjourney, name: 'Midjourney' },
      'stable-diffusion': { color: colors.stableDiffusion, name: 'Stable Diffusion' },
      runway: { color: colors.runway, name: 'Runway' },
      pika: { color: colors.pika, name: 'Pika' },
      luma: { color: colors.luma, name: 'Luma' },
      sora: { color: colors.sora, name: 'Sora' },
      veo: { color: colors.secondary, name: 'Veo' },
      'dall-e': { color: colors.primary, name: 'DALL-E' },
    };
    
    return (
      <View style={styles.badgesContainer}>
        {prompt.aiTools.map((tool) => {
          const config = toolConfig[tool];
          return (
            <View
              key={tool}
              style={[styles.toolBadge, { backgroundColor: config.color }]}
            >
              <Text style={styles.toolBadgeText}>{config.name}</Text>
            </View>
          );
        })}
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Full screen preview */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.previewContainer}>
        <ExpoImage
          source={{ uri: prompt.previewUrl }}
          style={styles.previewImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
          style={styles.previewOverlay}
        />
        
        {/* Header overlay */}
        <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BlurView intensity={50} tint="dark" style={styles.blurButton}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </BlurView>
          </Pressable>
          
          <View style={styles.headerActions}>
            <Pressable style={styles.actionButton} onPress={handleShare}>
              <BlurView intensity={50} tint="dark" style={styles.blurButton}>
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              </BlurView>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleSave}>
              <BlurView intensity={50} tint="dark" style={styles.blurButton}>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={isSaved ? colors.primary : '#FFFFFF'}
                />
              </BlurView>
            </Pressable>
          </View>
        </View>
        
        {/* Trend badge */}
        <View style={styles.trendBadgeContainer}>
          <View style={[styles.trendBadge, { backgroundColor: colors.viral }]}>
            <Ionicons name="flame" size={16} color="#FFFFFF" />
            <Text style={styles.trendBadgeText}>VIRAL</Text>
            <Text style={styles.trendScore}>{prompt.trendScore}</Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Content sheet */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(400)}
        style={[
          styles.contentSheet,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.sheetHandle} />
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          {/* Type & Stats */}
          <View style={styles.typeRow}>
            <View style={[styles.typeBadge, { backgroundColor: colors.midjourney }]}>
              <Ionicons name="image" size={14} color="#FFFFFF" />
              <Text style={styles.typeBadgeText}>IMAGE PROMPT</Text>
            </View>
            <Text style={[styles.statsText, { color: colors.textSecondary }]}>
              {prompt.creatorCount} creators • {prompt.crossPlatformCount} platforms
            </Text>
          </View>
          
          {/* Prompt text */}
          <GlassCard padding="lg" style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <Text style={[styles.promptLabel, { color: colors.textTertiary }]}>
                PROMPT
              </Text>
              <Pressable onPress={handleCopy}>
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
              </Pressable>
            </View>
            <Text
              style={[styles.promptText, { color: colors.textPrimary }]}
              numberOfLines={showFullPrompt ? undefined : 4}
            >
              {prompt.text}
            </Text>
            {prompt.text.length > 150 && (
              <Pressable onPress={() => setShowFullPrompt(!showFullPrompt)}>
                <Text style={[styles.showMore, { color: colors.primary }]}>
                  {showFullPrompt ? 'Show less' : 'Show more'}
                </Text>
              </Pressable>
            )}
          </GlassCard>
          
          {/* Reactions */}
          <View style={styles.reactionsRow}>
            <ReactionButton
              type="like"
              count={prompt.likes}
              active={reactions.includes('like')}
              onPress={() => handleReaction('like')}
            />
            <ReactionButton
              type="fire"
              count={prompt.fires}
              active={reactions.includes('fire')}
              onPress={() => handleReaction('fire')}
            />
            <ReactionButton
              type="wow"
              count={prompt.wows}
              active={reactions.includes('wow')}
              onPress={() => handleReaction('wow')}
            />
            <ReactionButton
              type="copy"
              count={prompt.copies}
              active={false}
              onPress={handleCopy}
            />
          </View>
          
          {/* Platform badges */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Seen On
            </Text>
            {renderPlatformBadges()}
          </View>
          
          {/* AI Tool badges */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Works With
            </Text>
            {renderAIToolBadges()}
          </View>
          
          {/* Tags */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Tags
            </Text>
            <View style={styles.tagsContainer}>
              {prompt.tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                >
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Feedback link */}
          <Pressable
            style={[styles.feedbackLink, { backgroundColor: colors.glass }]}
            onPress={handleFeedback}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>
              Rate this prompt
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </Pressable>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>
      
      {/* Generate button */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(400)}
        style={[styles.generateContainer, { paddingBottom: insets.bottom + Spacing.md }]}
      >
        <BlurView intensity={80} tint={theme === 'dark' ? 'dark' : 'light'} style={styles.generateBlur}>
          <LinearGradient
            colors={Gradients.primary as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateButton}
          >
            <Pressable style={styles.generatePressable} onPress={handleGenerate}>
              <Ionicons name="flash" size={24} color="#FFFFFF" />
              <Text style={styles.generateText}>Generate in Gemini</Text>
            </Pressable>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {},
  blurButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {},
  trendBadgeContainer: {
    position: 'absolute',
    bottom: 60,
    left: Spacing.lg,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  trendBadgeText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  trendScore: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  contentSheet: {
    flex: 1,
    marginTop: -40,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    ...Shadows.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sheetContent: {
    paddingHorizontal: Spacing.lg,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  statsText: {
    fontSize: Typography.fontSize.sm,
  },
  promptCard: {
    marginBottom: Spacing.lg,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  promptLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 1,
  },
  promptText: {
    fontSize: Typography.fontSize.md,
    lineHeight: 24,
  },
  showMore: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  platformBadgeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  toolBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
  },
  toolBadgeText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tagText: {
    fontSize: Typography.fontSize.sm,
  },
  feedbackLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  feedbackText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
  },
  generateContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  generateBlur: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  generateButton: {
    borderRadius: BorderRadius.button,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  generatePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: Spacing.sm,
  },
  generateText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
  },
});

export default PromptDetailScreen;
