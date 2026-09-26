import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors, habitPalette, radius, spacing, type } from '../theme/colors';
import { useHabits } from '../context/HabitsContext';

const COEFFICIENTS = [1, 2, 3, 4, 5];

export default function AddHabitScreen({ navigation }) {
  const { addHabit } = useHabits();

  const [name, setName] = useState('');
  const [habitType, setHabitType] = useState('boolean'); // 'boolean' | 'numeric'
  const [unit, setUnit] = useState('');
  const [goalType, setGoalType] = useState('atLeast'); // 'atLeast' | 'atMost'
  const [goalValue, setGoalValue] = useState('');
  const [color, setColor] = useState(habitPalette[0]);
  const [coefficient, setCoefficient] = useState(1);

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Give it a name', 'Every routine needs a short name.');
      return;
    }
    if (habitType === 'numeric' && (!goalValue || isNaN(parseFloat(goalValue)))) {
      Alert.alert('Set a goal', 'Enter a numeric goal for this routine.');
      return;
    }

    const habit = {
      name: name.trim(),
      type: habitType,
      color,
      coefficient,
      ...(habitType === 'numeric'
        ? { unit: unit.trim(), goalType, goalValue: parseFloat(goalValue) }
        : {}),
    };
    addHabit(habit);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.title}>New routine</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Read books"
          placeholderTextColor={colors.inkFaint}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>How is it tracked?</Text>
        <View style={styles.segmented}>
          <SegButton label="Yes / No" active={habitType === 'boolean'} onPress={() => setHabitType('boolean')} />
          <SegButton label="Number" active={habitType === 'numeric'} onPress={() => setHabitType('numeric')} />
        </View>

        {habitType === 'numeric' && (
          <>
            <Text style={styles.label}>Unit</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. pages, miles, minutes"
              placeholderTextColor={colors.inkFaint}
              value={unit}
              onChangeText={setUnit}
            />

            <Text style={styles.label}>Goal type</Text>
            <View style={styles.segmented}>
              <SegButton label="At least" active={goalType === 'atLeast'} onPress={() => setGoalType('atLeast')} />
              <SegButton label="At most" active={goalType === 'atMost'} onPress={() => setGoalType('atMost')} />
            </View>

            <Text style={styles.label}>Goal value</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 30"
              placeholderTextColor={colors.inkFaint}
              keyboardType="numeric"
              value={goalValue}
              onChangeText={setGoalValue}
            />
          </>
        )}

        <Text style={styles.label}>Color</Text>
        <View style={styles.colorRow}>
          {habitPalette.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, c === color && styles.colorDotActive]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <Text style={styles.label}>Coefficient</Text>
        <Text style={styles.helper}>
          How much this routine should count toward your overall score. A 3x habit counts three
          times as much as a 1x habit.
        </Text>
        <View style={styles.segmented}>
          {COEFFICIENTS.map((c) => (
            <SegButton key={c} label={`${c}x`} active={coefficient === c} onPress={() => setCoefficient(c)} />
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Create routine</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SegButton({ label, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.segBtn, active && styles.segBtnActive]} onPress={onPress}>
      <Text style={[styles.segBtnText, active && styles.segBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: { ...type.subtitle, marginTop: spacing.lg, marginBottom: spacing.xs },
  helper: { ...type.caption, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.ink,
  },
  segmented: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  segBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  segBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segBtnText: { fontSize: 13, fontWeight: '600', color: colors.inkMuted },
  segBtnTextActive: { color: '#14161A' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  colorDot: { width: 32, height: 32, borderRadius: radius.pill },
  colorDotActive: { borderWidth: 3, borderColor: colors.ink },
  saveBtn: {
    marginTop: spacing.xxl,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveBtnText: { color: '#14161A', fontSize: 16, fontWeight: '700' },
});
