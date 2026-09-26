import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { colors, radius, spacing, type } from '../theme/colors';
import { useHabits } from '../context/HabitsContext';
import ScoreRing from '../components/ScoreRing';
import CalendarGrid from '../components/CalendarGrid';
import ContributionGraph from '../components/ContributionGraph';
import {
  habitScore,
  currentStreak,
  bestStreak,
  totalCompletions,
  averageValue,
} from '../utils/scoring';
import { todayKey } from '../utils/storage';

export default function HabitDetailScreen({ route, navigation }) {
  const { habitId } = route.params;
  const { habits, setEntry, deleteHabit } = useHabits();
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.missing}>This routine was deleted.</Text>
      </SafeAreaView>
    );
  }

  const today = todayKey();
  const score30 = habitScore(habit, today, 30);
  const score7 = habitScore(habit, today, 7);
  const streak = currentStreak(habit, today);
  const best = bestStreak(habit);
  const completions = totalCompletions(habit);
  const avg = averageValue(habit);

  function confirmDelete() {
    Alert.alert('Delete routine', `Delete "${habit.name}" and all of its history? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteHabit(habit.id);
          navigation.navigate('Home', { justDeleted: habit.name });
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <View style={[styles.dot, { backgroundColor: habit.color }]} />
              <Text style={type.title}>{habit.name}</Text>
            </View>
            <Text style={styles.subtitle}>
              {habit.type === 'boolean'
                ? 'Yes / No routine'
                : `${habit.goalType === 'atLeast' ? 'At least' : 'At most'} ${habit.goalValue} ${habit.unit || ''}`}
              {'  ·  '}
              {habit.coefficient || 1}x weight
            </Text>
          </View>
          <ScoreRing score={score30} size={64} strokeWidth={7} color={habit.color} label="30d" />
        </View>

        <View style={styles.statsRow}>
          <Stat label="Last 7 days" value={`${score7}%`} />
          <Stat label="Last 30 days" value={`${score30}%`} />
          <Stat label="Streak" value={`${streak}d`} />
        </View>
        <View style={styles.statsRow}>
          <Stat label="Best streak" value={`${best}d`} />
          <Stat label="Total done" value={`${completions}`} />
          {habit.type === 'numeric' ? (
            <Stat label={`Avg ${habit.unit || ''}`.trim()} value={avg.toFixed(1)} />
          ) : (
            <Stat label="Type" value="Yes/No" />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity</Text>
          <ContributionGraph habit={habit} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>History</Text>
          <CalendarGrid habit={habit} onChangeEntry={(dateKey, value) => setEntry(habit.id, dateKey, value)} />
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
          <Text style={styles.deleteBtnText}>Delete routine</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  missing: { ...type.body, padding: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  subtitle: { ...type.caption, marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 17, fontWeight: '700', color: colors.ink },
  statLabel: { fontSize: 11, color: colors.inkMuted, marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  cardTitle: { ...type.subtitle, marginBottom: spacing.sm },
  deleteBtn: {
    alignItems: 'center',
    marginTop: spacing.xl,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerSoft,
  },
  deleteBtnText: { color: colors.danger, fontWeight: '700' },
});
