import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { ROW_HEIGHT, ROW_GAP, NAME_COLUMN_WIDTH } from '../theme/layout';
import { habitScore } from '../utils/scoring';
import { todayKey } from '../utils/storage';

export default function HabitNameCell({ habit, onPress, onLongPress }) {
  const today = todayKey();
  const score = habitScore(habit, today);

  return (
    <TouchableOpacity
      style={styles.cell}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      activeOpacity={0.75}
    >
      <View style={[styles.dot, { backgroundColor: habit.color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>
          {habit.name}
        </Text>
        <Text style={styles.subtext}>
          {habit.coefficient || 1}x · {score}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    width: NAME_COLUMN_WIDTH,
    height: ROW_HEIGHT,
    marginBottom: ROW_GAP,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { fontSize: 13, fontWeight: '700', color: colors.ink },
  subtext: { fontSize: 10, color: colors.inkMuted, marginTop: 1 },
});
