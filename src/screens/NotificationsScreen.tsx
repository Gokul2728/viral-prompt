/**
 * NotificationsScreen - User notifications
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInRight,
  FadeOut,
  Layout,
} from "react-native-reanimated";
import { useAppStore } from "@/store";
import { Colors, Spacing, Typography, BorderRadius } from "@/theme";
import { Header, GlassCard, EmptyState } from "@/components";

interface Notification {
  id: string;
  type: "trending" | "save" | "viral" | "system" | "reaction";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: {
    promptId?: string;
    promptTitle?: string;
  };
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "trending",
    title: "🔥 Trending Alert",
    message:
      'A prompt you saved is now trending! Check out "Cyberpunk city at night..."',
    timestamp: "5 min ago",
    read: false,
    data: { promptId: "1", promptTitle: "Cyberpunk city" },
  },
  {
    id: "2",
    type: "viral",
    title: "💥 Viral Prompt",
    message: "New viral prompt discovered with 95% viral score!",
    timestamp: "15 min ago",
    read: false,
  },
  {
    id: "3",
    type: "reaction",
    title: "❤️ Reactions",
    message: "Your saved prompt received 500+ new reactions today",
    timestamp: "1 hour ago",
    read: true,
    data: { promptId: "2" },
  },
  {
    id: "4",
    type: "system",
    title: "✨ New Features",
    message:
      "Video prompts are now available! Discover trending video AI content.",
    timestamp: "3 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "trending",
    title: "📈 Weekly Digest",
    message: "Check out this week's top 10 viral prompts",
    timestamp: "1 day ago",
    read: true,
  },
  {
    id: "6",
    type: "save",
    title: "💾 Saved Offline",
    message: "5 prompts have been saved for offline viewing",
    timestamp: "2 days ago",
    read: true,
  },
];

const getNotificationIcon = (type: Notification["type"]): string => {
  switch (type) {
    case "trending":
      return "flame";
    case "save":
      return "bookmark";
    case "viral":
      return "sparkles";
    case "system":
      return "information-circle";
    case "reaction":
      return "heart";
    default:
      return "notifications";
  }
};

const getNotificationColor = (type: Notification["type"]): string => {
  switch (type) {
    case "trending":
      return "#F97316";
    case "save":
      return "#22C55E";
    case "viral":
      return "#A855F7";
    case "system":
      return "#3B82F6";
    case "reaction":
      return "#EF4444";
    default:
      return "#6B7280";
  }
};

export const NotificationsScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.data?.promptId) {
      // Navigate to prompt detail
      navigation.navigate("PromptDetail", {
        promptId: notification.data.promptId,
      });
    }
  };

  const renderNotification = ({
    item,
    index,
  }: {
    item: Notification;
    index: number;
  }) => {
    const iconColor = getNotificationColor(item.type);

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 50).duration(300)}
        exiting={FadeOut.duration(200)}
        layout={Layout}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleNotificationPress(item)}
        >
          <GlassCard padding="md" style={styles.notificationCard}>
            <View style={styles.notificationContent}>
              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: iconColor + "20" },
                ]}
              >
                <Ionicons
                  name={getNotificationIcon(item.type) as any}
                  size={24}
                  color={iconColor}
                />
              </View>

              {/* Content */}
              <View style={styles.textContent}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      { color: colors.textPrimary },
                      !item.read && styles.unreadTitle,
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {!item.read && (
                    <View
                      style={[
                        styles.unreadDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.notificationMessage,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={2}
                >
                  {item.message}
                </Text>
                <Text
                  style={[styles.timestamp, { color: colors.textTertiary }]}
                >
                  {item.timestamp}
                </Text>
              </View>

              {/* Delete button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteNotification(item.id)}
              >
                <Ionicons name="close" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {unreadCount > 0 && (
        <TouchableOpacity
          style={[
            styles.markAllButton,
            { backgroundColor: colors.primary + "20" },
          ]}
          onPress={markAllAsRead}
        >
          <Ionicons name="checkmark-done" size={18} color={colors.primary} />
          <Text style={[styles.markAllText, { color: colors.primary }]}>
            Mark all as read ({unreadCount})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        showBack
        onBack={() => navigation.goBack()}
      />

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
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
          icon="notifications-off-outline"
          title="No notifications yet"
          description="We'll notify you when there's something new to see"
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
    gap: Spacing.sm,
  },
  listHeader: {
    marginBottom: Spacing.sm,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  markAllText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "600",
  },
  notificationCard: {
    marginBottom: 0,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  notificationTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: "500",
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
});

export default NotificationsScreen;
