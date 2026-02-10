/**
 * TabNavigator - Bottom tab navigation
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAppStore } from '@/store';
import { Colors, Spacing } from '@/theme';
import {
  HomeScreen,
  TrendingScreen,
  ViralChatScreen,
  ProfileScreen,
} from '@/screens';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon: React.FC<{
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size: number;
}> = ({ name, focused, color, size }) => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  return (
    <View
      style={[
        styles.iconContainer,
        focused && {
          backgroundColor: colors.primary + '20',
        },
      ]}
    >
      <Ionicons
        name={focused ? name : (`${name}-outline` as any)}
        size={size}
        color={color}
      />
    </View>
  );
};

export const TabNavigator: React.FC = () => {
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={theme === 'dark' ? 60 : 80}
            tint={theme}
            style={StyleSheet.absoluteFill}
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: colors.glass,
                  borderTopWidth: 1,
                  borderTopColor: colors.glassBorder,
                },
              ]}
            />
          </BlurView>
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="compass" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Trending"
        component={TrendingScreen}
        options={{
          tabBarLabel: 'Trending',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="flame" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ViralChat"
        component={ViralChatScreen}
        options={{
          tabBarLabel: 'Viral Chat',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="chatbubbles" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="person" focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 44,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabNavigator;
