export const Colors = {
  // Brand Gradient
  primaryGradient: ['#7C3AED', '#3B82F6'] as readonly [string, string],
  primaryGradientAlt: ['#8B5CF6', '#6366F1', '#3B82F6'] as readonly [string, string, string],

  // Primary (Purple)
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#6D28D9',

  // Secondary
  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryDark: '#059669',

  // Accent
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentDark: '#D97706',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Background
  background: '#0D0D0D',
  backgroundSecondary: '#1a1a1a',
  backgroundDark: '#0F172A',
  surface: '#1a1a1a',

  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textLight: '#64748B',
  textInverse: '#000000',

  // AI-specific
  aiGlow: '#A78BFA',
  aiPulse: 'rgba(167, 139, 250, 0.2)',
  aiSurface: 'rgba(167, 139, 250, 0.1)',

  // Categories
  categories: {
    health: '#10B981',
    career: '#3B82F6',
    education: '#8B5CF6',
    finance: '#F59E0B',
    relationships: '#EC4899',
    hobby: '#06B6D4',
    other: '#64748B',
  },

  // Task priorities
  priorities: {
    hero: '#F59E0B',
    normal: '#64748B',
  },

  // Mood colors
  moods: {
    great: '#10B981',
    good: '#34D399',
    neutral: '#94A3B8',
    bad: '#EF4444',
  },
} as const;

export const CategoryColors = Colors.categories;
export const PriorityColors = Colors.priorities;
export const MoodColors = Colors.moods;

export const DarkColors = {
  ...Colors,
  background: '#0D0D0D',
  backgroundSecondary: '#1a1a1a',
  surface: '#1a1a1a',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textLight: '#64748B',
} as const;
