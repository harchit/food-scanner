export const colors = {
  // Background colors
  background: '#0D1117',
  surface: '#161B22',
  surfaceLight: '#21262D',
  surfaceLighter: '#30363D',

  // Text colors
  textPrimary: '#F0F6FC',
  textSecondary: '#8B949E',
  textMuted: '#6E7681',

  // Accent colors
  primary: '#238636',
  primaryLight: '#2EA043',
  primaryDark: '#196C2E',

  // Halal status colors
  halalGreen: '#2EA043',
  halalGreenLight: '#56D364',
  doubtfulYellow: '#D29922',
  doubtfulYellowLight: '#E3B341',
  haramRed: '#DA3633',
  haramRedLight: '#F85149',

  // Score gradient colors
  score100: '#2EA043',
  score80: '#56D364',
  score60: '#D29922',
  score40: '#E3B341',
  score20: '#F85149',
  score0: '#DA3633',

  // UI colors
  border: '#30363D',
  borderLight: '#484F58',
  shadow: '#010409',
  overlay: 'rgba(0, 0, 0, 0.6)',

  // Feedback colors
  success: '#238636',
  warning: '#D29922',
  error: '#DA3633',
  info: '#58A6FF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
};
