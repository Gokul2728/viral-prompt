/**
 * Navigation types for the app
 */

import type { Prompt, ViralChat } from '@/types';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  PromptDetail: { prompt: Prompt };
  Feedback: { promptId: string };
  Search: undefined;
  Notifications: undefined;
  Saved: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Trending: undefined;
  ViralChat: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
