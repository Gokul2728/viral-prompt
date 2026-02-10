/**
 * ProfileScreen - User profile and settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';
import { Colors, Spacing, Typography, BorderRadius, Gradients, Shadows } from '@/theme';
import { Header, GlassCard, Button } from '@/components';
import { SyncStatusBadge } from '@/components/OfflineBanner';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];
  const user = useAppStore((state) => state.user);
  const isGuest = useAppStore((state) => state.isGuest);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const logout = useAppStore((state) => state.logout);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const savedPromptIds = useAppStore((state) => state.savedPromptIds);
  const userGenerations = useAppStore((state) => state.userGenerations);
  const userCopies = useAppStore((state) => state.userCopies);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notificationsEnabled ?? false
  );
  
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
  };
  
  const handleUpgrade = () => {
    navigation.navigate('Auth');
  };
  
  const renderUserCard = () => (
    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
      <GlassCard borderGradient={!isGuest} padding="lg" style={styles.userCard}>
        <View style={styles.userHeader}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {user?.photoUrl ? (
              <Animated.Image
                source={{ uri: user.photoUrl }}
                style={styles.avatar}
              />
            ) : (
              <LinearGradient
                colors={Gradients.primary as [string, string, ...string[]]}
                style={styles.avatarPlaceholder}
              >
                <Ionicons
                  name={isGuest ? 'person-outline' : 'person'}
                  size={32}
                  color="#FFFFFF"
                />
              </LinearGradient>
            )}
            {!isGuest && (
              <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>
          
          {/* User info */}
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {user?.displayName || (isGuest ? 'Guest User' : 'Anonymous')}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user?.email || 'Sign in to sync your data'}
            </Text>
            <SyncStatusBadge />
          </View>
        </View>
        
        {isGuest && (
          <Button
            title="Sign in with Google"
            onPress={handleUpgrade}
            variant="primary"
            icon="logo-google"
            fullWidth
            style={{ marginTop: Spacing.lg }}
          />
        )}
      </GlassCard>
    </Animated.View>
  );
  
  const renderStats = () => (
    <Animated.View entering={FadeInDown.delay(200).duration(400)}>
      <GlassCard padding="lg" style={styles.statsCard}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Your Activity
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: `${colors.like}20` }]}>
              <Text style={styles.statEmoji}>❤️</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {savedPromptIds.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Saved
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: `${colors.copy}20` }]}>
              <Text style={styles.statEmoji}>📋</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {userCopies.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Copied
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: `${colors.generate}20` }]}>
              <Text style={styles.statEmoji}>⚡</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {userGenerations.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Generated
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: `${colors.fire}20` }]}>
              <Text style={styles.statEmoji}>🔥</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {Object.keys(useAppStore.getState().userReactions).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Reactions
            </Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
  
  const renderSettings = () => (
    <Animated.View entering={FadeInDown.delay(300).duration(400)}>
      <GlassCard padding={0} style={styles.settingsCard}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textPrimary, padding: Spacing.lg, paddingBottom: 0 },
          ]}
        >
          Settings
        </Text>
        
        {/* Theme */}
        <Pressable
          style={[styles.settingItem, { borderBottomColor: colors.glassBorder }]}
          onPress={toggleTheme}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons
                name={theme === 'dark' ? 'moon' : 'sunny'}
                size={20}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>
                {theme === 'dark' ? 'On' : 'Off'}
              </Text>
            </View>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.surface, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </Pressable>
        
        {/* Notifications */}
        <Pressable
          style={[styles.settingItem, { borderBottomColor: colors.glassBorder }]}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: `${colors.secondary}20` }]}>
              <Ionicons name="notifications" size={20} color={colors.secondary} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Notifications
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>
                Get notified about viral prompts
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.surface, true: colors.secondary }}
            thumbColor="#FFFFFF"
          />
        </Pressable>
        
        {/* Saved Prompts */}
        <Pressable
          style={[styles.settingItem, { borderBottomColor: colors.glassBorder }]}
          onPress={() => navigation.navigate('Saved')}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: `${colors.like}20` }]}>
              <Ionicons name="bookmark" size={20} color={colors.like} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Saved Prompts
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>
                {savedPromptIds.length} prompts saved
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </Pressable>
        
        {/* Offline Data */}
        <Pressable
          style={[styles.settingItem, { borderBottomColor: colors.glassBorder }]}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: `${colors.accent}20` }]}>
              <Ionicons name="cloud-download" size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Offline Data
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>
                Last sync: {syncStatus.lastSyncAt ? formatDate(syncStatus.lastSyncAt) : 'Never'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </Pressable>
        
        {/* About */}
        <Pressable style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: `${colors.textTertiary}20` }]}>
              <Ionicons name="information-circle" size={20} color={colors.textTertiary} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                About
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>
                Version 1.0.0
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </Pressable>
      </GlassCard>
    </Animated.View>
  );
  
  const renderLogout = () => (
    <Animated.View entering={FadeInDown.delay(400).duration(400)}>
      <Pressable
        style={[
          styles.logoutButton,
          { backgroundColor: `${colors.error}15`, borderColor: `${colors.error}30` },
        ]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>
          Sign Out
        </Text>
      </Pressable>
    </Animated.View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Profile" />
      
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderUserCard()}
        {renderStats()}
        {renderSettings()}
        {renderLogout()}
        
        <View style={{ height: Spacing.huge }} />
      </ScrollView>
    </View>
  );
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  userCard: {},
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  statsCard: {},
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
  },
  settingsCard: {},
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },
});

export default ProfileScreen;
