const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// "2026-09-26" -> "26/9"  (no leading zero on the month, matches how people
// write relative dates casually)
export function shortDate(dateStr) {
  const [, m, d] = dateStr.split('-');
  return `${parseInt(d, 10)}/${parseInt(m, 10)}`;
}

// "2026-09-26" -> "T" (single-letter weekday, Sun-first)
export function weekdayLetter(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return WEEKDAY_LETTERS[d.getDay()];
}

export function isToday(dateStr, todayStr) {
  return dateStr === todayStr;
}
