# Loop Habits 2

A React Native (Expo) habit tracker inspired by Loop Habits, with a
weighted scoring model.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android), or press `i` / `a` for a
simulator, or `w` for web.

## How habits work

Each habit is one of two types:

- **Yes / No** — tap a day to cycle unmarked → done → missed → unmarked.
- **Number** — tap a day to enter a value, checked against a goal that is
  either **at least** X or **at most** X (e.g. "at least 30 pages",
  "at most 500 kcal").

Every habit also has a **coefficient** (1x–5x) — how much it counts
toward your overall score. A 3x habit pulls the total three times as
hard as a 1x habit.

## Scoring

- Each day resolves to a completion fraction 0–1 (yes/no is 1 or 0;
  numeric goals give partial credit — e.g. 15/30 pages = 0.5).
- A habit's score is the average of that fraction over the trailing
  30 days, shown as a percentage (`src/utils/scoring.js`).
- The **overall score** on the home screen is the coefficient-weighted
  average across every habit:
  `overall = Σ(habitScore_i × coefficient_i) / Σ(coefficient_i)`

## What's new

- **Dark theme** throughout.
- **Scrollable day history** — the home screen's day columns go back ~60
  days; the habit name column stays frozen on the left while you scroll
  sideways through history. It opens already scrolled to today.
- **Deleting, with confirmation** — hold a routine's name (home screen) or
  use "Delete routine" (detail screen) to remove it; either way you land
  back on the home screen with a "Habit successfully deleted" popup once
  it's gone. "Clear" in the day-entry popups removes a single day's entry.
- **General stats screen** (tap the score ring on the home screen):
  overall score, active/best streaks, an 8-week trend, and routines ranked
  by score.
- **Per-habit stats**: 7/30-day score, current streak, best streak ever,
  total days completed, and (for numeric habits) the average value.
- **GitHub-style activity graph** on each habit's detail screen — a
  26-week heatmap of daily completion, alongside the existing month
  calendar used for entering exact values.
- **Excel backup & restore** (Stats screen → Backup section): exports
  every routine and its full history to an `.xlsx` file (one sheet of
  habit config, one sheet of every logged entry) via the share sheet, and
  can restore from a previously exported file, replacing what's on the
  device.

## Structure

```
App.js                        entry point
src/theme/colors.js            design tokens
src/utils/storage.js           AsyncStorage persistence
src/utils/scoring.js           scoring engine
src/context/HabitsContext.js   habit state + CRUD
src/components/HabitNameCell.js    frozen name column cell (tap/hold)
src/components/HabitRow.js         scrollable day-cells strip for one habit
src/components/DaysHeader.js       date header for the scrollable columns
src/theme/layout.js                shared row/column sizing constants
src/utils/backup.js                Excel export/import
src/screens/HomeScreen.js          overall score + scrollable day table, delete
src/screens/AddHabitScreen.js      create a habit (type, goal, color, coefficient)
src/screens/HabitDetailScreen.js   per-habit stats, heatmap, calendar, delete
src/screens/StatsScreen.js         overall stats, weekly trend, ranking, backup
src/navigation/AppNavigator.js
```
