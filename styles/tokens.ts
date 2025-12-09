// Design System Tokens extracted from Figma design
export const tokens = {
  colors: {
    // Primary brand colors (from Figma)
    primary: {
      50: '#E6EAF0',
      100: '#B0BDD1',
      200: '#8A9DBB',
      300: '#54709C',
      500: '#00296B',
      600: '#002561',
      700: '#001D4C',
      800: '#00173B',
    },
    // Accent colors (from Figma)
    accent: {
      50: '#FEF8E6',
      100: '#FCE8B0',
      200: '#FADD8A',
      300: '#FFBE54',
      500: '#F4B400',
      600: '#DEA400',
    },
    // Success colors
    success: {
      50: '#ECF9E6',
    },
    // Neutral grays (from Figma)
    gray: {
      50: '#F4F4F4',
      100: '#DCDCDC',
      500: '#7C7C7C',
      600: '#525252',
      700: '#292D32',
      900: '#292929',
    },
    white: '#FFFFFF',
    black: '#000000',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
    '6xl': '64px',
  },
  
  typography: {
    // Hero headline (55px from Figma)
    hero: {
      size: '55px',
      weight: '800',
      lineHeight: '1.2em',
    },
    // Section headlines (45px from Figma)
    h2: {
      size: '45px',
      weight: '800',
      lineHeight: '1.2em',
    },
    // Card titles (33px from Figma)
    h3: {
      size: '33px',
      weight: '700',
      lineHeight: '1.2em',
    },
    // Subheadings (27px from Figma)
    h4: {
      size: '27px',
      weight: '700',
      lineHeight: '1.2em',
    },
    // Small headings (18px from Figma)
    h5: {
      size: '18px',
      weight: '600',
      lineHeight: '1.2em',
    },
    // Body text (20px from Figma)
    bodyLarge: {
      size: '20px',
      weight: '500',
      lineHeight: '1.2em',
    },
    // Regular body (15px from Figma)
    body: {
      size: '15px',
      weight: '500',
      lineHeight: '1.2em',
    },
    // Small text (14px from Figma)
    small: {
      size: '14px',
      weight: '700',
      lineHeight: '1.366em',
    },
  },
  
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0px 4px 4px 0px rgba(0, 0, 0, 0.15)',
    md: '0px 4px 4px 0px rgba(0, 0, 0, 0.2)',
    lg: '0px 4px 4px 0px rgba(0, 0, 0, 0.45)',
    accent: '0px 0px 20px 0px rgba(217, 171, 82, 0.3)',
    primary: '0px 0px 20px 0px rgba(176, 189, 209, 1)',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type Tokens = typeof tokens;