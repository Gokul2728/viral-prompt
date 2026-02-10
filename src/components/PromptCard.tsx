/**
 * PromptCard - Main card for displaying prompts in feed
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useAppStore } from "@/store";
import { Colors, BorderRadius, Spacing, Typography, Shadows } from "@/theme";
import { Prompt, Platform, AITool } from "@/types";
import { ReactionButton } from "./Button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const CARD_ASPECT_RATIO = 9 / 16;

interface PromptCardProps {
  prompt: Prompt;
  onPress: () => void;
  onGenerate: () => void;
  onCopy: () => void;
  onLongPress?: () => void;
  style?: any;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onPress,
  onGenerate,
  onCopy,
  onLongPress,
  style,
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  const userReactions = useAppStore((state) => state.userReactions);
  const addReaction = useAppStore((state) => state.addReaction);
  const removeReaction = useAppStore((state) => state.removeReaction);
  const savedPromptIds = useAppStore((state) => state.savedPromptIds);
  const savePrompt = useAppStore((state) => state.savePrompt);
  const unsavePrompt = useAppStore((state) => state.unsavePrompt);

  const [imageLoaded, setImageLoaded] = useState(false);

  const scale = useSharedValue(1);
  const isSaved = savedPromptIds.includes(prompt.id);
  const reactions = userReactions[prompt.id] || [];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleReaction = (type: "like" | "fire" | "wow") => {
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

  const renderPlatformIcons = () => {
    const platformIcons: Record<
      Platform,
      { icon: keyof typeof Ionicons.glyphMap; color: string }
    > = {
      youtube: { icon: "logo-youtube", color: colors.youtube },
      reddit: { icon: "logo-reddit", color: colors.reddit },
      twitter: { icon: "logo-twitter", color: colors.twitter },
      pinterest: { icon: "logo-pinterest", color: colors.pinterest },
      instagram: { icon: "logo-instagram", color: colors.instagram },
      lexica: { icon: "sparkles", color: colors.primary },
      krea: { icon: "color-palette", color: colors.secondary },
      prompthero: { icon: "trophy", color: colors.accent },
      civitai: { icon: "cube", color: colors.stableDiffusion },
      "nano-banana": { icon: "flash", color: colors.pika },
    };

    return (
      <View style={styles.platformContainer}>
        {prompt.platforms.slice(0, 4).map((platform) => {
          const config = platformIcons[platform];
          return (
            <View
              key={platform}
              style={[
                styles.platformIcon,
                { backgroundColor: `${config.color}30` },
              ]}
            >
              <Ionicons name={config.icon} size={12} color={config.color} />
            </View>
          );
        })}
        {prompt.platforms.length > 4 && (
          <View
            style={[styles.platformIcon, { backgroundColor: colors.surface }]}
          >
            <Text
              style={[styles.platformMore, { color: colors.textSecondary }]}
            >
              +{prompt.platforms.length - 4}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderAIToolChips = () => {
    const toolColors: Record<AITool, string> = {
      gemini: colors.gemini,
      midjourney: colors.midjourney,
      "stable-diffusion": colors.stableDiffusion,
      runway: colors.runway,
      pika: colors.pika,
      luma: colors.luma,
      sora: colors.sora,
      veo: colors.secondary,
      "dall-e": colors.primary,
    };

    return (
      <View style={styles.toolsContainer}>
        {prompt.aiTools.slice(0, 3).map((tool) => (
          <View
            key={tool}
            style={[
              styles.toolChip,
              { backgroundColor: `${toolColors[tool]}20` },
            ]}
          >
            <Text style={[styles.toolText, { color: toolColors[tool] }]}>
              {tool.replace("-", " ")}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTrendBadge = () => {
    let badgeColor = colors.accent;
    let badgeText = "Trending";
    let badgeIcon: keyof typeof Ionicons.glyphMap = "trending-up";

    if (prompt.trendScore >= 90) {
      badgeColor = colors.viral;
      badgeText = "VIRAL";
      badgeIcon = "flame";
    } else if (prompt.trendScore >= 70) {
      badgeColor = colors.hot;
      badgeText = "HOT";
      badgeIcon = "flame";
    }

    return (
      <View style={[styles.trendBadge, { backgroundColor: badgeColor }]}>
        <Ionicons name={badgeIcon} size={12} color="#FFFFFF" />
        <Text style={styles.trendText}>{badgeText}</Text>
        <Text style={styles.trendScore}>{prompt.trendScore}</Text>
      </View>
    );
  };

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[
          styles.card,
          {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder,
          },
        ]}
      >
        {/* Preview Image/Video */}
        <View style={styles.previewContainer}>
          <ExpoImage
            source={{ uri: prompt.previewUrl }}
            style={styles.previewImage}
            contentFit="cover"
            transition={300}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.previewOverlay}
          />

          {/* Video Indicator */}
          {prompt.previewType === "video" && (
            <View style={styles.videoIndicator}>
              <Ionicons name="play-circle" size={24} color="#FFFFFF" />
            </View>
          )}

          {/* Trend Badge */}
          <View style={styles.badgeContainer}>{renderTrendBadge()}</View>

          {/* Save Button */}
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isSaved ? colors.primary : "#FFFFFF"}
            />
          </Pressable>

          {/* Prompt Type Badge */}
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  prompt.type === "video" ? colors.sora : colors.midjourney,
              },
            ]}
          >
            <Ionicons
              name={prompt.type === "video" ? "videocam" : "image"}
              size={12}
              color="#FFFFFF"
            />
            <Text style={styles.typeText}>
              {prompt.type === "video" ? "VIDEO" : "IMAGE"}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Platform Icons */}
          {renderPlatformIcons()}

          {/* Prompt Text Preview */}
          <Text
            style={[styles.promptText, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {prompt.text}
          </Text>

          {/* AI Tool Chips */}
          {renderAIToolChips()}

          {/* Actions Row */}
          <View style={styles.actionsRow}>
            <View style={styles.reactionsContainer}>
              <ReactionButton
                type="like"
                count={prompt.likes}
                active={reactions.includes("like")}
                onPress={() => handleReaction("like")}
                size="sm"
              />
              <ReactionButton
                type="fire"
                count={prompt.fires}
                active={reactions.includes("fire")}
                onPress={() => handleReaction("fire")}
                size="sm"
              />
              <ReactionButton
                type="wow"
                count={prompt.wows}
                active={reactions.includes("wow")}
                onPress={() => handleReaction("wow")}
                size="sm"
              />
            </View>

            <View style={styles.actionButtons}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.glass }]}
                onPress={onCopy}
              >
                <Ionicons
                  name="copy-outline"
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
              <Pressable style={[styles.generateButton]} onPress={onGenerate}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.generateGradient}
                >
                  <Ionicons name="flash" size={16} color="#FFFFFF" />
                  <Text style={styles.generateText}>Generate</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>
    </AnimatedPressable>
  );
};

/**
 * PromptCardMini - Compact card for lists and charts
 */
interface PromptCardMiniProps {
  prompt: Prompt;
  rank?: number;
  onPress: () => void;
}

export const PromptCardMini: React.FC<PromptCardMiniProps> = ({
  prompt,
  rank,
  onPress,
}) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];

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
      {rank && (
        <View
          style={[
            styles.rankBadge,
            {
              backgroundColor:
                rank <= 3
                  ? rank === 1
                    ? "#FFD700"
                    : rank === 2
                      ? "#C0C0C0"
                      : "#CD7F32"
                  : colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.rankText,
              { color: rank <= 3 ? "#000000" : colors.textPrimary },
            ]}
          >
            {rank}
          </Text>
        </View>
      )}

      <ExpoImage
        source={{ uri: prompt.thumbnailUrl || prompt.previewUrl }}
        style={styles.miniPreview}
        contentFit="cover"
      />

      <View style={styles.miniContent}>
        <Text
          style={[styles.miniPromptText, { color: colors.textPrimary }]}
          numberOfLines={2}
        >
          {prompt.text}
        </Text>
        <View style={styles.miniStats}>
          <Text style={[styles.miniStat, { color: colors.textTertiary }]}>
            ❤️ {formatCount(prompt.likes)}
          </Text>
          <Text style={[styles.miniStat, { color: colors.textTertiary }]}>
            🔥 {prompt.trendScore}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </Pressable>
  );
};

const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
    ...Shadows.lg,
  },
  previewContainer: {
    width: "100%",
    aspectRatio: 4 / 3,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  videoIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  badgeContainer: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  trendText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.xs,
    fontWeight: "700",
  },
  trendScore: {
    color: "rgba(255,255,255,0.8)",
    fontSize: Typography.fontSize.xs,
    fontWeight: "600",
  },
  saveButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadge: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.chip,
    gap: 4,
  },
  typeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  platformContainer: {
    flexDirection: "row",
    gap: 6,
    marginBottom: Spacing.sm,
  },
  platformIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  platformMore: {
    fontSize: 10,
    fontWeight: "600",
  },
  promptText: {
    fontSize: Typography.fontSize.md,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  toolsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: Spacing.md,
  },
  toolChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.chip,
  },
  toolText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reactionsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButton: {
    overflow: "hidden",
    borderRadius: BorderRadius.button,
  },
  generateGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  generateText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.sm,
    fontWeight: "600",
  },
  // Mini card styles
  miniCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
  },
  miniPreview: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
  },
  miniContent: {
    flex: 1,
  },
  miniPromptText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "500",
    marginBottom: 4,
  },
  miniStats: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  miniStat: {
    fontSize: Typography.fontSize.xs,
  },
});

export default PromptCard;
