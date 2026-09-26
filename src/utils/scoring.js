// Scoring engine for Loop Habits 2.
//
// Every day, a habit resolves to a completion fraction between 0 and 1:
//   - boolean habits: 1 if marked done, else 0
//   - numeric "at least X" habits: min(value / goal, 1)  (partial credit under goal)
//   - numeric "at most X" habits: 1 if value <= goal, otherwise it decays
//     toward 0 the further over the limit the entry is
//
// A habit's own score is the average completion fraction over a trailing
// window of days (counting only days from the habit's creation date onward).
//
// The overall app score is the coefficient-weighted average of every
// habit's score, e.g. a 3x habit counts three times as much as a 1x habit.

export function dailyCompletion(habit, rawValue) {
  if (habit.type === 'boolean') {
    return rawValue === true ? 1 : 0;
  }

  // numeric
  const value = typeof rawValue === 'number' ? rawValue : 0;
  const goal = Number(habit.goalValue) || 0;
  if (goal <= 0) return value > 0 ? 1 : 0;

  if (habit.goalType === 'atLeast') {
    return Math.max(0, Math.min(1, value / goal));
  }

  // atMost: full credit at or under goal, credit decays past it
  if (value <= goal) return 1;
  const over = value - goal;
  return Math.max(0, 1 - over / goal);
}

function dateRange(fromDateStr, toDateStr) {
  const dates = [];
  const from = new Date(fromDateStr + 'T00:00:00');
  const to = new Date(toDateStr + 'T00:00:00');
  const cursor = new Date(from);
  while (cursor <= to) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function addDays(dateStr, delta) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Score for a single habit, 0..100, over the trailing `windowDays`,
// clipped so it never looks further back than the habit's creation date.
export function habitScore(habit, todayStr, windowDays = 30) {
  const entries = habit.entries || {};
  const earliestWanted = addDays(todayStr, -(windowDays - 1));
  const start = habit.createdAt && habit.createdAt > earliestWanted ? habit.createdAt : earliestWanted;
  if (start > todayStr) return 0;

  const days = dateRange(start, todayStr);
  if (days.length === 0) return 0;

  const total = days.reduce((sum, day) => sum + dailyCompletion(habit, entries[day]), 0);
  return Math.round((total / days.length) * 100);
}

// Weighted overall score across every habit, 0..100.
export function overallScore(habits, todayStr, windowDays = 30) {
  if (!habits || habits.length === 0) return 0;
  let weightedSum = 0;
  let weightTotal = 0;
  for (const habit of habits) {
    const coefficient = Number(habit.coefficient) || 1;
    weightedSum += habitScore(habit, todayStr, windowDays) * coefficient;
    weightTotal += coefficient;
  }
  if (weightTotal === 0) return 0;
  return Math.round(weightedSum / weightTotal);
}

// Current daily streak counting backward from today (inclusive) while
// each day's completion is "successful enough" (>= 0.999 for numeric goals,
// exactly true for booleans).
export function currentStreak(habit, todayStr) {
  const entries = habit.entries || {};
  let streak = 0;
  let cursor = todayStr;
  while (cursor >= (habit.createdAt || '0000-00-00')) {
    const completion = dailyCompletion(habit, entries[cursor]);
    if (completion >= 0.999) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

// Longest streak ever recorded for a habit (scans every logged entry, not
// just a trailing window).
export function bestStreak(habit) {
  const entries = habit.entries || {};
  const days = Object.keys(entries).sort();
  if (days.length === 0) return 0;

  let best = 0;
  let running = 0;
  let prevDay = null;
  for (const day of days) {
    const completion = dailyCompletion(habit, entries[day]);
    const isConsecutive = prevDay && addDays(prevDay, 1) === day;
    if (completion >= 0.999) {
      running = isConsecutive ? running + 1 : 1;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
    prevDay = day;
  }
  return best;
}

// Total number of fully-completed days ever logged for a habit.
export function totalCompletions(habit) {
  const entries = habit.entries || {};
  return Object.keys(entries).filter((day) => dailyCompletion(habit, entries[day]) >= 0.999).length;
}

// Average numeric value logged (numeric habits only), ignoring unlogged days.
export function averageValue(habit) {
  if (habit.type !== 'numeric') return null;
  const entries = habit.entries || {};
  const values = Object.values(entries).filter((v) => typeof v === 'number');
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// Overall weighted score for each of the last `weeks` 7-day windows,
// oldest first — handy for a simple trend chart.
export function weeklyOverallScores(habits, todayStr, weeks = 8) {
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = addDays(todayStr, -i * 7);
    out.push({ weekEnd, score: overallScore(habits, weekEnd, 7) });
  }
  return out;
}

export { dateRange, addDays };
