/**
 * ClustersScreen - Viral Trend Discovery
 * Shows detected viral prompt clusters
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAppStore } from "@/store";
import {
  useTrendingClusters,
  useViralClusters,
  useEmergingClusters,
} from "@/hooks/useApi";
import { Colors, Spacing, Typography, BorderRadius } from "@/theme";
import { Cluster } from "@/types";
import {
  Header,
  GlassCard,
  LoadingState,
  EmptyState,
  ClusterCard,
} from "@/components";

// Filter options
const TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
];

const STATUS_FILTERS = [
  { id: "all", label: "All Trends" },
  { id: "viral", label: "🔥 Viral" },
  { id: "trending", label: "📈 Trending" },
  { id: "emerging", label: "✨ Emerging" },
];

export function ClustersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];

  const [mediaTypeFilter, setMediaTypeFilter] = useState<
    "image" | "video" | undefined
  >(undefined);
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch clusters based on filter
  const {
    data: viralClusters,
    loading: viralLoading,
    refetch: refetchViral,
  } = useViralClusters(mediaTypeFilter, 10);

  const {
    data: trendingClusters,
    loading: trendingLoading,
    refetch: refetchTrending,
  } = useTrendingClusters(mediaTypeFilter, 10);

  const {
    data: emergingClusters,
    loading: emergingLoading,
    refetch: refetchEmerging,
  } = useEmergingClusters(mediaTypeFilter, 10);

  const isLoading = viralLoading || trendingLoading || emergingLoading;

  // Filter clusters based on status
  const getFilteredClusters = (): Cluster[] => {
    switch (statusFilter) {
      case "viral":
        return viralClusters || [];
      case "trending":
        return trendingClusters || [];
      case "emerging":
        return emergingClusters || [];
      default:
        // Combine all and sort by trend score
        const all = [
          ...(viralClusters || []),
          ...(trendingClusters || []),
          ...(emergingClusters || []),
        ];
        // Remove duplicates
        const unique = Array.from(new Map(all.map((c) => [c.id, c])).values());
        return unique.sort((a, b) => b.trendScore - a.trendScore);
    }
  };

  const filteredClusters = getFilteredClusters();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchViral(), refetchTrending(), refetchEmerging()]);
    setRefreshing(false);
  };

  const handleClusterPress = (cluster: Cluster) => {
    // Navigate to cluster detail (or prompt detail if published)
    // For now, we'll copy the generated prompt to clipboard
    // In a full implementation, this would navigate to a ClusterDetailScreen
    console.log("Cluster pressed:", cluster.id);
  };

  const handleTypeFilterChange = (filterId: string) => {
    if (filterId === "all") {
      setMediaTypeFilter(undefined);
    } else {
      setMediaTypeFilter(filterId as "image" | "video");
    }
  };

  const renderCluster = ({ item, index }: { item: Cluster; index: number }) => (
    <ClusterCard
      cluster={item}
      index={index}
      onPress={() => handleClusterPress(item)}
    />
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <Header
        title="Trend Discovery"
        subtitle="AI-detected viral patterns"
        showBack={false}
      />

      {/* Filters */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.filtersContainer}
      >
        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterContent}
        >
          {STATUS_FILTERS.map((filter) => (
            <Pressable
              key={filter.id}
              onPress={() => setStatusFilter(filter.id)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.glassBorder,
                },
                statusFilter === filter.id && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  statusFilter === filter.id && { color: "#FFFFFF" },
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Type Filter */}
        <View style={styles.typeFilterRow}>
          {TYPE_FILTERS.map((filter) => {
            const isActive =
              filter.id === "all"
                ? !mediaTypeFilter
                : mediaTypeFilter === filter.id;
            return (
              <Pressable
                key={filter.id}
                onPress={() => handleTypeFilterChange(filter.id)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.glassBorder,
                  },
                  isActive && {
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Ionicons
                  name={
                    filter.id === "image"
                      ? "image"
                      : filter.id === "video"
                        ? "videocam"
                        : "apps"
                  }
                  size={16}
                  color={isActive ? "#FFFFFF" : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    { color: colors.textSecondary },
                    isActive && { color: "#FFFFFF" },
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Content */}
      {isLoading && !refreshing ? (
        <LoadingState message="Discovering trends..." />
      ) : filteredClusters.length === 0 ? (
        <EmptyState
          icon="telescope"
          title="No Trends Found"
          description="Check back later for new viral trends"
          actionTitle="Refresh"
          onAction={handleRefresh}
        />
      ) : (
        <FlatList
          data={filteredClusters}
          renderItem={renderCluster}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={() => (
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.statsRow}
            >
              <GlassCard style={styles.statCard}>
                <Ionicons name="flame" size={24} color={colors.fire} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {viralClusters?.length || 0}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textTertiary }]}
                >
                  Viral
                </Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Ionicons name="trending-up" size={24} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {trendingClusters?.length || 0}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textTertiary }]}
                >
                  Trending
                </Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Ionicons name="sparkles" size={24} color={colors.wow} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {emergingClusters?.length || 0}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textTertiary }]}
                >
                  Emerging
                </Text>
              </GlassCard>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    paddingBottom: Spacing.md,
  },
  filterScrollView: {
    marginBottom: Spacing.sm,
  },
  filterContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "500",
  },
  typeFilterRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.md,
    gap: 4,
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: "500",
  },
});

export default ClustersScreen;
