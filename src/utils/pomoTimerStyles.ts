import { PomodoroTimerStyle } from '../types';

export interface PomoTimerStyleOption {
  id: PomodoroTimerStyle;
  label: string;
  description: string;
}

export const POMO_TIMER_STYLES: PomoTimerStyleOption[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Clean digital countdown display',
  },
  {
    id: 'flipClock',
    label: 'Flip Clock',
    description: 'Split mechanical retro flip cards',
  },
  {
    id: 'progressBar',
    label: 'Progress Bar',
    description: 'Horizontal linear progress meter',
  },
  {
    id: 'gauge',
    label: 'Gauge',
    description: 'Radial circular progress gauge',
  },
  {
    id: 'dotMatrix',
    label: 'Dot Matrix',
    description: 'LED dot matrix progress grid',
  },
  {
    id: 'pie',
    label: 'Pie',
    description: 'Circular solid pie slice progress',
  },
];
