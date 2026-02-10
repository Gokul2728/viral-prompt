/**
 * Firebase Notifications Service
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { apiService } from "./api";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export interface PushNotificationData {
  type: "trending" | "viral" | "save" | "system";
  promptId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<void> {
    try {
      await this.registerForPushNotifications();
      this.setupListeners();
      console.log("Notification service initialized");
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
    }
  }

  private async registerForPushNotifications(): Promise<void> {
    if (!Device.isDevice) {
      console.log("Push notifications require a physical device");
      return;
    }

    // Check and request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission denied");
      return;
    }

    // Get push token
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      this.expoPushToken = tokenData.data;

      // Register token with backend
      await apiService.registerPushToken(
        this.expoPushToken,
        Platform.OS as "ios" | "android",
      );

      console.log("Push token registered:", this.expoPushToken);
    } catch (error) {
      console.error("Failed to get push token:", error);
    }

    // Android-specific channel setup
    if (Platform.OS === "android") {
      await this.setupAndroidChannels();
    }
  }

  private async setupAndroidChannels(): Promise<void> {
    // Default channel
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#A855F7",
    });

    // Trending alerts channel
    await Notifications.setNotificationChannelAsync("trending", {
      name: "Trending Alerts",
      description: "Get notified when prompts go viral",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: "#F97316",
    });

    // System updates channel
    await Notifications.setNotificationChannelAsync("system", {
      name: "System Updates",
      description: "App updates and announcements",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  private setupListeners(): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        this.handleNotificationReceived(notification);
      },
    );

    // Listener for when user taps on notification
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        this.handleNotificationResponse(response);
      });
  }

  private handleNotificationReceived(
    notification: Notifications.Notification,
  ): void {
    const data = notification.request.content
      .data as unknown as PushNotificationData;

    // You can emit events here for the app to handle
    // e.g., update notification badge count
  }

  private handleNotificationResponse(
    response: Notifications.NotificationResponse,
  ): void {
    const data = response.notification.request.content
      .data as unknown as PushNotificationData;

    // Navigate based on notification type
    // This would typically dispatch a navigation action
    if (data.promptId) {
      // Navigate to prompt detail
      console.log("Navigate to prompt:", data.promptId);
    }
  }

  // ============ PUBLIC METHODS ============

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput,
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
      },
      trigger: trigger || null, // null means immediate
    });
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  async dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  // ============ SCHEDULED NOTIFICATIONS ============

  async scheduleTrendingDigest(): Promise<void> {
    // Schedule daily trending digest at 9 AM
    await this.scheduleLocalNotification(
      "🔥 Daily Trending Digest",
      "Check out today's hottest viral prompts!",
      { type: "trending" },
      {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 9,
        minute: 0,
        repeats: true,
      },
    );
  }

  async scheduleWeeklyRecap(): Promise<void> {
    // Schedule weekly recap on Sunday at 10 AM
    await this.scheduleLocalNotification(
      "📊 Weekly Recap",
      "Your weekly viral prompt statistics are ready!",
      { type: "system" },
      {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday: 1, // Sunday
        hour: 10,
        minute: 0,
        repeats: true,
      },
    );
  }

  // ============ CLEANUP ============

  cleanup(): void {
    if (this.notificationListener) {
      // Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener?.remove();
      this.responseListener?.remove();
    }
    if (this.responseListener) {
      // Notifications.removeNotificationSubscription(this.responseListener);
      this.notificationListener?.remove();
      this.responseListener?.remove();
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
