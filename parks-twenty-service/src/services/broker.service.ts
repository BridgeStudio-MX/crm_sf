import {
  type BrokerRecord,
  type BrokerWithCommissionStats,
  type ComisionRecord,
  type EmpresaBrokerRecord,
} from '../types/parks.types';
import { isSelectValueEqual, toSelectValue } from '../utils/select-value.util';
import { empresaBrokerService } from './empresa-broker.service';
import { twentyDataService } from './twenty-data.service';

export type CreateBrokerInput = {
  contacto: string;
  empresaBrokerId?: string;
  nuevaEmpresaNombre?: string;
  email?: string;
  telefono?: string;
  firma?: string;
  activo?: boolean;
};

export type UpdateBrokerInput = Partial<
  Omit<CreateBrokerInput, 'nuevaEmpresaNombre'>
>;

type BrokerCommissionStats = {
  totalComisionesUsd: number;
  comisionesPendientesUsd: number;
  comisionesAprobadasUsd: number;
  comisionesPagadasUsd: number;
  dealsCount: number;
};

const EMPTY_STATS: BrokerCommissionStats = {
  totalComisionesUsd: 0,
  comisionesPendientesUsd: 0,
  comisionesAprobadasUsd: 0,
  comisionesPagadasUsd: 0,
  dealsCount: 0,
};

const addComisionToStats = (
  stats: BrokerCommissionStats,
  comision: ComisionRecord,
): BrokerCommissionStats => {
  const monto = comision.montoUsd ?? 0;
  const estatus = (comision.estatus ?? '').toUpperCase();

  return {
    totalComisionesUsd: stats.totalComisionesUsd + monto,
    comisionesPendientesUsd:
      estatus.includes('PENDIENTE') || estatus.includes('CALCULADA')
        ? stats.comisionesPendientesUsd + monto
        : stats.comisionesPendientesUsd,
    comisionesAprobadasUsd: estatus.includes('APROBADA')
      ? stats.comisionesAprobadasUsd + monto
      : stats.comisionesAprobadasUsd,
    comisionesPagadasUsd: estatus.includes('PAGADA')
      ? stats.comisionesPagadasUsd + monto
      : stats.comisionesPagadasUsd,
    dealsCount: stats.dealsCount + 1,
  };
};

// Commissions created before the comision.broker relation existed only carry a
// free-text beneficiario name, so we fall back to matching it against
// broker.empresa to keep historic totals visible in the Brokers page.
const buildStatsByBrokerId = (
  brokers: BrokerRecord[],
  comisiones: ComisionRecord[],
): Map<string, BrokerCommissionStats> => {
  const statsByBrokerId = new Map<string, BrokerCommissionStats>();
  const brokerIdByName = new Map(
    brokers
      .filter((broker) => Boolean(broker.empresa))
      .map((broker) => [broker.empresa!.trim().toLowerCase(), broker.id]),
  );

  for (const comision of comisiones) {
    if (!isSelectValueEqual(comision.tipo, 'Broker externo')) {
      continue;
    }

    const brokerId =
      comision.brokerId ??
      brokerIdByName.get((comision.beneficiario ?? '').trim().toLowerCase());

    if (!brokerId) {
      continue;
    }

    statsByBrokerId.set(
      brokerId,
      addComisionToStats(statsByBrokerId.get(brokerId) ?? EMPTY_STATS, comision),
    );
  }

  return statsByBrokerId;
};

// The individual broker keeps a denormalized copy of empresa / clasificacion /
// zonasOperacion so existing screens and matching logic that read those flat
// fields keep working without changes once brokers are grouped under a
// parent empresaBroker.
const buildEmpresaSyncPayload = (
  empresaBroker: EmpresaBrokerRecord,
): Record<string, unknown> => ({
  empresa: empresaBroker.nombre,
  ...(empresaBroker.clasificacion !== undefined
    ? { clasificacion: empresaBroker.clasificacion }
    : {}),
  ...(empresaBroker.zonasOperacion !== undefined
    ? { zonasOperacion: empresaBroker.zonasOperacion }
    : {}),
});

const resolveEmpresaBroker = async (
  empresaBrokerId: string,
): Promise<EmpresaBrokerRecord> => {
  const empresas = await twentyDataService.findAllEmpresasBroker();
  const empresaBroker = empresas.find((empresa) => empresa.id === empresaBrokerId);

  if (!empresaBroker) {
    throw new Error('La empresa de brokers indicada no existe');
  }

  return empresaBroker;
};

const buildBrokerUpdatePayload = (
  input: UpdateBrokerInput,
): Record<string, unknown> => {
  const updateData: Record<string, unknown> = {};

  if (input.contacto !== undefined) {
    updateData.contacto = input.contacto;
  }

  if (input.email !== undefined) {
    updateData.email = input.email;
  }

  if (input.telefono !== undefined) {
    updateData.telefono = input.telefono;
  }

  if (input.firma !== undefined) {
    updateData.firma = toSelectValue(input.firma);
  }

  if (input.activo !== undefined) {
    updateData.activo = input.activo;
  }

  return updateData;
};

export const brokerService = {
  listWithStats: async (): Promise<BrokerWithCommissionStats[]> => {
    const [brokers, comisiones] = await Promise.all([
      twentyDataService.findAllBrokers(),
      twentyDataService.findAllComisiones(),
    ]);

    const statsByBrokerId = buildStatsByBrokerId(brokers, comisiones);

    return brokers.map((broker) => ({
      ...broker,
      ...(statsByBrokerId.get(broker.id) ?? EMPTY_STATS),
    }));
  },

  create: async (input: CreateBrokerInput): Promise<BrokerRecord> => {
    if (!input.contacto?.trim()) {
      throw new Error('contacto is required');
    }

    if (!input.empresaBrokerId && !input.nuevaEmpresaNombre?.trim()) {
      throw new Error('empresaBrokerId or nuevaEmpresaNombre is required');
    }

    const empresaBroker = input.empresaBrokerId
      ? await resolveEmpresaBroker(input.empresaBrokerId)
      : await empresaBrokerService.create({
          nombre: input.nuevaEmpresaNombre!.trim(),
        });

    const broker = await twentyDataService.createBroker({
      contacto: input.contacto.trim(),
      email: input.email,
      telefono: input.telefono,
      firma: input.firma ? toSelectValue(input.firma) : undefined,
      activo: input.activo ?? true,
      operacionesCnt: 0,
      empresaBrokerId: empresaBroker.id,
      ...buildEmpresaSyncPayload(empresaBroker),
    });

    if (!broker) {
      throw new Error('No se pudo crear el broker');
    }

    return broker;
  },

  update: async (
    brokerId: string,
    input: UpdateBrokerInput,
  ): Promise<BrokerRecord> => {
    const updateData = buildBrokerUpdatePayload(input);

    if (input.empresaBrokerId !== undefined) {
      const empresaBroker = await resolveEmpresaBroker(input.empresaBrokerId);
      updateData.empresaBrokerId = empresaBroker.id;
      Object.assign(updateData, buildEmpresaSyncPayload(empresaBroker));
    }

    const broker = await twentyDataService.updateBroker(brokerId, updateData);

    if (!broker) {
      throw new Error('No se pudo actualizar el broker');
    }

    return broker;
  },
};
