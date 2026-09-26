import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, type } from '../theme/colors';
import { useHabits } from '../context/HabitsContext';
import ScoreRing from '../components/ScoreRing';
import { overallScore, habitScore, currentStreak, bestStreak, weeklyOverallScores } from '../utils/scoring';
import { todayKey } from '../utils/storage';
import { exportBackup, importBackup } from '../utils/backup';

export default function StatsScreen() {
  const { habits, restoreHabits } = useHabits();
  const [working, setWorking] = useState(false);
  const today = todayKey();
  const score = overallScore(habits, today);
  const weekly = weeklyOverallScores(habits, today, 8);

  const ranked = [...habits]
    .map((h) => ({ habit: h, score: habitScore(h, today) }))
    .sort((a, b) => b.score - a.score);

  const longestStreak = habits.reduce(
    (max, h) => Math.max(max, currentStreak(h, today)),
    0
  );
  const allTimeBest = habits.reduce((max, h) => Math.max(max, bestStreak(h)), 0);

  async function handleBackup() {
    if (habits.length === 0) {
      Alert.alert('Nothing to back up', 'Add a routine first.');
      return;
    }
    setWorking(true);
    try {
      await exportBackup(habits);
    } catch (e) {
      Alert.alert('Backup failed', e.message || 'Something went wrong while creating the file.');
    } finally {
      setWorking(false);
    }
  }

  async function handleRestore() {
    setWorking(true);
    try {
      const restored = await importBackup();
      if (!restored) {
        setWorking(false);
        return;
      }
      Alert.alert(
        'Restore backup',
        `This file has ${restored.length} routine${restored.length === 1 ? '' : 's'}. Replace everything currently on this device with it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace',
            style: 'destructive',
            onPress: () => {
              restoreHabits(restored);
              Alert.alert('Restored', 'Your backup has been loaded.');
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Restore failed', e.message || "Couldn't read that file.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroRow}>
          <ScoreRing score={score} size={88} strokeWidth={9} label="overall" />
          <View style={{ marginLeft: spacing.lg, flex: 1 }}>
            <Text style={type.title}>Overall score</Text>
            <Text style={styles.heroBody}>
              Weighted average of every routine's 30-day score, by coefficient.
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Routines" value={String(habits.length)} />
          <StatCard label="Active streak" value={`${longestStreak}d`} />
          <StatCard label="Best streak ever" value={`${allTimeBest}d`} />
        </View>

        <Text style={styles.sectionTitle}>Last 8 weeks</Text>
        <View style={styles.chartCard}>
          <View style={styles.barsRow}>
            {weekly.map((w, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${Math.max(4, w.score)}%` }]} />
                </View>
                <Text style={styles.barLabel}>{w.score}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>By routine</Text>
        <View style={styles.chartCard}>
          {ranked.length === 0 ? (
            <Text style={styles.emptyText}>Add a routine to see it ranked here.</Text>
          ) : (
            ranked.map(({ habit, score: s }, i) => (
              <View key={habit.id} style={[styles.rankRow, i > 0 && styles.rankRowDivider]}>
                <View style={[styles.rankDot, { backgroundColor: habit.color }]} />
                <Text style={styles.rankName} numberOfLines={1}>
                  {habit.name}
                </Text>
                <Text style={styles.rankCoefficient}>{habit.coefficient || 1}x</Text>
                <Text style={[styles.rankScore, { color: habit.color }]}>{s}%</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Backup</Text>
        <View style={styles.chartCard}>
          <Text style={styles.backupBody}>
            Save every routine and its full history to an Excel file, or restore from one you
            saved earlier. Restoring replaces everything currently on this device.
          </Text>
          <View style={styles.backupActions}>
            <TouchableOpacity style={styles.backupBtn} onPress={handleBackup} disabled={working}>
              <Text style={styles.backupBtnText}>Backup to Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backupBtnGhost} onPress={handleRestore} disabled={working}>
              <Text style={styles.backupBtnGhostText}>Restore from Excel</Text>
            </TouchableOpacity>
          </View>
          {working && <ActivityIndicator style={{ marginTop: spacing.md }} color={colors.primary} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  heroBody: { ...type.caption, marginTop: 4 },
  statsGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.ink },
  statLabel: { fontSize: 11, color: colors.inkMuted, marginTop: 2, textAlign: 'center' },
  sectionTitle: { ...type.subtitle, marginBottom: spacing.sm },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110 },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: 16,
    height: 80,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', backgroundColor: colors.primary, borderRadius: 6 },
  barLabel: { fontSize: 10, color: colors.inkMuted, marginTop: 4 },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  rankRowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  rankDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  rankName: { flex: 1, fontSize: 14, color: colors.ink, fontWeight: '600' },
  rankCoefficient: { fontSize: 11, color: colors.inkMuted, marginRight: spacing.sm },
  rankScore: { fontSize: 14, fontWeight: '700' },
  emptyText: { ...type.caption },
  backupBody: { ...type.caption, marginBottom: spacing.md, lineHeight: 17 },
  backupActions: { flexDirection: 'row', gap: spacing.sm },
  backupBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  backupBtnText: { color: '#14161A', fontWeight: '700', fontSize: 13 },
  backupBtnGhost: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  backupBtnGhostText: { color: colors.ink, fontWeight: '700', fontSize: 13 },
});
