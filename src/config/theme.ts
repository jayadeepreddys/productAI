export type ThemeConfig = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  fontFamily: {
    sans: string;
    mono: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
};

export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#3B82F6',    // blue-500
    secondary: '#6B7280',  // gray-500
    background: '#ffffff',
    foreground: '#171717',
    success: '#10B981',    // green-500
    error: '#EF4444',      // red-500
    warning: '#F59E0B',    // amber-500
    info: '#3B82F6',       // blue-500
  },
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
}; 