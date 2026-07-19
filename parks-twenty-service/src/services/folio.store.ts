import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(__dirname, '../../data');
const COUNTER_PATH = join(DATA_DIR, 'folio-counter.json');

type FolioCounterState = {
  year: number;
  sequence: number;
};

const readState = (): FolioCounterState => {
  const year = new Date().getFullYear();

  if (!existsSync(COUNTER_PATH)) {
    return { year, sequence: 0 };
  }

  try {
    const parsed = JSON.parse(
      readFileSync(COUNTER_PATH, 'utf8'),
    ) as FolioCounterState;

    if (parsed.year !== year) {
      return { year, sequence: 0 };
    }

    return {
      year: parsed.year,
      sequence: Number.isFinite(parsed.sequence) ? parsed.sequence : 0,
    };
  } catch {
    return { year, sequence: 0 };
  }
};

const writeState = (state: FolioCounterState): void => {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  writeFileSync(COUNTER_PATH, JSON.stringify(state, null, 2), 'utf8');
};

// Format: PI-2026-000123 — shared ticket across commercial, legal, ops.
export const allocateNextFolio = (): string => {
  const state = readState();
  const nextSequence = state.sequence + 1;
  writeState({ year: state.year, sequence: nextSequence });

  return `PI-${state.year}-${String(nextSequence).padStart(6, '0')}`;
};

export const isValidFolio = (folio?: string | null): boolean =>
  typeof folio === 'string' && /^PI-\d{4}-\d{6}$/.test(folio.trim());
