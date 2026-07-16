import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export type PerformanceAreaKey =
  | 'COMERCIAL'
  | 'CXC'
  | 'LEGAL'
  | 'MARKETING'
  | 'DIRECCION';

export type PerformanceWeights = Record<PerformanceAreaKey, number>;

// Placeholder weights from Panel Ejecutivo spec §5 — editable, not hardcoded in calc.
export const DEFAULT_PERFORMANCE_WEIGHTS: PerformanceWeights = {
  COMERCIAL: 20,
  CXC: 30,
  LEGAL: 25,
  MARKETING: 15,
  DIRECCION: 10,
};

const DATA_DIR = join(__dirname, '../../data');
const WEIGHTS_PATH = join(DATA_DIR, 'performance-weights.json');

const cloneWeights = (weights: PerformanceWeights): PerformanceWeights =>
  JSON.parse(JSON.stringify(weights)) as PerformanceWeights;

export const performanceWeightsStore = {
  get: (): PerformanceWeights => {
    if (!existsSync(WEIGHTS_PATH)) {
      return cloneWeights(DEFAULT_PERFORMANCE_WEIGHTS);
    }

    try {
      const parsed = JSON.parse(
        readFileSync(WEIGHTS_PATH, 'utf8'),
      ) as PerformanceWeights;

      return {
        ...cloneWeights(DEFAULT_PERFORMANCE_WEIGHTS),
        ...parsed,
      };
    } catch {
      return cloneWeights(DEFAULT_PERFORMANCE_WEIGHTS);
    }
  },

  save: (weights: PerformanceWeights): PerformanceWeights => {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    const next = {
      ...cloneWeights(DEFAULT_PERFORMANCE_WEIGHTS),
      ...weights,
    };
    writeFileSync(WEIGHTS_PATH, JSON.stringify(next, null, 2), 'utf8');

    return next;
  },

  reset: (): PerformanceWeights =>
    performanceWeightsStore.save(cloneWeights(DEFAULT_PERFORMANCE_WEIGHTS)),
};
