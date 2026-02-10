/**
 * ViralChatCard - Fun viral prompt cards for social features
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '@/theme';
import { ViralChat } from '@/types';

interface ViralChatCardProps {
  chat: ViralChat;
  index: number;
  onPress: () => void;
  onCopy: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ViralChatCard: React.FC<ViralChatCardProps> = ({
  chat,
  index,
  onPress,
  onCopy,
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };
  
  const getCategoryConfig = () => {
    const configs: Record<string, { icon: keyof typeof Ionicons.glyphMap; gradient: [string, string]; emoji: string }> = {
      roast: { icon: 'flame', gradient: ['#FF6B6B', '#FF8E53'], emoji: '🔥' },
      transform: { icon: 'sparkles', gradient: ['#8B5CF6', '#06B6D4'], emoji: '✨' },
      describe: { icon: 'eye', gradient: ['#10B981', '#3B82F6'], emoji: '👁️' },
      game: { icon: 'game-controller', gradient: ['#F59E0B', '#EF4444'], emoji: '🎮' },
      fun: { icon: 'happy', gradient: ['#EC4899', '#8B5CF6'], emoji: '😄' },
    };
    return configs[chat.category] || configs.fun;
  };
  
  const config = getCategoryConfig();
  
  return (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
      <AnimatedPressable
        style={animatedStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <View style={styles.cardWrapper}>
          {/* Gradient Border */}
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? Colors.dark.backgroundSecondary
                      : Colors.light.backgroundSecondary,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: `${config.gradient[0]}20` },
                  ]}
                >
                  <Text style={styles.categoryEmoji}>{config.emoji}</Text>
                  <Text style={[styles.categoryText, { color: config.gradient[0] }]}>
                    {chat.category.toUpperCase()}
                  </Text>
                </View>
                
                {chat.isViral && (
                  <View style={[styles.viralBadge, { backgroundColor: colors.viral }]}>
                    <Ionicons name="flame" size={12} color="#FFFFFF" />
                    <Text style={styles.viralText}>VIRAL</Text>
                  </View>
                )}
              </View>
              
              {/* Title */}
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {chat.title}
              </Text>
              
              {/* Description */}
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {chat.description}
              </Text>
              
              {/* Example */}
              <View
                style={[
                  styles.exampleContainer,
                  { backgroundColor: colors.glass },
                ]}
              >
                <Text style={[styles.exampleLabel, { color: colors.textTertiary }]}>
                  Example:
                </Text>
                <Text
                  style={[styles.exampleText, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  "{chat.example}"
                </Text>
              </View>
              
              {/* Stats & Actions */}
              <View style={styles.footer}>
                <View style={styles.stats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statEmoji}>🎯</Text>
                    <Text style={[styles.statValue, { color: colors.textSecondary }]}>
                      {formatCount(chat.uses)} uses
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statEmoji}>❤️</Text>
                    <Text style={[styles.statValue, { color: colors.textSecondary }]}>
                      {formatCount(chat.likes)}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statEmoji}>🔥</Text>
                    <Text style={[styles.statValue, { color: colors.textSecondary }]}>
                      {formatCount(chat.fires)}
                    </Text>
                  </View>
                </View>
                
                <Pressable
                  style={[styles.copyButton]}
                  onPress={onCopy}
                >
                  <LinearGradient
                    colors={config.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.copyGradient}
                  >
                    <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.copyText}>Copy</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </LinearGradient>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

/**
 * ViralChatCardMini - Compact version for horizontal scrolling
 */
interface ViralChatCardMiniProps {
  chat: ViralChat;
  onPress: () => void;
}

export const ViralChatCardMini: React.FC<ViralChatCardMiniProps> = ({
  chat,
  onPress,
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  const getCategoryEmoji = () => {
    const emojis: Record<string, string> = {
      roast: '🔥',
      transform: '✨',
      describe: '👁️',
      game: '🎮',
      fun: '😄',
    };
    return emojis[chat.category] || '✨';
  };
  
  return (
    <Pressable
      style={[
        styles.miniCard,
        {
          backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
        },
      ]}
      onPress={onPress}
    >
      <Text style={styles.miniEmoji}>{getCategoryEmoji()}</Text>
      <Text
        style={[styles.miniTitle, { color: colors.textPrimary }]}
        numberOfLines={2}
      >
        {chat.title}
      </Text>
      <Text style={[styles.miniUses, { color: colors.textTertiary }]}>
        {formatCount(chat.uses)} uses
      </Text>
    </Pressable>
  );
};

const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const styles = StyleSheet.create({
  cardWrapper: {
    ...Shadows.lg,
  },
  gradientBorder: {
    padding: 1.5,
    borderRadius: BorderRadius.card,
  },
  card: {
    borderRadius: BorderRadius.card - 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  viralBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  viralText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSize.md,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  exampleContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  exampleLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: {
    fontSize: 14,
  },
  statValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  copyButton: {
    overflow: 'hidden',
    borderRadius: BorderRadius.button,
  },
  copyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  copyText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  // Mini card styles
  miniCard: {
    width: 140,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  miniEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  miniTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  miniUses: {
    fontSize: Typography.fontSize.xs,
  },
});

export default ViralChatCard;
