import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius } from '../theme/colors';
import { ROW_HEIGHT, ROW_GAP, DAY_CELL_WIDTH } from '../theme/layout';
import { todayKey } from '../utils/storage';

// Renders just the scrollable strip of day cells for one habit (the name
// column is a separate frozen component so it can stay fixed while this
// part scrolls horizontally).
export default function HabitRow({ habit, days, onDayPress }) {
  const today = todayKey();

  return (
    <View style={styles.row}>
      {days.map((dateKey, i) => {
        const isFuture = dateKey > today;
        const beforeCreation = habit.createdAt && dateKey < habit.createdAt;
        const disabled = isFuture || beforeCreation;
        const value = habit.entries?.[dateKey];
        const isLast = i === days.length - 1;

        let cellStyle = [styles.dayCell, isLast && styles.dayCellLast];
        let content = null;

        if (disabled) {
          cellStyle.push(styles.dayCellDisabled);
        } else if (habit.type === 'boolean') {
          if (value === true) {
            cellStyle.push({ backgroundColor: habit.color });
            content = <Text style={styles.markOnColor}>✓</Text>;
          } else if (value === false) {
            cellStyle.push(styles.dayCellMissed);
            content = <Text style={styles.markMissed}>✕</Text>;
          } else {
            cellStyle.push(styles.dayCellEmpty);
          }
        } else {
          if (value !== undefined) {
            cellStyle.push({ backgroundColor: colors.surfaceRaised });
            content = <Text style={styles.numberMark}>{value}</Text>;
          } else {
            cellStyle.push(styles.dayCellEmpty);
          }
        }

        return (
          <TouchableOpacity
            key={dateKey}
            style={cellStyle}
            disabled={disabled}
            onPress={() => onDayPress(dateKey)}
          >
            {content}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
    marginBottom: ROW_GAP,
    backgroundColor: colors.surface,
    borderTopRightRadius: radius.md,
    borderBottomRightRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dayCell: {
    width: DAY_CELL_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  dayCellLast: {},
  dayCellEmpty: { backgroundColor: colors.surfaceAlt },
  dayCellDisabled: { backgroundColor: colors.surface },
  dayCellMissed: { backgroundColor: colors.dangerSoft },
  markOnColor: { color: '#14161A', fontWeight: '800', fontSize: 16 },
  markMissed: { color: colors.danger, fontWeight: '800', fontSize: 14 },
  numberMark: { color: colors.ink, fontWeight: '700', fontSize: 12 },
});
