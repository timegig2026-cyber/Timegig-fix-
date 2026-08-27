export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  accentColor: string;
  isDark: boolean;
  bgClass: string;
  cardClass: string;
  textClass: string;
  borderClass: string;
  accentBtnClass: string;
}

export const APP_THEMES: ThemeConfig[] = [
  {
    id: 'light',
    name: 'Light / Minimalist Clean',
    description: 'Crisp white canvas, high contrast pure black and soft neutrals',
    previewColor: '#ffffff',
    accentColor: '#000000',
    isDark: false,
    bgClass: 'bg-white text-black',
    cardClass: 'bg-black/[0.02] border-black/[0.03]',
    textClass: 'text-black',
    borderClass: 'border-black/5',
    accentBtnClass: 'bg-black text-white'
  },
  {
    id: 'dark',
    name: 'Dark / Midnight Obsidian',
    description: 'Deep obsidian dark canvas with radiant crisp typography',
    previewColor: '#0c0e14',
    accentColor: '#ffffff',
    isDark: true,
    bgClass: 'bg-[#0b0d13] text-white',
    cardClass: 'bg-white/[0.04] border-white/[0.06]',
    textClass: 'text-white',
    borderClass: 'border-white/10',
    accentBtnClass: 'bg-white text-black'
  },
  {
    id: 'warm',
    name: 'Warm Sand / Safari Gold',
    description: 'Rich earthy tones with amber gold sunset accents',
    previewColor: '#faf6ee',
    accentColor: '#d97706',
    isDark: false,
    bgClass: 'bg-[#fcf9f2] text-[#2b2118]',
    cardClass: 'bg-[#b45309]/[0.04] border-[#b45309]/[0.08]',
    textClass: 'text-[#2b2118]',
    borderClass: 'border-[#b45309]/10',
    accentBtnClass: 'bg-[#d97706] text-white'
  },
  {
    id: 'forest',
    name: 'Forest Emerald',
    description: 'Calm botanical sage and deep emerald highlights',
    previewColor: '#f1f7f3',
    accentColor: '#059669',
    isDark: false,
    bgClass: 'bg-[#f3f8f5] text-[#13261b]',
    cardClass: 'bg-[#059669]/[0.04] border-[#059669]/[0.08]',
    textClass: 'text-[#13261b]',
    borderClass: 'border-[#059669]/10',
    accentBtnClass: 'bg-[#059669] text-white'
  },
  {
    id: 'cobalt',
    name: 'Cyber Cobalt',
    description: 'Modern dynamic electric blue with high-clarity slate',
    previewColor: '#f1f5fa',
    accentColor: '#2563eb',
    isDark: false,
    bgClass: 'bg-[#f3f7fc] text-[#0f172a]',
    cardClass: 'bg-[#2563eb]/[0.04] border-[#2563eb]/[0.08]',
    textClass: 'text-[#0f172a]',
    borderClass: 'border-[#2563eb]/10',
    accentBtnClass: 'bg-[#2563eb] text-white'
  },
  {
    id: 'purple',
    name: 'Royal Velvet',
    description: 'Sophisticated amethyst violet with premium feel',
    previewColor: '#f8f4fc',
    accentColor: '#7c3aed',
    isDark: false,
    bgClass: 'bg-[#f9f5fd] text-[#241438]',
    cardClass: 'bg-[#7c3aed]/[0.04] border-[#7c3aed]/[0.08]',
    textClass: 'text-[#241438]',
    borderClass: 'border-[#7c3aed]/10',
    accentBtnClass: 'bg-[#7c3aed] text-white'
  }
];

export function applyAppTheme(themeId: string) {
  const selectedTheme = APP_THEMES.find(t => t.id === themeId) || APP_THEMES[0];
  document.documentElement.setAttribute('data-theme', selectedTheme.id);
  if (selectedTheme.isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
