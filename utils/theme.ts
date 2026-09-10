export const COLORS = {
  // Primary - warm, calming teal
  primary: '#2D7D6F',
  primaryLight: '#E8F5F2',
  primaryDark: '#1A5C51',

  // Accent - gentle amber for alerts/actions
  accent: '#E8A020',
  accentLight: '#FDF3E0',

  // Danger
  danger: '#C0392B',
  dangerLight: '#FDECEA',

  // Neutrals
  white: '#FFFFFF',
  background: '#F7F9F8',
  surface: '#FFFFFF',
  border: '#D8E8E5',
  textPrimary: '#1A2E2B',
  textSecondary: '#5A7872',
  textMuted: '#8AADA7',

  // Patient UI specific - extra high contrast
  patientBg: '#F0F7F5',
  patientCard: '#FFFFFF',
};

export const FONTS = {
  // Scale for elderly-friendly readability
  xs: 14,
  sm: 16,
  md: 18,
  lg: 22,
  xl: 28,
  xxl: 36,
  xxxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#2D7D6F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};
