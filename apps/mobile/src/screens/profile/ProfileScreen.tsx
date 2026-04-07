import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { walletApi, connectsApi, contractsApi } from '../../lib/api';
import { Avatar } from '../../components/Avatar';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme';

interface ProfileScreenProps {
  onLogout: () => void;
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [connects, setConnects] = useState<{ balance: number; freeRemaining: number } | null>(null);
  const [stats, setStats] = useState({ activeContracts: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [walletData, connectData] = await Promise.all([
        walletApi.getWallet().catch(() => null),
        connectsApi.getBalance().catch(() => null),
      ]);
      setWallet(walletData);
      if (connectData) setConnects(connectData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          onLogout();
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  const isStudent = user.role === 'student';
  const profile = isStudent ? user.studentProfile : user.employerProfile;
  const name = isStudent
    ? `${(profile as any)?.firstName || ''} ${(profile as any)?.lastName || ''}`.trim()
    : (profile as any)?.businessName || 'User';
  const subtitle = isStudent
    ? (profile as any)?.professionalTitle || (profile as any)?.university || ''
    : (profile as any)?.businessType || '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileHeader}>
          <Avatar uri={user.avatarUrl} name={name || 'U'} size={80} />
          <Text style={styles.name}>{name || 'Complete your profile'}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{isStudent ? 'Student' : 'Employer'}</Text>
          </View>
        </View>

        {isStudent && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {(profile as any)?.ratingAvg?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{(profile as any)?.gigsCompleted || 0}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{connects?.balance || 0}</Text>
              <Text style={styles.statLabel}>Connects</Text>
            </View>
          </View>
        )}

        {!isStudent && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{(profile as any)?.gigsPosted || 0}</Text>
              <Text style={styles.statLabel}>Gigs Posted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {(profile as any)?.ratingAvg?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {(profile as any)?.hireRate ? `${((profile as any).hireRate * 100).toFixed(0)}%` : 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Hire Rate</Text>
            </View>
          </View>
        )}

        {wallet && (
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Ionicons name="wallet-outline" size={24} color={Colors.primary} />
              <Text style={styles.walletTitle}>Wallet</Text>
            </View>
            <Text style={styles.walletBalance}>
              GH₵{Number(wallet.balance || 0).toFixed(2)}
            </Text>
            <Text style={styles.walletLabel}>Available balance</Text>
          </View>
        )}

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>

          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => Alert.alert('Coming Soon', 'Profile editing is coming in the next update.')}
          />
          <MenuItem
            icon="document-text-outline"
            label="My Applications"
            onPress={() => Alert.alert('Coming Soon', 'View applications in the next update.')}
          />
          <MenuItem
            icon="briefcase-outline"
            label="My Contracts"
            onPress={() => Alert.alert('Coming Soon', 'View contracts in the next update.')}
          />
          <MenuItem
            icon="star-outline"
            label="Reviews"
            onPress={() => Alert.alert('Coming Soon', 'View reviews in the next update.')}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>

          <MenuItem
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => Alert.alert('Help', 'Visit intemso.com/help for support.')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Visit intemso.com/privacy for our policy.')}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About Intemso"
            subtitle="Version 1.0.0"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={menuStyles.item} onPress={onPress} activeOpacity={0.6}>
      <Ionicons name={icon} size={22} color={Colors.textSecondary} />
      <View style={menuStyles.labelContainer}>
        <Text style={menuStyles.label}>{label}</Text>
        {subtitle && <Text style={menuStyles.subtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  labelContainer: { flex: 1 },
  label: { fontSize: FontSize.md, color: Colors.text },
  subtitle: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  name: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginTop: Spacing.md },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  roleBadge: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight + '15',
  },
  roleText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', textTransform: 'capitalize' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.sm },
  walletCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  walletHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  walletTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textInverse },
  walletBalance: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.textInverse },
  walletLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  menuSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  logoutText: { fontSize: FontSize.md, color: Colors.error, fontWeight: '600' },
});
