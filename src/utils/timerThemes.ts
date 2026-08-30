import { ClockTimerStyle } from '../types';

export interface TimerStyleOption {
  id: ClockTimerStyle;
  label: string;
  className: string;
  previewText: string;
  description: string;
}

export const CLOCK_TIMER_STYLES: TimerStyleOption[] = [
  {
    id: 'default',
    label: 'Default',
    className: 'font-timer-default',
    previewText: '9:24',
    description: 'Bold modern sans with high impact',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    className: 'font-timer-minimal',
    previewText: '9:24',
    description: 'Clean geometric balanced sans',
  },
  {
    id: 'serif',
    label: 'Serif',
    className: 'font-timer-serif',
    previewText: '9:24',
    description: 'Classic high-contrast editorial serif',
  },
  {
    id: 'handwritten',
    label: 'Handwritten',
    className: 'font-timer-handwritten',
    previewText: '9:24',
    description: 'Fluid natural handwritten script',
  },
  {
    id: 'minimalLight',
    label: 'Minimal Light',
    className: 'font-timer-minimal-light',
    previewText: '9:24',
    description: 'Ultra-thin, airy minimalist display',
  },
  {
    id: 'serifCondensed',
    label: 'Serif Condensed',
    className: 'font-timer-serif-condensed',
    previewText: '12:24',
    description: 'Condensed tall high-fashion serif',
  },
];

export function getTimerFontClass(style?: ClockTimerStyle | string): string {
  if (!style) return 'font-timer-default';
  const found = CLOCK_TIMER_STYLES.find((s) => s.id === style);
  return found ? found.className : 'font-timer-default';
}
