import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, Spacing } from '../theme';
import type { GigListItem } from '../lib/api';

interface GigCardProps {
  gig: GigListItem;
  onPress: () => void;
}

export function GigCard({ gig, onPress }: GigCardProps) {
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

  const timeAgo = () => {
    const date = new Date(gig.publishedAt || gig.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.employer} numberOfLines={1}>
            {gig.employer.businessName}
          </Text>
          <Text style={styles.time}>{timeAgo()}</Text>
        </View>
        <View style={styles.budgetBadge}>
          <Text style={styles.budgetText}>{formatBudget()}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>{gig.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {gig.description.replace(/<[^>]*>/g, '')}
      </Text>

      {gig.requiredSkills.length > 0 && (
        <View style={styles.skills}>
          {gig.requiredSkills.slice(0, 4).map((skill) => (
            <View key={skill} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {gig.requiredSkills.length > 4 && (
            <Text style={styles.moreSkills}>+{gig.requiredSkills.length - 4}</Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.footerText}>
            {gig.locationType === 'remote' ? 'Remote' : gig.locationType === 'hybrid' ? 'Hybrid' : 'On-site'}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="briefcase-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.footerText}>{gig.experienceLevel}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="people-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.footerText}>{gig.applicationsCount} applied</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  employer: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  budgetBadge: {
    backgroundColor: Colors.primaryLight + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  budgetText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  skillBadge: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  skillText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textTransform: 'capitalize',
  },
});
