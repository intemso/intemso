import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { gigsApi, applicationsApi, connectsApi, GigListItem } from '../../lib/api';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme';

interface GigDetailScreenProps {
  gigId: string;
  onBack: () => void;
}

export function GigDetailScreen({ gigId, onBack }: GigDetailScreenProps) {
  const { user, isAuthenticated } = useAuth();
  const [gig, setGig] = useState<(GigListItem & { applications: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyNote, setApplyNote] = useState('');
  const [suggestedRate, setSuggestedRate] = useState('');
  const [connectBalance, setConnectBalance] = useState<number | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadGig();
  }, [gigId]);

  const loadGig = async () => {
    try {
      const data = await gigsApi.getById(gigId);
      setGig(data);
      if (data.applications?.length > 0) {
        setHasApplied(true);
      }
      if (isAuthenticated && user?.role === 'student') {
        const bal = await connectsApi.getBalance();
        setConnectBalance(bal.balance);
      }
    } catch {
      Alert.alert('Error', 'Could not load gig details');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!gig) return;
    setApplying(true);
    try {
      await applicationsApi.apply(gig.id, {
        note: applyNote || undefined,
        suggestedRate: suggestedRate ? Number(suggestedRate) : undefined,
      });
      setHasApplied(true);
      setShowApplyForm(false);
      Alert.alert('Applied!', 'Your application has been submitted.');
    } catch (err: any) {
      const msg = Array.isArray(err.message) ? err.message[0] : err.message;
      Alert.alert('Application Failed', msg || 'Something went wrong');
    } finally {
      setApplying(false);
    }
  };

  if (loading || !gig) return <LoadingScreen />;

  const formatBudget = () => {
    if (gig.budgetType === 'hourly') {
      const min = gig.budgetMin ? `GH₵${Number(gig.budgetMin).toFixed(0)}` : '';
      const max = gig.budgetMax ? `GH₵${Number(gig.budgetMax).toFixed(0)}` : '';
      if (min && max) return `${min} - ${max}/hr`;
      return `${min || max}/hr`;
    }
    const min = gig.budgetMin ? `GH₵${Number(gig.budgetMin).toFixed(0)}` : '';
    const max = gig.budgetMax ? `GH₵${Number(gig.budgetMax).toFixed(0)}` : '';
    if (min && max && min !== max) return `${min} - ${max}`;
    return max || min || 'Negotiable';
  };

  const isOwner = user?.role === 'employer' && gig.employer.id === user.id;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Gig Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topSection}>
          <Text style={styles.employer}>{gig.employer.businessName}</Text>
          <Text style={styles.title}>{gig.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{formatBudget()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={Colors.primary} />
              <Text style={styles.metaText}>
                {gig.locationType === 'remote' ? 'Remote' : gig.locationType === 'hybrid' ? 'Hybrid' : 'On-site'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="bar-chart-outline" size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{gig.experienceLevel} level</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{gig.applicationsCount} applied</Text>
            </View>
          </View>

          {gig.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{gig.category.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {gig.description.replace(/<[^>]*>/g, '')}
          </Text>
        </View>

        {gig.requiredSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skills}>
              {gig.requiredSkills.map((skill) => (
                <View key={skill} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Budget Type</Text>
            <Text style={styles.detailValue}>{gig.budgetType === 'hourly' ? 'Hourly' : 'Fixed Price'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Project Scope</Text>
            <Text style={styles.detailValue}>{gig.projectScope || 'Not specified'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Urgency</Text>
            <Text style={styles.detailValue}>{gig.urgency || 'Normal'}</Text>
          </View>
          {gig.deadline && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Deadline</Text>
              <Text style={styles.detailValue}>{new Date(gig.deadline).toLocaleDateString()}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Connects Required</Text>
            <Text style={styles.detailValue}>{gig.connectsRequired}</Text>
          </View>
        </View>

        {showApplyForm && (
          <View style={styles.applyForm}>
            <Text style={styles.sectionTitle}>Quick Apply</Text>
            {connectBalance !== null && (
              <Text style={styles.connectInfo}>
                Connect balance: {connectBalance} (costs {gig.connectsRequired})
              </Text>
            )}
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note (optional, 280 chars max)"
              placeholderTextColor={Colors.textTertiary}
              value={applyNote}
              onChangeText={setApplyNote}
              maxLength={280}
              multiline
              numberOfLines={3}
            />
            {gig.budgetType === 'hourly' && (
              <TextInput
                style={styles.rateInput}
                placeholder="Suggested hourly rate (GH₵)"
                placeholderTextColor={Colors.textTertiary}
                value={suggestedRate}
                onChangeText={setSuggestedRate}
                keyboardType="numeric"
              />
            )}
            <View style={styles.applyActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowApplyForm(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Submit Application"
                onPress={handleApply}
                loading={applying}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {!isOwner && user?.role === 'student' && (
        <View style={styles.bottomBar}>
          {hasApplied ? (
            <View style={styles.appliedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.appliedText}>Already Applied</Text>
            </View>
          ) : (
            <Button
              title="Easy Apply"
              onPress={() => setShowApplyForm(true)}
              size="lg"
              style={styles.applyBtn}
              icon={<Ionicons name="flash" size={20} color={Colors.textInverse} />}
            />
          )}
        </View>
      )}

      {!isAuthenticated && (
        <View style={styles.bottomBar}>
          <Text style={styles.loginPrompt}>Sign in to apply for this gig</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, flex: 1, textAlign: 'center' },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  topSection: { marginBottom: Spacing.xl },
  employer: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600', marginBottom: Spacing.xs },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, lineHeight: 30, marginBottom: Spacing.md },
  metaRow: { flexDirection: 'row', gap: Spacing.xl, marginBottom: Spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500', textTransform: 'capitalize' },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  categoryText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  description: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  skillBadge: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  skillText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundTertiary,
  },
  detailLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  detailValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600', textTransform: 'capitalize' },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  applyBtn: { width: '100%' },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  appliedText: { fontSize: FontSize.md, color: Colors.success, fontWeight: '600' },
  loginPrompt: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  applyForm: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  connectInfo: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    backgroundColor: Colors.background,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  rateInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    backgroundColor: Colors.background,
    marginBottom: Spacing.md,
  },
  applyActions: { flexDirection: 'row', gap: Spacing.md },
});
