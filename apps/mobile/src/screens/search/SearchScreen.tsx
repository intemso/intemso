import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { gigsApi, GigListItem } from '../../lib/api';
import { GigCard } from '../../components/GigCard';
import { EmptyState } from '../../components/EmptyState';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme';

interface SearchScreenProps {
  onGigPress: (gigId: string) => void;
}

export function SearchScreen({ onGigPress }: SearchScreenProps) {
  const [search, setSearch] = useState('');
  const [gigs, setGigs] = useState<GigListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [budgetType, setBudgetType] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = useCallback(
    async (p = 1, append = false) => {
      if (!search.trim() && !budgetType) return;
      setLoading(true);
      setHasSearched(true);
      try {
        const res = await gigsApi.list({
          page: p,
          limit: 15,
          search: search || undefined,
          budgetType: budgetType || undefined,
        });
        if (append) {
          setGigs((prev) => [...prev, ...res.data]);
        } else {
          setGigs(res.data);
        }
        setTotalPages(res.meta.totalPages);
        setPage(p);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [search, budgetType],
  );

  const onEndReached = () => {
    if (page < totalPages && !loading) {
      doSearch(page + 1, true);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for gigs, skills..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => doSearch(1)}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); setGigs([]); setHasSearched(false); }}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filters}>
        {['fixed', 'hourly'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, budgetType === type && styles.filterChipActive]}
            onPress={() => setBudgetType(budgetType === type ? null : type)}
          >
            <Text style={[styles.filterText, budgetType === type && styles.filterTextActive]}>
              {type === 'fixed' ? 'Fixed Price' : 'Hourly'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={gigs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GigCard gig={item} onPress={() => onGigPress(item.id)} />}
        ListEmptyComponent={
          hasSearched ? (
            <EmptyState
              icon="search-outline"
              title="No results found"
              description="Try different keywords or filters"
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="Search for gigs"
              description="Enter keywords to find matching opportunities"
            />
          )
        }
        contentContainerStyle={styles.list}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: FontSize.md, color: Colors.text },
  filters: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.textInverse },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
});
