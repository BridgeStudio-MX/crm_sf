import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export type CommissionOrigen = 'DIRECTO' | 'BROKER_TOP_10' | 'BROKER_NO_TOP_10';
export type CommissionTipoContrato = 'NUEVO' | 'RENOVACION';
export type CommissionEstatusNave = 'CONSTRUIDA' | 'POR_CONSTRUIR';

export type CommissionRateCell = {
  CONSTRUIDA?: number;
  POR_CONSTRUIR?: number;
  rate?: number;
};

export type CommissionRateMatrix = Record<
  CommissionOrigen,
  Record<CommissionTipoContrato, CommissionRateCell>
>;

// Placeholder market-standard rates — editable via API, not hardcoded in calc.
export const DEFAULT_COMMISSION_RATE_MATRIX: CommissionRateMatrix = {
  DIRECTO: {
    NUEVO: { CONSTRUIDA: 2.0, POR_CONSTRUIR: 2.5 },
    RENOVACION: { rate: 1.0 },
  },
  BROKER_TOP_10: {
    NUEVO: { CONSTRUIDA: 5.0, POR_CONSTRUIR: 6.0 },
    RENOVACION: { rate: 2.5 },
  },
  BROKER_NO_TOP_10: {
    NUEVO: { CONSTRUIDA: 3.5, POR_CONSTRUIR: 4.25 },
    RENOVACION: { rate: 1.75 },
  },
};

const DATA_DIR = join(__dirname, '../../data');
const MATRIX_PATH = join(DATA_DIR, 'commission-rate-matrix.json');

const cloneMatrix = (
  matrix: CommissionRateMatrix,
): CommissionRateMatrix =>
  JSON.parse(JSON.stringify(matrix)) as CommissionRateMatrix;

export const commissionRateMatrixStore = {
  get: (): CommissionRateMatrix => {
    if (!existsSync(MATRIX_PATH)) {
      return cloneMatrix(DEFAULT_COMMISSION_RATE_MATRIX);
    }

    try {
      const parsed = JSON.parse(
        readFileSync(MATRIX_PATH, 'utf8'),
      ) as CommissionRateMatrix;

      return {
        ...cloneMatrix(DEFAULT_COMMISSION_RATE_MATRIX),
        ...parsed,
      };
    } catch {
      return cloneMatrix(DEFAULT_COMMISSION_RATE_MATRIX);
    }
  },

  save: (matrix: CommissionRateMatrix): CommissionRateMatrix => {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    const defaults = cloneMatrix(DEFAULT_COMMISSION_RATE_MATRIX);
    const next: CommissionRateMatrix = {
      DIRECTO: {
        NUEVO: {
          ...defaults.DIRECTO.NUEVO,
          ...matrix.DIRECTO?.NUEVO,
        },
        RENOVACION: {
          ...defaults.DIRECTO.RENOVACION,
          ...matrix.DIRECTO?.RENOVACION,
        },
      },
      BROKER_TOP_10: {
        NUEVO: {
          ...defaults.BROKER_TOP_10.NUEVO,
          ...matrix.BROKER_TOP_10?.NUEVO,
        },
        RENOVACION: {
          ...defaults.BROKER_TOP_10.RENOVACION,
          ...matrix.BROKER_TOP_10?.RENOVACION,
        },
      },
      BROKER_NO_TOP_10: {
        NUEVO: {
          ...defaults.BROKER_NO_TOP_10.NUEVO,
          ...matrix.BROKER_NO_TOP_10?.NUEVO,
        },
        RENOVACION: {
          ...defaults.BROKER_NO_TOP_10.RENOVACION,
          ...matrix.BROKER_NO_TOP_10?.RENOVACION,
        },
      },
    };
    writeFileSync(MATRIX_PATH, JSON.stringify(next, null, 2), 'utf8');

    return next;
  },

  reset: (): CommissionRateMatrix => {
    const defaults = cloneMatrix(DEFAULT_COMMISSION_RATE_MATRIX);
    return commissionRateMatrixStore.save(defaults);
  },
};

export const resolveMatrixRate = (
  matrix: CommissionRateMatrix,
  origen: CommissionOrigen,
  tipoContrato: CommissionTipoContrato,
  estatusNave: CommissionEstatusNave,
): number => {
  const row = matrix[origen]?.[tipoContrato];

  if (!row) {
    return 0;
  }

  if (tipoContrato === 'RENOVACION') {
    return row.rate ?? 0;
  }

  return row[estatusNave] ?? 0;
};
