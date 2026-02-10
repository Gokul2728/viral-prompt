/**
 * SearchScreen - Search prompts
 */

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useAppStore } from "@/store";
import { Colors, Spacing, Typography, BorderRadius, Shadows } from "@/theme";
import {
  GlassCard,
  PromptCard,
  LoadingState as LoadingSpinner,
  EmptyState,
  ChipFilter,
} from "@/components";
import { useSearch } from "@/hooks/useApi";
import type { Prompt } from "@/types";

const RECENT_SEARCHES = [
  "cyberpunk city",
  "anime girl portrait",
  "neon lights",
  "vintage photo",
];
const TRENDING_TAGS = [
  "#cyberpunk",
  "#anime",
  "#realistic",
  "#fantasy",
  "#portrait",
  "#landscape",
];

const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
];

// Mock search results
const MOCK_RESULTS: Prompt[] = [
  {
    id: "search-1",
    text: "Cyberpunk city at night with neon lights reflecting on wet streets, highly detailed",
    previewUrl: "https://picsum.photos/500/500?random=30",
    type: "image",
    platforms: ["reddit"],
    aiTools: ["midjourney"],
    trendScore: 92,
    likes: 8500,
    wows: 1200,
    copies: 950,
    fires: 320,
    tags: ["cyberpunk", "neon", "city", "night"],
    createdAt: new Date().toISOString(),
    previewType: "image",
    generates: 0,
    updatedAt: "",
    firstSeenAt: "",
    crossPlatformCount: 0,
    creatorCount: 0,
    engagementVelocity: 0,
    isApproved: false,
  },
  {
    id: "search-2",
    text: "Cyberpunk samurai with glowing sword, rain effects, cinematic lighting",
    previewUrl: "https://picsum.photos/500/500?random=31",
    type: "image",
    platforms: ["twitter"],
    aiTools: ["dall-e"],
    trendScore: 87,
    likes: 6200,
    wows: 890,
    copies: 720,
    fires: 180,
    tags: ["cyberpunk", "samurai", "sword"],
    createdAt: new Date().toISOString(),
    previewType: "image",
    generates: 0,
    updatedAt: "",
    firstSeenAt: "",
    crossPlatformCount: 0,
    creatorCount: 0,
    engagementVelocity: 0,
    isApproved: false,
  },
];

export const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];

  const inputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Prompt[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  
  const { search: apiSearch, loading: searchLoading } = useSearch();

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    Keyboard.dismiss();
    setIsSearching(true);
    setHasSearched(true);

    try {
      const apiResults = await apiSearch(searchQuery);
      setResults(apiResults && apiResults.length > 0 ? apiResults : MOCK_RESULTS);
    } catch {
      setResults(MOCK_RESULTS);
    }
    setIsSearching(false);
  }, [searchQuery, apiSearch]);

  const handleTagPress = (tag: string) => {
    setSearchQuery(tag.replace("#", ""));
    inputRef.current?.focus();
  };

  const handleRecentSearch = (search: string) => {
    setSearchQuery(search);
    handleSearch();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const filteredResults = results.filter(
    (r) => activeFilter === "all" || r.type === activeFilter,
  );

  const renderSearchBar = () => (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.searchBarContainer, { marginTop: insets.top }]}
    >
      <BlurView
        intensity={theme === "dark" ? 40 : 60}
        tint={theme}
        style={styles.searchBarBlur}
      >
        <View style={[styles.searchBar, { borderColor: colors.glassBorder }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search prompts..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelText, { color: colors.primary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );

  const renderInitialState = () => (
    <Animated.View
      entering={FadeInDown.delay(100).duration(400)}
      style={styles.initialContent}
    >
      {/* Recent searches */}
      <GlassCard padding="lg">
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Recent Searches
        </Text>
        <View style={styles.recentList}>
          {RECENT_SEARCHES.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.recentItem, { backgroundColor: colors.glass }]}
              onPress={() => handleRecentSearch(search)}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.recentText, { color: colors.textSecondary }]}
              >
                {search}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>

      {/* Trending tags */}
      <GlassCard padding="lg">
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Trending Tags
        </Text>
        <View style={styles.tagsContainer}>
          {TRENDING_TAGS.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tagChip,
                {
                  backgroundColor: colors.primary + "20",
                  borderColor: colors.primary + "40",
                },
              ]}
              onPress={() => handleTagPress(tag)}
            >
              <Text style={[styles.tagText, { color: colors.primary }]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>

      {/* Search tips */}
      <GlassCard padding="lg">
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Search Tips
        </Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Ionicons name="bulb-outline" size={20} color={colors.accent} />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Try searching for styles like "cinematic", "anime", or "realistic"
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="pricetag-outline" size={20} color={colors.accent} />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Use tags to find specific categories
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="flame-outline" size={20} color={colors.accent} />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Check trending for popular prompts
            </Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );

  const renderResults = () => (
    <Animated.View
      entering={FadeIn.duration(300)}
      layout={Layout}
      style={styles.resultsContainer}
    >
      {/* Filters */}
      <View style={styles.filtersRow}>
        <ChipFilter
          options={FILTER_OPTIONS}
          onSelect={(id) => setActiveFilter(id)}
          selectedIds={[activeFilter]}
        />
        <Text style={[styles.resultCount, { color: colors.textTertiary }]}>
          {filteredResults.length} results
        </Text>
      </View>

      {/* Results list */}
      {filteredResults.length > 0 ? (
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(index * 100).duration(400)}
            >
              <PromptCard
                prompt={item}
                onPress={() =>
                  navigation.navigate("PromptDetail", { promptId: item.id })
                }
                onGenerate={function (): void {
                  throw new Error("Function not implemented.");
                }}
                onCopy={function (): void {
                  throw new Error("Function not implemented.");
                }}
                style="compact"
                // variant="compact"
              />
            </Animated.View>
          )}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon="search-outline"
          title="No results found"
          description={`Try different keywords or check trending prompts`}
          actionTitle="Browse Trending"
          onAction={() => navigation.navigate("Trending")}
        />
      )}
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderSearchBar()}

      {isSearching ? (
        <View style={styles.loadingContainer}>
          {/* <LoadingSpinner /> */}
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Searching prompts...
          </Text>
        </View>
      ) : hasSearched ? (
        renderResults()
      ) : (
        renderInitialState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    zIndex: 10,
  },
  searchBarBlur: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    height: "100%",
  },
  cancelButton: {
    paddingHorizontal: Spacing.sm,
  },
  cancelText: {
    fontSize: Typography.fontSize.md,
    fontWeight: "500",
  },
  initialContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  recentList: {
    gap: Spacing.sm,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  recentText: {
    fontSize: Typography.fontSize.md,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tagChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tagText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "500",
  },
  tipsList: {
    gap: Spacing.md,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
  },
  resultsContainer: {
    flex: 1,
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  resultCount: {
    fontSize: Typography.fontSize.sm,
  },
  resultsList: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
});

export default SearchScreen;
