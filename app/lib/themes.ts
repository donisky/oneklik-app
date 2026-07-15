// app/lib/themes.ts

export interface ThemeStyle {
  name: string;
  bg: string;
  button: string;
  text: string;
  buttonText: string;
}

export const THEMES: Record<string, ThemeStyle> = {
  'classic': {
    name: 'Klasik',
    bg: '#f3f4f6',
    button: '#3b82f6',
    text: '#1e293b',
    buttonText: '#ffffff'
  },
  'modern': {
    name: 'Modern',
    bg: '#1a1a2e',
    button: '#e94560',
    text: '#ffffff',
    buttonText: '#ffffff'
  },
  'professional': {
    name: 'Profesional',
    bg: '#e2e8f0',
    button: '#1e3a8a',
    text: '#0f172a',
    buttonText: '#ffffff'
  },
  'elegant': {
    name: 'Elegan',
    bg: '#2d3436',
    button: '#6c5ce7',
    text: '#ffffff',
    buttonText: '#ffffff'
  },
  'vibrant': {
    name: 'Vibrant',
    bg: '#ffecd2',
    button: '#fc5c7d',
    text: '#1e293b',
    buttonText: '#ffffff'
  }
};