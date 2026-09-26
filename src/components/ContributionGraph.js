import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { dailyCompletion, addDays } from '../utils/scoring';
import { todayKey } from '../utils/storage';

const CELL = 11;
const GAP = 3;
const WEEKS = 26; // ~half a year, keeps the scroll width reasonable on phones

function buildWeeks(todayStr) {
  // Find the Sunday on/before (today - (WEEKS*7 - 1)) so columns line up
  // as whole Sun-Sat weeks, GitHub-style.
  const roughStart = addDays(todayStr, -(WEEKS * 7 - 1));
  const roughStartDow = new Date(roughStart + 'T00:00:00').getDay();
  const alignedStart = addDays(roughStart, -roughStartDow);

  const weeks = [];
  let cursor = alignedStart;
  for (let w = 0; w < WEEKS + 1; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(cursor <= todayStr ? cursor : null);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export default function ContributionGraph({ habit }) {
  const today = todayKey();
  const weeks = useMemo(() => buildWeeks(today), [today]);

  // Month label above the first week of each new month.
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = null;
    weeks.forEach((week, idx) => {
      const firstValid = week.find((d) => d);
      if (!firstValid) return;
      const month = firstValid.slice(0, 7);
      if (month !== lastMonth) {
        labels.push({
          idx,
          text: new Date(firstValid + 'T00:00:00').toLocaleDateString(undefined, { month: 'short' }),
        });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  function colorFor(dateKey) {
    if (!dateKey) return 'transparent';
    if (habit.createdAt && dateKey < habit.createdAt) return colors.surfaceAlt;
    const entry = habit.entries?.[dateKey];
    if (entry === undefined) return colors.surfaceAlt;
    const completion = dailyCompletion(habit, entry);
    if (completion <= 0) return colors.dangerSoft;
    const alpha = Math.round((0.25 + 0.75 * completion) * 255)
      .toString(16)
      .padStart(2, '0');
    return `${habit.color}${alpha}`;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.monthRow}>
          {monthLabels.map((m, i) => (
            <Text key={i} style={[styles.monthLabel, { left: m.idx * (CELL + GAP) }]}>
              {m.text}
            </Text>
          ))}
        </View>
        <View style={styles.weeksRow}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekCol}>
              {week.map((dateKey, di) => (
                <View
                  key={di}
                  style={[
                    styles.cell,
                    { backgroundColor: colorFor(dateKey) },
                    dateKey === today && styles.todayCell,
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  monthRow: { height: 16, position: 'relative' },
  monthLabel: { position: 'absolute', fontSize: 10, color: colors.inkMuted, fontWeight: '600' },
  weeksRow: { flexDirection: 'row', marginTop: spacing.xs },
  weekCol: { marginRight: GAP },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 2,
    marginBottom: GAP,
  },
  todayCell: { borderWidth: 1, borderColor: colors.ink },
});
