// Design tokens for Loop Habits 2 — dark theme.
// Built around a near-black charcoal base with a bright raspberry accent,
// so it stays high-contrast and legible rather than just "inverted light mode".

export const colors = {
  background: '#121317', // near-black charcoal
  surface: '#1B1D22',
  surfaceAlt: '#24262C',
  surfaceRaised: '#2C2F36',
  border: '#33363D',
  ink: '#F3F2EE', // off-white body text
  inkMuted: '#9A9DA6',
  inkFaint: '#65686F',

  primary: '#FF4D7E', // raspberry — bright enough to read on charcoal
  primarySoft: 'rgba(255, 77, 126, 0.16)',
  success: '#3ED98F',
  successSoft: 'rgba(62, 217, 143, 0.16)',
  warning: '#FFB648',
  danger: '#FF6B6B',
  dangerSoft: 'rgba(255, 107, 107, 0.14)',
};

// Palette a user can assign to individual habits so the habit list stays
// legible and each routine keeps a stable identity color against the dark
// background.
export const habitPalette = [
  '#FF4D7E', // raspberry
  '#4DA6FF', // sky blue
  '#3ED98F', // green
  '#FFB648', // amber
  '#B389FF', // violet
  '#33D2E0', // teal
  '#FF8FA3', // coral
  '#D9B08C', // sand
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const type = {
  display: { fontSize: 28, fontWeight: '700', color: colors.ink },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 15, fontWeight: '600', color: colors.inkMuted },
  body: { fontSize: 15, fontWeight: '400', color: colors.ink },
  caption: { fontSize: 12, fontWeight: '500', color: colors.inkMuted },
};
