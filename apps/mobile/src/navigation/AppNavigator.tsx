import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../lib/api';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { GigDetailScreen } from '../screens/home/GigDetailScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { ChatScreen } from '../screens/messages/ChatScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { LoadingScreen } from '../components/LoadingScreen';
import { Colors, FontSize, Spacing } from '../theme';

type AuthRoute = 'login' | 'register';
type MainTab = 'home' | 'search' | 'messages' | 'notifications' | 'profile';
type Screen =
  | { type: 'tab'; tab: MainTab }
  | { type: 'gig-detail'; gigId: string }
  | { type: 'chat'; conversationId: string; participantName: string };

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authRoute, setAuthRoute] = useState<AuthRoute>('login');
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [screen, setScreen] = useState<Screen>({ type: 'tab', tab: 'home' });
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  React.useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = () => {
      notificationsApi.unreadCount().then((data) => setUnreadCount(data.count)).catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  // Auth screens (not authenticated)
  if (!isAuthenticated) {
    if (authRoute === 'login') {
      return <LoginScreen onNavigateToRegister={() => setAuthRoute('register')} />;
    }
    return <RegisterScreen onNavigateToLogin={() => setAuthRoute('login')} />;
  }

  // Detail screens (overlays)
  if (screen.type === 'gig-detail') {
    return (
      <GigDetailScreen
        gigId={screen.gigId}
        onBack={() => setScreen({ type: 'tab', tab: currentTab })}
      />
    );
  }

  if (screen.type === 'chat') {
    return (
      <ChatScreen
        conversationId={screen.conversationId}
        participantName={screen.participantName}
        onBack={() => setScreen({ type: 'tab', tab: 'messages' })}
      />
    );
  }

  // Tab content
  const renderTab = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            onGigPress={(id) => setScreen({ type: 'gig-detail', gigId: id })}
          />
        );
      case 'search':
        return (
          <SearchScreen
            onGigPress={(id) => setScreen({ type: 'gig-detail', gigId: id })}
          />
        );
      case 'messages':
        return (
          <MessagesScreen
            onConversationPress={(id, name) =>
              setScreen({ type: 'chat', conversationId: id, participantName: name })
            }
          />
        );
      case 'notifications':
        return <NotificationsScreen />;
      case 'profile':
        return <ProfileScreen onLogout={() => setAuthRoute('login')} />;
    }
  };

  const tabs: { key: MainTab; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { key: 'home', icon: 'home-outline', iconActive: 'home', label: 'Home' },
    { key: 'search', icon: 'search-outline', iconActive: 'search', label: 'Search' },
    { key: 'messages', icon: 'chatbubble-outline', iconActive: 'chatbubble', label: 'Messages' },
    { key: 'notifications', icon: 'notifications-outline', iconActive: 'notifications', label: 'Alerts' },
    { key: 'profile', icon: 'person-outline', iconActive: 'person', label: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderTab()}</View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => {
                setCurrentTab(tab.key);
                setScreen({ type: 'tab', tab: tab.key });
              }}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconContainer}>
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={24}
                  color={isActive ? Colors.primary : Colors.textTertiary}
                />
                {tab.key === 'notifications' && unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  tabIconContainer: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    color: Colors.textInverse,
    fontWeight: '700',
  },
});
