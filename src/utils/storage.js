import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_KEY = 'loop_habits_2:habits';

// A habit looks like:
// {
//   id: string,
//   name: string,
//   color: '#C9184A',
//   type: 'boolean' | 'numeric',
//   unit: 'pages' | 'miles' | ... (numeric only),
//   goalType: 'atLeast' | 'atMost' (numeric only),
//   goalValue: number (numeric only),
//   coefficient: 1 | 2 | 3 | 4 | 5,   // weight in the overall score
//   createdAt: 'YYYY-MM-DD',
//   entries: { 'YYYY-MM-DD': true|false } or { 'YYYY-MM-DD': number }
// }

export async function loadHabits() {
  try {
    const raw = await AsyncStorage.getItem(HABITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('loadHabits failed', e);
    return [];
  }
}

export async function persistHabits(habits) {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    return true;
  } catch (e) {
    console.warn('persistHabits failed', e);
    return false;
  }
}

export function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
