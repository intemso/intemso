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
import { messagesApi } from '../../lib/api';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

interface MessagesScreenProps {
  onConversationPress: (conversationId: string, participantName: string) => void;
}

export function MessagesScreen({ onConversationPress }: MessagesScreenProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await messagesApi.listConversations();
      setConversations(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const getOtherParticipant = (conv: any) => {
    if (!conv.participants) return { name: 'Unknown', avatar: null };
    const other = conv.participants.find((p: any) => p.userId !== user?.id);
    if (!other?.user) return { name: 'Unknown', avatar: null };
    const u = other.user;
    return {
      name: u.studentProfile
        ? `${u.studentProfile.firstName} ${u.studentProfile.lastName}`
        : u.employerProfile?.businessName || 'User',
      avatar: u.avatarUrl,
    };
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const other = getOtherParticipant(item);
          const lastMsg = item.lastMessage;
          const unread = item.unreadCount > 0;
          return (
            <TouchableOpacity
              style={[styles.convItem, unread && styles.convItemUnread]}
              onPress={() => onConversationPress(item.id, other.name)}
              activeOpacity={0.7}
            >
              <Avatar uri={other.avatar} name={other.name} size={48} />
              <View style={styles.convContent}>
                <View style={styles.convTop}>
                  <Text style={[styles.convName, unread && styles.convNameUnread]} numberOfLines={1}>
                    {other.name}
                  </Text>
                  {lastMsg && (
                    <Text style={styles.convTime}>{formatTime(lastMsg.createdAt)}</Text>
                  )}
                </View>
                <View style={styles.convBottom}>
                  <Text style={[styles.convMessage, unread && styles.convMessageUnread]} numberOfLines={1}>
                    {lastMsg?.content || 'No messages yet'}
                  </Text>
                  {unread && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No conversations"
            description="Start a conversation from a gig or profile"
          />
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchConversations(); }}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  list: { paddingBottom: Spacing.xxxl },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  convItemUnread: { backgroundColor: Colors.primaryLight + '08' },
  convContent: { flex: 1 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  convName: { fontSize: FontSize.md, fontWeight: '500', color: Colors.text, flex: 1, marginRight: Spacing.sm },
  convNameUnread: { fontWeight: '700' },
  convTime: { fontSize: FontSize.xs, color: Colors.textTertiary },
  convBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convMessage: { fontSize: FontSize.sm, color: Colors.textTertiary, flex: 1, marginRight: Spacing.sm },
  convMessageUnread: { color: Colors.text, fontWeight: '500' },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: { fontSize: 11, color: Colors.textInverse, fontWeight: '700' },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 76 },
});
