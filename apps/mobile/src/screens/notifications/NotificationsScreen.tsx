import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { notificationsApi } from '../../lib/api';
import { EmptyState } from '../../components/EmptyState';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme';

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.list();
      setNotifications(data.data || data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true })),
      );
    } catch {
      // silent
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // silent
    }
  };

  const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'application_received': return 'document-text-outline';
      case 'application_hired': return 'checkmark-circle-outline';
      case 'application_shortlisted': return 'star-outline';
      case 'application_declined': return 'close-circle-outline';
      case 'milestone_submitted': return 'flag-outline';
      case 'milestone_approved': return 'trophy-outline';
      case 'new_message': return 'chatbubble-outline';
      case 'user_followed': return 'person-add-outline';
      default: return 'notifications-outline';
    }
  };

  const timeAgo = (date: string) => {
    const diffMs = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) return <LoadingScreen />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, !item.read && styles.itemUnread]}
            onPress={() => handleMarkRead(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, !item.read && styles.iconCircleUnread]}>
              <Ionicons
                name={getNotificationIcon(item.type)}
                size={20}
                color={!item.read ? Colors.primary : Colors.textTertiary}
              />
            </View>
            <View style={styles.content}>
              <Text style={[styles.message, !item.read && styles.messageUnread]}>
                {item.message || item.title}
              </Text>
              <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-outline"
            title="No notifications"
            description="You're all caught up!"
          />
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchNotifications(); }}
            colors={[Colors.primary]}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  markAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  list: { paddingBottom: Spacing.xxxl },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  itemUnread: { backgroundColor: Colors.primaryLight + '08' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleUnread: { backgroundColor: Colors.primaryLight + '20' },
  content: { flex: 1 },
  message: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  messageUnread: { color: Colors.text, fontWeight: '600' },
  time: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 72 },
});
