import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { todayKey } from './storage';

// Writes two sheets:
//   "Habits"  — one row per habit with its config
//   "Entries" — one row per logged day (habitId, habitName, date, value)
// so the file is both a human-readable backup and something we can
// losslessly rebuild the app's state from.
export async function exportBackup(habits) {
  const habitsSheet = habits.map((h) => ({
    id: h.id,
    name: h.name,
    type: h.type,
    unit: h.unit || '',
    goalType: h.goalType || '',
    goalValue: h.goalValue ?? '',
    coefficient: h.coefficient || 1,
    color: h.color,
    createdAt: h.createdAt,
  }));

  const entriesSheet = [];
  habits.forEach((h) => {
    Object.entries(h.entries || {}).forEach(([date, value]) => {
      entriesSheet.push({
        habitId: h.id,
        habitName: h.name,
        date,
        value: typeof value === 'boolean' ? (value ? 'YES' : 'NO') : value,
      });
    });
  });
  entriesSheet.sort((a, b) => (a.date < b.date ? -1 : 1));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(habitsSheet), 'Habits');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(entriesSheet), 'Entries');

  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  const fileUri = `${FileSystem.documentDirectory}loop-habits-backup-${todayKey()}.xlsx`;
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Save your Loop Habits backup',
      UTI: 'org.openxmlformats.spreadsheetml.sheet',
    });
  }

  return fileUri;
}

// Lets the user pick an .xlsx backup and rebuilds the habit list from it.
// Returns the parsed habits array, or null if the user cancelled.
export async function importBackup() {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets || result.assets.length === 0) return null;

  const fileUri = result.assets[0].uri;
  const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
  const workbook = XLSX.read(base64, { type: 'base64' });

  const habitsRows = workbook.Sheets['Habits'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Habits']) : [];
  const entriesRows = workbook.Sheets['Entries'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Entries']) : [];

  const habitsById = {};
  habitsRows.forEach((row) => {
    const id = String(row.id);
    habitsById[id] = {
      id,
      name: String(row.name || 'Untitled'),
      type: row.type === 'numeric' ? 'numeric' : 'boolean',
      unit: row.unit || undefined,
      goalType: row.goalType || undefined,
      goalValue: row.goalValue !== '' && row.goalValue !== undefined ? Number(row.goalValue) : undefined,
      coefficient: Number(row.coefficient) || 1,
      color: row.color || '#FF4D7E',
      createdAt: row.createdAt || todayKey(),
      entries: {},
    };
  });

  entriesRows.forEach((row) => {
    const habit = habitsById[String(row.habitId)];
    if (!habit || !row.date) return;
    let value = row.value;
    if (value === 'YES') value = true;
    else if (value === 'NO') value = false;
    else value = Number(value);
    habit.entries[row.date] = value;
  });

  return Object.values(habitsById);
}
