import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { gigsApi, categoriesApi, GigListItem, Category } from '../../lib/api';
import { GigCard } from '../../components/GigCard';
import { LoadingScreen } from '../../components/LoadingScreen';
import { EmptyState } from '../../components/EmptyState';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

interface HomeScreenProps {
  onGigPress: (gigId: string) => void;
}

export function HomeScreen({ onGigPress }: HomeScreenProps) {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<GigListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGigs = useCallback(
    async (p = 1, refresh = false) => {
      try {
        const res = await gigsApi.list({
          page: p,
          limit: 15,
          category: selectedCategory || undefined,
          search: search || undefined,
        });
        if (refresh || p === 1) {
          setGigs(res.data);
        } else {
          setGigs((prev) => [...prev, ...res.data]);
        }
        setTotalPages(res.meta.totalPages);
        setPage(p);
      } catch {
        // silent
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory, search],
  );

  useEffect(() => {
    setLoading(true);
    fetchGigs(1, true);
  }, [fetchGigs]);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGigs(1, true);
  };

  const onEndReached = () => {
    if (page < totalPages) {
      fetchGigs(page + 1);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.studentProfile
    ? (user.studentProfile as any).firstName
    : user?.employerProfile
      ? (user.employerProfile as any).contactPerson || (user.employerProfile as any).businessName
      : null;

  const renderHeader = () => (
    <View>
      {user && (
        <View style={styles.greetingBar}>
          <View>
            <Text style={styles.greeting}>{greeting()}{userName ? `, ${userName}` : ''}</Text>
            <Text style={styles.greetingSub}>Find your next opportunity</Text>
          </View>
        </View>
      )}

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search gigs..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => fetchGigs(1, true)}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); }}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {categories.length > 0 && (
        <FlatList
          horizontal
          data={[{ id: 'all', name: 'All', slug: 'all', icon: null, description: null, isActive: true, sortOrder: 0, _count: { gigs: 0 } }, ...categories]}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                (item.id === 'all' ? !selectedCategory : selectedCategory === item.slug) &&
                  styles.categoryChipActive,
              ]}
              onPress={() => {
                setSelectedCategory(item.id === 'all' ? null : item.slug);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  (item.id === 'all' ? !selectedCategory : selectedCategory === item.slug) &&
                    styles.categoryTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={styles.sectionTitle}>Latest Gigs</Text>
    </View>
  );

  if (loading && gigs.length === 0) {
    return <LoadingScreen message="Loading gigs..." />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <FlatList
        data={gigs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GigCard gig={item} onPress={() => onGigPress(item.id)} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title="No gigs found"
            description="Try adjusting your search or filters"
          />
        }
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  greetingBar: {
    paddingVertical: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  greetingSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  categoriesContainer: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: Colors.textInverse,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
});
