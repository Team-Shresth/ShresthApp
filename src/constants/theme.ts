// -----------------------------
// Shresth design tokens
// Sage & cream, print-inspired
// -----------------------------
const isDarkMode = typeof window !== 'undefined' && window.localStorage?.getItem('shresth-color-mode') === 'dark';

export const theme = {
  colors: {
    bg: isDarkMode ? '#171A17' : '#FAF7EE',
    surface: isDarkMode ? '#232821' : '#FFFDF8',
    text: isDarkMode ? '#F5F1E7' : '#2C2A24',
    secondaryText: isDarkMode ? '#B6B9AD' : '#7C7666',
    border: isDarkMode ? '#3B4439' : '#E8E1CF',
    green: '#4A7C59',         // sage green primary
    amber: '#B07D2B',         // golden amber
    red: '#B23A2E',           // warm brick red
    // semantic tints (transparent backgrounds, dot + text only)
    greenSoft: 'rgba(74,124,89,0.12)',
    amberSoft: 'rgba(176,125,43,0.12)',
    redSoft: 'rgba(178,58,46,0.10)',
    // neutral tints
    muted: isDarkMode ? '#2D342D' : '#F1EDE0',
    mutedText: isDarkMode ? '#8F988C' : '#A9A493',
    overlay: isDarkMode ? 'rgba(0,0,0,0.62)' : 'rgba(44,42,36,0.45)',
  },
  fonts: {
    // Inter for UI; JetBrains Mono for data
    ui: "'Inter', sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', monospace",
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    page: 20,
    section: 24,
    gap: 16,
    lg: 32,
  },
  shadow: {
    // soft, warm elevation
    card: {
      shadowColor: '#57503F',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    raised: {
      shadowColor: '#57503F',
      shadowOpacity: 0.09,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
  },
} as const;

export const journeyStages = [
  'Farm',
  'Truck',
  'No signal',
  'Back online',
  'Ledger',
  'Fork',
] as const;

export const NAV = {
  tabBarHeight: 60,
};

export const DB_NAME = 'shresth_traceability.db';
export const DB_VERSION = 1;
