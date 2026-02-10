/**
 * Navigation types for the app
 */

import type { ChartPeriod, ChartCategory } from '@/types';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  PromptDetail: { promptId: string };
  ViralChatDetail: { chatId: string };
  Feedback: { promptId: string };
  Search: undefined;
  Notifications: undefined;
  Saved: undefined;
  Charts: { initialPeriod?: ChartPeriod; initialCategory?: ChartCategory };
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Trending: undefined;
  Clusters: undefined;
  ViralChat: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
