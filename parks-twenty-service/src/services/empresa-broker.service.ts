import {
  type BrokerRecord,
  type ComisionRecord,
  type EmpresaBrokerRecord,
  type EmpresaBrokerWithStats,
} from '../types/parks.types';
import { isSelectValueEqual, toSelectValue } from '../utils/select-value.util';
import { twentyDataService } from './twenty-data.service';

export type CreateEmpresaBrokerInput = {
  nombre: string;
  contactoPrincipal?: string;
  email?: string;
  telefono?: string;
  comisionPct?: number;
  comisionPctNuevo?: number;
  comisionPctPreventa?: number;
  comisionPctRenovacion?: number;
  clasificacion?: string;
  sectores?: string;
  zonasOperacion?: string;
  documentacionUrl?: string;
  notas?: string;
  activo?: boolean;
};

export type UpdateEmpresaBrokerInput = Partial<CreateEmpresaBrokerInput>;

type EmpresaBrokerStats = {
  brokersCount: number;
  totalComisionesUsd: number;
  comisionesPendientesUsd: number;
  dealsCount: number;
};

const EMPTY_STATS: EmpresaBrokerStats = {
  brokersCount: 0,
  totalComisionesUsd: 0,
  comisionesPendientesUsd: 0,
  dealsCount: 0,
};

const buildStatsByEmpresaId = (
  brokers: BrokerRecord[],
  comisiones: ComisionRecord[],
): Map<string, EmpresaBrokerStats> => {
  const statsByEmpresaId = new Map<string, EmpresaBrokerStats>();
  const empresaIdByBrokerId = new Map(
    brokers
      .filter((broker) => Boolean(broker.empresaBrokerId))
      .map((broker) => [broker.id, broker.empresaBrokerId!]),
  );

  for (const broker of brokers) {
    if (!broker.empresaBrokerId) {
      continue;
    }

    const current = statsByEmpresaId.get(broker.empresaBrokerId) ?? EMPTY_STATS;
    statsByEmpresaId.set(broker.empresaBrokerId, {
      ...current,
      brokersCount: current.brokersCount + 1,
    });
  }

  for (const comision of comisiones) {
    if (
      !isSelectValueEqual(comision.tipo, 'Broker externo') ||
      !comision.brokerId
    ) {
      continue;
    }

    const empresaBrokerId = empresaIdByBrokerId.get(comision.brokerId);

    if (!empresaBrokerId) {
      continue;
    }

    const monto = comision.montoUsd ?? 0;
    const estatus = (comision.estatus ?? '').toUpperCase();
    const current = statsByEmpresaId.get(empresaBrokerId) ?? EMPTY_STATS;

    statsByEmpresaId.set(empresaBrokerId, {
      ...current,
      totalComisionesUsd: current.totalComisionesUsd + monto,
      comisionesPendientesUsd:
        estatus.includes('PENDIENTE') || estatus.includes('CALCULADA')
          ? current.comisionesPendientesUsd + monto
          : current.comisionesPendientesUsd,
      dealsCount: current.dealsCount + 1,
    });
  }

  return statsByEmpresaId;
};

const buildEmpresaBrokerPayload = (
  input: CreateEmpresaBrokerInput | UpdateEmpresaBrokerInput,
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  if (input.nombre !== undefined) {
    payload.nombre = input.nombre;
  }

  if (input.contactoPrincipal !== undefined) {
    payload.contactoPrincipal = input.contactoPrincipal;
  }

  if (input.email !== undefined) {
    payload.email = input.email;
  }

  if (input.telefono !== undefined) {
    payload.telefono = input.telefono;
  }

  if (input.comisionPct !== undefined) {
    payload.comisionPct = input.comisionPct;
  }

  if (input.comisionPctNuevo !== undefined) {
    payload.comisionPctNuevo = input.comisionPctNuevo;
  }

  if (input.comisionPctPreventa !== undefined) {
    payload.comisionPctPreventa = input.comisionPctPreventa;
  }

  if (input.comisionPctRenovacion !== undefined) {
    payload.comisionPctRenovacion = input.comisionPctRenovacion;
  }

  if (input.clasificacion !== undefined) {
    payload.clasificacion = toSelectValue(input.clasificacion);
  }

  if (input.sectores !== undefined) {
    payload.sectores = input.sectores;
  }

  if (input.zonasOperacion !== undefined) {
    payload.zonasOperacion = input.zonasOperacion;
  }

  if (input.documentacionUrl !== undefined) {
    payload.documentacionUrl = input.documentacionUrl;
  }

  if (input.notas !== undefined) {
    payload.notas = input.notas;
  }

  if (input.activo !== undefined) {
    payload.activo = input.activo;
  }

  return payload;
};

export const empresaBrokerService = {
  listWithStats: async (): Promise<EmpresaBrokerWithStats[]> => {
    const [empresas, brokers, comisiones] = await Promise.all([
      twentyDataService.findAllEmpresasBroker(),
      twentyDataService.findAllBrokers(),
      twentyDataService.findAllComisiones(),
    ]);

    const statsByEmpresaId = buildStatsByEmpresaId(brokers, comisiones);

    return empresas.map((empresa) => ({
      ...empresa,
      ...(statsByEmpresaId.get(empresa.id) ?? EMPTY_STATS),
    }));
  },

  create: async (
    input: CreateEmpresaBrokerInput,
  ): Promise<EmpresaBrokerRecord> => {
    if (!input.nombre?.trim()) {
      throw new Error('nombre is required');
    }

    const empresaBroker = await twentyDataService.createEmpresaBroker({
      ...buildEmpresaBrokerPayload(input),
      nombre: input.nombre.trim(),
      clasificacion: input.clasificacion
        ? toSelectValue(input.clasificacion)
        : toSelectValue('No top 10'),
      activo: input.activo ?? true,
    });

    if (!empresaBroker) {
      throw new Error('No se pudo crear la empresa de brokers');
    }

    return empresaBroker;
  },

  update: async (
    empresaBrokerId: string,
    input: UpdateEmpresaBrokerInput,
  ): Promise<EmpresaBrokerRecord> => {
    const existing =
      (await twentyDataService.findAllEmpresasBroker()).find(
        (empresa) => empresa.id === empresaBrokerId,
      ) ?? null;

    const payload = buildEmpresaBrokerPayload(input);

    if (
      existing &&
      input.clasificacion &&
      !isSelectValueEqual(existing.clasificacion, input.clasificacion)
    ) {
      const history: Array<{
        from: string | null;
        to: string;
        at: string;
      }> = [];

      try {
        if (existing.clasificacionHistorialJson) {
          history.push(
            ...(JSON.parse(existing.clasificacionHistorialJson) as Array<{
              from: string | null;
              to: string;
              at: string;
            }>),
          );
        }
      } catch {
        // keep empty history on parse failure
      }

      history.push({
        from: existing.clasificacion ?? null,
        to: input.clasificacion,
        at: new Date().toISOString(),
      });
      payload.clasificacionHistorialJson = JSON.stringify(history);
    }

    const empresaBroker = await twentyDataService.updateEmpresaBroker(
      empresaBrokerId,
      payload,
    );

    if (!empresaBroker) {
      throw new Error('No se pudo actualizar la empresa de brokers');
    }

    return empresaBroker;
  },
};
