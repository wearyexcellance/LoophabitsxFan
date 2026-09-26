import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { DAY_CELL_WIDTH } from '../theme/layout';
import { shortDate, weekdayLetter } from '../utils/dateFormat';
import { todayKey } from '../utils/storage';

// Date header for the scrollable day columns (sits to the right of the
// frozen name column, inside the same horizontal ScrollView as the rows).
export default function DaysHeader({ days }) {
  const today = todayKey();
  return (
    <View style={styles.row}>
      {days.map((dateKey) => (
        <View key={dateKey} style={styles.cell}>
          <Text style={[styles.weekday, dateKey === today && styles.today]}>{weekdayLetter(dateKey)}</Text>
          <Text style={[styles.date, dateKey === today && styles.today]}>{shortDate(dateKey)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 6 },
  cell: { width: DAY_CELL_WIDTH, alignItems: 'center' },
  weekday: { fontSize: 10, color: colors.inkFaint, fontWeight: '700' },
  date: { fontSize: 10, color: colors.inkFaint, marginTop: 1 },
  today: { color: colors.primary },
});
