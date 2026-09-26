import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Pressable } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { dailyCompletion } from '../utils/scoring';
import { todayKey } from '../utils/storage';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function buildMonthCells(year, month) {
  // month is 0-indexed
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function keyFor(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${m}-${dd}`;
}

export default function CalendarGrid({ habit, onChangeEntry }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [editingKey, setEditingKey] = useState(null);
  const [draftValue, setDraftValue] = useState('');

  const today = todayKey();
  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);
  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  function goPrevMonth() {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  }

  function goNextMonth() {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  }

  function handleTap(dateKey) {
    if (dateKey > today) return; // no future entries
    if (habit.type === 'boolean') {
      const current = habit.entries?.[dateKey];
      // cycle: unmarked -> done -> missed -> unmarked
      const next = current === undefined ? true : current === true ? false : undefined;
      onChangeEntry(dateKey, next);
    } else {
      const existing = habit.entries?.[dateKey];
      setDraftValue(existing !== undefined ? String(existing) : '');
      setEditingKey(dateKey);
    }
  }

  function confirmNumericEntry() {
    const parsed = parseFloat(draftValue.replace(',', '.'));
    onChangeEntry(editingKey, Number.isFinite(parsed) ? parsed : undefined);
    setEditingKey(null);
    setDraftValue('');
  }

  function cellStyleFor(dateKey, isFuture) {
    if (isFuture) return { backgroundColor: colors.surfaceAlt };
    if (habit.type === 'boolean') {
      const v = habit.entries?.[dateKey];
      if (v === true) return { backgroundColor: habit.color };
      if (v === false) return { backgroundColor: colors.surfaceAlt, borderColor: colors.danger, borderWidth: 1 };
      return { backgroundColor: colors.surfaceAlt };
    }
    const completion = dailyCompletion(habit, habit.entries?.[dateKey]);
    if (habit.entries?.[dateKey] === undefined) return { backgroundColor: colors.surfaceAlt };
    // Blend habit color opacity by completion fraction (min 25% so it's visible)
    const alpha = Math.round((0.25 + 0.75 * completion) * 255)
      .toString(16)
      .padStart(2, '0');
    return { backgroundColor: `${habit.color}${alpha}` };
  }

  function cellTextFor(dateKey, isFuture) {
    if (isFuture) return null;
    if (habit.type === 'boolean') {
      const v = habit.entries?.[dateKey];
      if (v === true) return '✓';
      if (v === false) return '✕';
      return null;
    }
    const v = habit.entries?.[dateKey];
    return v !== undefined ? String(v) : null;
  }

  return (
    <View>
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={goPrevMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={goNextMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.weekdayLabel}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (day === null) return <View key={idx} style={styles.cell} />;
          const dateKey = keyFor(year, month, day);
          const isFuture = dateKey > today;
          const isToday = dateKey === today;
          const beforeCreation = habit.createdAt && dateKey < habit.createdAt;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.cell,
                styles.dayCell,
                cellStyleFor(dateKey, isFuture || beforeCreation),
                isToday && styles.todayOutline,
              ]}
              disabled={isFuture || beforeCreation}
              onPress={() => handleTap(dateKey)}
            >
              <Text
                style={[
                  styles.dayNumber,
                  (habit.entries?.[dateKey] === true) && styles.dayNumberOnColor,
                ]}
              >
                {day}
              </Text>
              {cellTextFor(dateKey, isFuture || beforeCreation) ? (
                <Text style={styles.dayMark}>{cellTextFor(dateKey, isFuture || beforeCreation)}</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal visible={editingKey !== null} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setEditingKey(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{editingKey}</Text>
            <Text style={styles.modalSubtitle}>
              {habit.goalType === 'atLeast' ? 'At least' : 'At most'} {habit.goalValue} {habit.unit}
            </Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder={`Value in ${habit.unit || 'units'}`}
              value={draftValue}
              onChangeText={setDraftValue}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalGhostBtn}
                onPress={() => {
                  onChangeEntry(editingKey, undefined);
                  setEditingKey(null);
                  setDraftValue('');
                }}
              >
                <Text style={styles.modalClearText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalGhostBtn} onPress={() => setEditingKey(null)}>
                <Text style={styles.modalGhostBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryBtn} onPress={confirmNumericEntry}>
                <Text style={styles.modalPrimaryBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  navBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  navBtnText: { fontSize: 20, color: colors.inkMuted },
  monthLabel: { ...{ fontSize: 15, fontWeight: '700', color: colors.ink }, minWidth: 150, textAlign: 'center' },
  weekdayRow: { flexDirection: 'row', marginBottom: spacing.xs },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 11,
    color: colors.inkFaint,
    fontWeight: '600',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL_SIZE, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  dayCell: { borderRadius: radius.sm },
  todayOutline: { borderWidth: 1.5, borderColor: colors.ink },
  dayNumber: { fontSize: 11, color: colors.inkMuted, fontWeight: '600' },
  dayNumberOnColor: { color: '#14161A' },
  dayMark: { fontSize: 10, color: colors.ink, marginTop: 1 },
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
    padding: spacing.lg,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  modalSubtitle: { fontSize: 13, color: colors.inkMuted, marginTop: 2, marginBottom: spacing.md },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.ink,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.sm },
  modalGhostBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  modalGhostBtnText: { color: colors.inkMuted, fontWeight: '600' },
  modalClearText: { color: colors.danger, fontWeight: '600' },
  modalPrimaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  modalPrimaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
