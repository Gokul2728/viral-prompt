/**
 * Viral Prompt - Premium Design System
 * Glassmorphism-heavy, modern, AI-first mobile UI
 */

export const Colors = {
  // Dark Mode (Primary, Default)
  dark: {
    background: '#0D0D0F',
    backgroundSecondary: '#141418',
    backgroundTertiary: '#1A1A1F',
    surface: 'rgba(255, 255, 255, 0.05)',
    surfaceElevated: 'rgba(255, 255, 255, 0.08)',
    surfaceHighlight: 'rgba(255, 255, 255, 0.12)',
    
    // Glass effects
    glass: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    glassGlow: 'rgba(139, 92, 246, 0.15)',
    
    // Text
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    textMuted: 'rgba(255, 255, 255, 0.35)',
    
    // Accent colors
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',
    
    secondary: '#06B6D4',
    secondaryLight: '#22D3EE',
    
    accent: '#10B981',
    accentLight: '#34D399',
    
    // Gradient colors
    gradientStart: '#8B5CF6',
    gradientMid: '#6366F1',
    gradientEnd: '#06B6D4',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Viral/Trending indicators
    viral: '#FF6B6B',
    viralGlow: 'rgba(255, 107, 107, 0.3)',
    trending: '#FFD93D',
    trendingGlow: 'rgba(255, 217, 61, 0.3)',
    hot: '#FF8C00',
    hotGlow: 'rgba(255, 140, 0, 0.3)',
    
    // Platform colors
    youtube: '#FF0000',
    reddit: '#FF4500',
    twitter: '#1DA1F2',
    pinterest: '#E60023',
    instagram: '#E4405F',
    
    // AI Tool colors
    gemini: '#8E75FF',
    midjourney: '#0066FF',
    runway: '#00D4AA',
    sora: '#FF6B9D',
    stableDiffusion: '#A855F7',
    pika: '#FFB800',
    luma: '#00CED1',
    
    // Reactions
    like: '#FF6B8A',
    fire: '#FF6B00',
    wow: '#FFD700',
    copy: '#8B5CF6',
    generate: '#10B981',
  },
  
  // Light Mode
  light: {
    background: '#F8F9FC',
    backgroundSecondary: '#FFFFFF',
    backgroundTertiary: '#F1F3F9',
    surface: 'rgba(0, 0, 0, 0.03)',
    surfaceElevated: 'rgba(0, 0, 0, 0.05)',
    surfaceHighlight: 'rgba(0, 0, 0, 0.08)',
    
    // Glass effects
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
    glassGlow: 'rgba(139, 92, 246, 0.1)',
    
    // Text
    textPrimary: '#1A1A2E',
    textSecondary: 'rgba(26, 26, 46, 0.7)',
    textTertiary: 'rgba(26, 26, 46, 0.5)',
    textMuted: 'rgba(26, 26, 46, 0.35)',
    
    // Accent colors (slightly adjusted for light mode)
    primary: '#7C3AED',
    primaryLight: '#8B5CF6',
    primaryDark: '#6D28D9',
    
    secondary: '#0891B2',
    secondaryLight: '#06B6D4',
    
    accent: '#059669',
    accentLight: '#10B981',
    
    // Gradient colors
    gradientStart: '#7C3AED',
    gradientMid: '#4F46E5',
    gradientEnd: '#0891B2',
    
    // Status colors
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
    
    // Viral/Trending indicators
    viral: '#E11D48',
    viralGlow: 'rgba(225, 29, 72, 0.15)',
    trending: '#CA8A04',
    trendingGlow: 'rgba(202, 138, 4, 0.15)',
    hot: '#EA580C',
    hotGlow: 'rgba(234, 88, 12, 0.15)',
    
    // Platform colors (same as dark)
    youtube: '#FF0000',
    reddit: '#FF4500',
    twitter: '#1DA1F2',
    pinterest: '#E60023',
    instagram: '#E4405F',
    
    // AI Tool colors (same as dark)
    gemini: '#8E75FF',
    midjourney: '#0066FF',
    runway: '#00D4AA',
    sora: '#FF6B9D',
    stableDiffusion: '#A855F7',
    pika: '#FFB800',
    luma: '#00CED1',
    
    // Reactions
    like: '#E11D48',
    fire: '#EA580C',
    wow: '#CA8A04',
    copy: '#7C3AED',
    generate: '#059669',
  },
};

export const Gradients = {
  primary: ['#8B5CF6', '#6366F1', '#06B6D4'],
  secondary: ['#06B6D4', '#10B981'],
  accent: ['#F59E0B', '#EF4444'],
  viral: ['#FF6B6B', '#FF8E53'],
  trending: ['#FFD93D', '#FF6B6B'],
  glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  glassDark: ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)'],
  cardBorder: ['rgba(139, 92, 246, 0.5)', 'rgba(6, 182, 212, 0.5)'],
  splash: ['#0D0D0F', '#1A1A2E', '#0D0D0F'],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
  card: 20,
  button: 14,
  chip: 10,
  avatar: 50,
};

export const Typography = {
  // Font families (will be loaded)
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    black: 'Inter-Black',
  },
  
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 28,
    hero: 32,
    giant: 40,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: (color: string, intensity = 0.3) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: 20,
    elevation: 10,
  }),
  innerGlow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  }),
};

export const GlassStyles = {
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.card,
  },
  cardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: BorderRadius.card,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.button,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blur: {
    intensity: 50,
    tint: 'dark' as const,
  },
  blurLight: {
    intensity: 80,
    tint: 'light' as const,
  },
};

export const Animation = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  easing: {
    default: 'ease-out',
    bounce: 'ease-in-out',
    spring: { damping: 15, stiffness: 150 },
  },
};

export default {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
  GlassStyles,
  Animation,
};
