import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { colors, radius, spacing, type } from '../theme/colors';
import { NAME_COLUMN_WIDTH } from '../theme/layout';
import { useHabits } from '../context/HabitsContext';
import HabitRow from '../components/HabitRow';
import HabitNameCell from '../components/HabitNameCell';
import DaysHeader from '../components/DaysHeader';
import ScoreRing from '../components/ScoreRing';
import { overallScore, addDays } from '../utils/scoring';
import { todayKey } from '../utils/storage';

// How far back the day columns go. 5 recent days are visible by default;
// scrolling left reveals the rest, all the way back ~2 months.
const DAYS_TOTAL = 60;
const HEADER_SPACER_HEIGHT = 34;

export default function HomeScreen({ navigation, route }) {
  const { habits, setEntry, deleteHabit } = useHabits();
  const today = todayKey();
  const score = overallScore(habits, today);
  const days = Array.from({ length: DAYS_TOTAL }, (_, i) => addDays(today, -(DAYS_TOTAL - 1 - i)));

  const scrollRef = useRef(null);

  const [numericModal, setNumericModal] = useState(null); // { habit, dateKey }
  const [draftValue, setDraftValue] = useState('');

  // Show a confirmation popup after a delete triggered from the detail screen.
  useEffect(() => {
    if (route?.params?.justDeleted) {
      const name = route.params.justDeleted;
      navigation.setParams({ justDeleted: undefined });
      Alert.alert('Habit successfully deleted', `"${name}" and its history have been removed.`);
    }
  }, [route?.params?.justDeleted]);

  function scrollToToday(animated = false) {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated }));
  }

  function handleDayPress(habit, dateKey) {
    if (habit.type === 'boolean') {
      const current = habit.entries?.[dateKey];
      const next = current === undefined ? true : current === true ? false : undefined;
      setEntry(habit.id, dateKey, next);
    } else {
      const existing = habit.entries?.[dateKey];
      setDraftValue(existing !== undefined ? String(existing) : '');
      setNumericModal({ habit, dateKey });
    }
  }

  function confirmNumericEntry() {
    const parsed = parseFloat(draftValue.replace(',', '.'));
    setEntry(numericModal.habit.id, numericModal.dateKey, Number.isFinite(parsed) ? parsed : undefined);
    setNumericModal(null);
    setDraftValue('');
  }

  function clearNumericEntry() {
    setEntry(numericModal.habit.id, numericModal.dateKey, undefined);
    setNumericModal(null);
    setDraftValue('');
  }

  function confirmDelete(habit) {
    Alert.alert('Delete routine', `Delete "${habit.name}" and all of its history? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteHabit(habit.id);
          Alert.alert('Habit successfully deleted', `"${habit.name}" and its history have been removed.`);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={type.display}>Loop Habits 2</Text>
          <Text style={styles.headerSubtitle}>
            {habits.length} routine{habits.length === 1 ? '' : 's'} tracked
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
          <ScoreRing score={score} size={64} strokeWidth={7} label="overall" />
        </TouchableOpacity>
      </View>

      {habits.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No routines yet</Text>
          <Text style={styles.emptyBody}>
            Add a habit to start tracking it day by day. Give it a weight so it
            counts more — or less — toward your overall score.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.tableWrap}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={styles.nameColumn}>
                  <View style={{ height: HEADER_SPACER_HEIGHT }} />
                  {habits.map((h) => (
                    <HabitNameCell
                      key={h.id}
                      habit={h}
                      onPress={() => navigation.navigate('HabitDetail', { habitId: h.id })}
                      onLongPress={() => confirmDelete(h)}
                    />
                  ))}
                </View>

                <ScrollView
                  ref={scrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  onContentSizeChange={() => scrollToToday(false)}
                >
                  <View>
                    <DaysHeader days={days} />
                    {habits.map((h) => (
                      <HabitRow key={h.id} habit={h} days={days} onDayPress={(d) => handleDayPress(h, d)} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            </ScrollView>
          </View>
          <Text style={styles.hint}>Scroll sideways for past days · tap a name to open · hold to delete</Text>
        </>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddHabit')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={numericModal !== null} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setNumericModal(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {numericModal && (
              <>
                <Text style={styles.modalTitle}>{numericModal.habit.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {numericModal.dateKey} ·{' '}
                  {numericModal.habit.goalType === 'atLeast' ? 'At least' : 'At most'}{' '}
                  {numericModal.habit.goalValue} {numericModal.habit.unit}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder={`Value in ${numericModal.habit.unit || 'units'}`}
                  placeholderTextColor={colors.inkFaint}
                  value={draftValue}
                  onChangeText={setDraftValue}
                  autoFocus
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalGhostBtn} onPress={clearNumericEntry}>
                    <Text style={styles.modalGhostBtnText}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalPrimaryBtn} onPress={confirmNumericEntry}>
                    <Text style={styles.modalPrimaryBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerSubtitle: { ...type.caption, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  emptyTitle: { ...type.title, marginBottom: spacing.sm },
  emptyBody: { ...type.body, color: colors.inkMuted, textAlign: 'center' },
  hint: { ...type.caption, textAlign: 'center', marginBottom: spacing.md },
  tableWrap: { flex: 1, paddingLeft: spacing.lg },
  nameColumn: { width: NAME_COLUMN_WIDTH },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: { color: '#14161A', fontSize: 28, fontWeight: '700', marginTop: -2 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  modalSubtitle: { fontSize: 12, color: colors.inkMuted, marginTop: 2, marginBottom: spacing.md },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.surfaceAlt,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.sm },
  modalGhostBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  modalGhostBtnText: { color: colors.danger, fontWeight: '600' },
  modalPrimaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  modalPrimaryBtnText: { color: '#14161A', fontWeight: '700' },
});
