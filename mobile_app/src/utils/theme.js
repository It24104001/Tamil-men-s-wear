// Theme system — Light & Dark mode for Tamil Men's Wear
export const Colors = {
  // Brand
  primary:    '#FFD700',
  primaryDark:'#B8960C',
  accent:     '#FF6B35',

  // Dark theme
  dark: {
    bg:        '#0A0A0A',
    card:      '#141414',
    surface:   '#1E1E1E',
    border:    '#2A2A2A',
    text:      '#FFFFFF',
    textSub:   '#AAAAAA',
    textMuted: '#666666',
    icon:      '#FFD700',
    tabBar:    '#111111',
  },

  // Light theme
  light: {
    bg:        '#F5F5F5',
    card:      '#FFFFFF',
    surface:   '#EEEEEE',
    border:    '#DDDDDD',
    text:      '#111111',
    textSub:   '#555555',
    textMuted: '#999999',
    icon:      '#B8960C',
    tabBar:    '#FFFFFF',
  },

  success: '#22C55E',
  error:   '#EF4444',
  warning: '#F59E0B',
  info:    '#3B82F6',
};

export const getTheme = (isDark = true) => ({
  isDark,
  colors: isDark ? Colors.dark : Colors.light,
  primary: Colors.primary,
  accent:  Colors.accent,
});

export const Fonts = {
  light:   '300',
  regular: '400',
  medium:  '500',
  semibold:'600',
  bold:    '700',
  black:   '900',
};

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const Radius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};

export const Shadow = {
  sm:  { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,  elevation: 3 },
  md:  { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.20, shadowRadius: 8,  elevation: 6 },
  lg:  { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 12 },
  gold:{ shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
};
