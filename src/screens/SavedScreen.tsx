/**
 * SavedScreen - Saved prompts with offline support
 */

import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeOut, Layout } from "react-native-reanimated";
import { useAppStore } from "@/store";
import { Colors, Spacing, Typography } from "@/theme";
import {
  Header,
  GlassCard,
  PromptCard,
  EmptyState,
  ChipFilter,
} from "@/components";
import { CacheIndicator } from "@/components/OfflineBanner";
import { useSavedPrompts } from "@/hooks/useApi";
import type { Prompt } from "@/types";

interface FilterChip {
  id: string;
  label: string;
  isActive?: boolean;
}

const FILTER_OPTIONS: FilterChip[] = [
  { id: "all", label: "All", isActive: true },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "offline", label: "Offline" },
];

const SORT_OPTIONS: FilterChip[] = [
  { id: "recent", label: "Recent", isActive: true },
  { id: "viral", label: "Most Viral" },
  { id: "name", label: "A-Z" },
];

// Mock saved prompts
const MOCK_SAVED: (Prompt & { savedAt: string; isOffline: boolean })[] = [
  {
    id: "saved-1",
    text: "Cyberpunk city at night with neon lights reflecting on wet streets, highly detailed",
    previewUrl: "https://picsum.photos/500/500?random=40",
    type: "image",
    platforms: ["reddit"],
    aiTools: ["midjourney"],
    trendScore: 92,
    likes: 8500,
    wows: 1200,
    copies: 950,
    fires: 320,
    tags: ["cyberpunk", "neon", "city"],
    createdAt: new Date().toISOString(),
    previewType: "image",
    generates: 0,
    updatedAt: "",
    firstSeenAt: "",
    crossPlatformCount: 0,
    creatorCount: 0,
    engagementVelocity: 0,
    isApproved: false,
    savedAt: "2024-01-14T10:30:00Z",
    isOffline: false,
  },
  {
    id: "saved-2",
    text: "Beautiful anime girl portrait with cherry blossoms, soft lighting",
    previewUrl: "https://picsum.photos/500/500?random=41",
    type: "image",
    platforms: ["twitter"],
    aiTools: ["dall-e"],
    trendScore: 88,
    likes: 6200,
    copies: 890,
    wows: 720,
    fires: 180,
    tags: ["anime", "portrait", "cherry blossoms"],
    createdAt: new Date().toISOString(),
    isOffline: true,
    previewType: "image",
    generates: 0,
    updatedAt: "",
    firstSeenAt: "",
    crossPlatformCount: 0,
    creatorCount: 0,
    engagementVelocity: 0,
    isApproved: false,
    savedAt: "2024-01-13T14:20:00Z",
  },
  {
    id: "saved-3",
    text: "Ethereal forest with magical creatures, dreamlike atmosphere, volumetric fog",
    previewUrl: "https://picsum.photos/500/500?random=42",
    type: "image",
    platforms: ["pinterest"],
    aiTools: ["stable-diffusion"],
    trendScore: 85,
    likes: 5400,
    copies: 780,
    wows: 650,
    fires: 145,
    tags: ["fantasy", "forest", "magical"],
    createdAt: new Date().toISOString(),
    savedAt: "2024-01-13T09:45:00Z",
    isOffline: false,
    previewType: "image",
    generates: 0,
    updatedAt: "",
    firstSeenAt: "",
    crossPlatformCount: 0,
    creatorCount: 0,
    engagementVelocity: 0,
    isApproved: false,
  },
  // {
  //   id: "saved-4",
  //   text: "Cinematic drone shot of mountains at golden hour",
  //   previewUrl: "https://picsum.photos/500/500?random=43",
  //   type: "video",
  //   platforms: ["youtube"],
  //   aiTools: ["runway"],
  //   trendScore: 90,
  //   likes: 12000,
  //   copies: 2500,
  //   wows: 1800,
  //   fires: 420,
  //   tags: ["video", "landscape", "cinematic"],
  //   createdAt: new Date().toISOString(),
  //   savedAt: "2024-01-12T18:00:00Z",
  //   isOffline: false,
  // },
];

export const SavedScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useAppStore((state) => state.theme);
  const { unsavePrompt } = useAppStore();
  const colors = Colors[theme];

  const { data: apiSaved, loading, refetch } = useSavedPrompts();
  const [saved, setSaved] = useState(MOCK_SAVED);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSort, setActiveSort] = useState("recent");

  // Use API data when available
  React.useEffect(() => {
    if (apiSaved && apiSaved.length > 0) {
      setSaved(apiSaved.map(p => ({ ...p, savedAt: p.createdAt, isOffline: false })));
    }
  }, [apiSaved]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleUnsave = (id: string) => {
    setSaved((prev) => prev.filter((p) => p.id !== id));
    unsavePrompt(id);
  };

  const filteredSaved = saved
    .filter((p) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "offline") return p.isOffline;
      return p.type === activeFilter;
    })
    .sort((a, b) => {
      if (activeSort === "recent") {
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      }
      if (activeSort === "viral") {
        return b.trendScore - a.trendScore;
      }
      if (activeSort === "name") {
        return a.text.localeCompare(b.text);
      }
      return 0;
    });

  const offlineCount = saved.filter((p) => p.isOffline).length;

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Stats */}
      <GlassCard padding="md" style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {saved.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Saved
            </Text>
          </View>
          <View
            style={[
              styles.statDivider,
              { backgroundColor: colors.glassBorder },
            ]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {offlineCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Offline
            </Text>
          </View>
          <View
            style={[
              styles.statDivider,
              { backgroundColor: colors.glassBorder },
            ]}
          />
          <View style={styles.statItem}>
            <CacheIndicator />
            {/* <CacheIndicator usedMB={45.2} totalMB={100} compact /> */}
          </View>
        </View>
      </GlassCard>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <ChipFilter
          options={FILTER_OPTIONS.map((f) => ({
            ...f,
            isActive: f.id === activeFilter,
          }))}
          onSelect={(id) => setActiveFilter(id)}
          selectedIds={[]} // variant="horizontal"
        />
      </View>

      {/* Sort */}
      <View style={styles.sortSection}>
        <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>
          Sort by:
        </Text>
        <ChipFilter
          options={SORT_OPTIONS.map((s) => ({
            ...s,
            isActive: s.id === activeSort,
          }))}
          onSelect={(id) => setActiveSort(id)}
          selectedIds={[]} //variant="horizontal"
          // size="sm"
        />
      </View>
    </View>
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: (typeof MOCK_SAVED)[0];
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout}
    >
      <PromptCard
        prompt={item}
        onPress={() => navigation.navigate("PromptDetail", { promptId: item.id })}
        style="compact"
        onGenerate={function (): void {
          throw new Error("Function not implemented.");
        }}
        onCopy={function (): void {
          throw new Error("Function not implemented.");
        }} // showSaveButton={false}
        // showOfflineBadge={item.isOffline}
        onLongPress={() => handleUnsave(item.id)}
      />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Saved Prompts"
        subtitle={`${saved.length} prompts`}
        showBack
        onBack={() => navigation.goBack()}
        // rightActions={[
        //   {
        //     icon: "download-outline",
        //     onPress: () => {},
        //   },
        //   {
        //     icon: "trash-outline",
        //     onPress: () => {},
        //   },
        // ]}
      />

      {saved.length > 0 ? (
        <FlatList
          data={filteredSaved}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        <EmptyState
          icon="bookmark-outline"
          title="No saved prompts"
          description="Save prompts to access them offline and build your collection"
          actionTitle="Discover Prompts"
          onAction={() => navigation.navigate("Home")}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  headerContent: {
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statsCard: {
    marginBottom: 0,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  filtersSection: {
    marginTop: Spacing.sm,
  },
  sortSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  sortLabel: {
    fontSize: Typography.fontSize.sm,
  },
});

export default SavedScreen;
