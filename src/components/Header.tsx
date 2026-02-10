/**
 * Header Component - App navigation header
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';
import { Colors, Spacing, Typography } from '@/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showNotification?: boolean;
  showSearch?: boolean;
  transparent?: boolean;
  onBack?: () => void;
  onNotification?: () => void;
  onSearch?: () => void;
  rightComponent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showNotification = false,
  showSearch = false,
  transparent = false,
  onBack,
  onNotification,
  onSearch,
  rightComponent,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useAppStore((state) => state.theme);
  const unreadCount = useAppStore((state) => state.unreadCount);
  const colors = Colors[theme];
  
  const content = (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.leftSection}>
        {showBack && (
          <Pressable style={styles.iconButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
        )}
        
        {title && (
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.rightSection}>
        {showSearch && (
          <Pressable style={styles.iconButton} onPress={onSearch}>
            <Ionicons name="search" size={22} color={colors.textPrimary} />
          </Pressable>
        )}
        
        {showNotification && (
          <Pressable style={styles.iconButton} onPress={onNotification}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.viral }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        )}
        
        {rightComponent}
      </View>
    </View>
  );
  
  if (transparent) {
    return content;
  }
  
  return (
    <BlurView
      intensity={80}
      tint={theme === 'dark' ? 'dark' : 'light'}
      style={[styles.blurContainer, { borderBottomColor: colors.glassBorder }]}
    >
      {content}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    borderBottomWidth: 1,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default Header;
