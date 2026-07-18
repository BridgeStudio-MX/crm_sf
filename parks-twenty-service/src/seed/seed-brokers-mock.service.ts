import { MOCK_BROKERS } from '../mocks/brokers.mock';
import { MOCK_COMISIONES_BROKER } from '../mocks/comisiones-broker.mock';
import { MOCK_EMPRESAS_BROKER } from '../mocks/empresas-broker.mock';
import { brokerService } from '../services/broker.service';
import { empresaBrokerService } from '../services/empresa-broker.service';
import { twentyDataService } from '../services/twenty-data.service';
import { toSelectValue } from '../utils/select-value.util';

export const seedBrokersMockService = {
  run: async (): Promise<{
    empresasCreated: number;
    brokersCreated: number;
    comisionesCreated: number;
    skippedEmpresas: number;
    skippedBrokers: number;
  }> => {
    const existingEmpresas = await twentyDataService.findAllEmpresasBroker();
    const existingBrokers = await twentyDataService.findAllBrokers();

    const empresaIdByKey = new Map<string, string>();
    let empresasCreated = 0;
    let skippedEmpresas = 0;

    for (const empresaMock of MOCK_EMPRESAS_BROKER) {
      const existing = existingEmpresas.find(
        (empresa) =>
          (empresa.nombre ?? '').trim().toLowerCase() ===
          empresaMock.nombre.trim().toLowerCase(),
      );

      if (existing) {
        empresaIdByKey.set(empresaMock.key, existing.id);
        skippedEmpresas += 1;
        continue;
      }

      const created = await empresaBrokerService.create({
        nombre: empresaMock.nombre,
        contactoPrincipal: empresaMock.contactoPrincipal,
        email: empresaMock.email,
        telefono: empresaMock.telefono,
        comisionPct: empresaMock.comisionPct,
        comisionPctNuevo: empresaMock.comisionPctNuevo,
        comisionPctPreventa: empresaMock.comisionPctPreventa,
        comisionPctRenovacion: empresaMock.comisionPctRenovacion,
        clasificacion: empresaMock.clasificacion,
        sectores: empresaMock.sectores,
        zonasOperacion: empresaMock.zonasOperacion,
        notas: empresaMock.notas,
        activo: empresaMock.activo,
      });

      empresaIdByKey.set(empresaMock.key, created.id);
      empresasCreated += 1;
      console.log(`[seed:brokers-mock] + empresa ${created.nombre}`);
    }

    const brokerIdByKey = new Map<string, string>();
    let brokersCreated = 0;
    let skippedBrokers = 0;

    for (const brokerMock of MOCK_BROKERS) {
      const empresaBrokerId = empresaIdByKey.get(brokerMock.empresaKey);

      if (!empresaBrokerId) {
        console.warn(
          `[seed:brokers-mock] Skip broker ${brokerMock.contacto}: missing empresa ${brokerMock.empresaKey}`,
        );
        continue;
      }

      const existing = existingBrokers.find(
        (broker) =>
          (broker.email ?? '').trim().toLowerCase() ===
            brokerMock.email.trim().toLowerCase() ||
          (broker.contacto ?? '').trim().toLowerCase() ===
            brokerMock.contacto.trim().toLowerCase(),
      );

      if (existing) {
        brokerIdByKey.set(brokerMock.key, existing.id);
        skippedBrokers += 1;
        continue;
      }

      const created = await brokerService.create({
        contacto: brokerMock.contacto,
        email: brokerMock.email,
        telefono: brokerMock.telefono,
        firma: brokerMock.firma,
        activo: brokerMock.activo,
        empresaBrokerId,
      }).catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
          `[seed:brokers-mock] Broker ${brokerMock.contacto} falló: ${message}`,
        );
        return null;
      });

      if (!created) {
        continue;
      }

      brokerIdByKey.set(brokerMock.key, created.id);
      brokersCreated += 1;
      console.log(`[seed:brokers-mock] + broker ${created.contacto}`);
    }

    let comisionesCreated = 0;
    const existingComisiones = await twentyDataService.findAllComisiones();
    const existingFolios = new Set(
      existingComisiones
        .map((comision) => comision.folio?.trim())
        .filter((folio): folio is string => Boolean(folio)),
    );

    for (const comisionMock of MOCK_COMISIONES_BROKER) {
      if (existingFolios.has(comisionMock.folio)) {
        continue;
      }

      const brokerId = brokerIdByKey.get(comisionMock.brokerKey);

      if (!brokerId) {
        console.warn(
          `[seed:brokers-mock] Skip comisión ${comisionMock.folio}: missing broker ${comisionMock.brokerKey}`,
        );
        continue;
      }

      const isTop10 =
        !comisionMock.beneficiario.includes('Libre') &&
        !comisionMock.beneficiario.includes('JL');

      const created = await twentyDataService.createComision({
        tipo: toSelectValue('Broker externo'),
        tipoPago: toSelectValue('Externo'),
        beneficiario: comisionMock.beneficiario,
        folio: comisionMock.folio,
        clienteNombre: comisionMock.clienteNombre,
        leasingOfficer: comisionMock.leasingOfficer,
        origenDeal: toSelectValue(
          isTop10 ? 'Broker Top 10' : 'Broker fuera Top 10',
        ),
        tipoContratoComision: toSelectValue(comisionMock.tipoContratoComision),
        estatusNaveComision: toSelectValue('Construida'),
        brokerTierSnapshot: toSelectValue(isTop10 ? 'Top 10' : 'No top 10'),
        pctAplicado: comisionMock.pctAplicado,
        montoUsd: comisionMock.montoUsd,
        estatus: toSelectValue(comisionMock.estatus),
        baseCalculo: `Mock brokers · ${comisionMock.pctAplicado}%`,
        fechaCierre: new Date().toISOString().slice(0, 10),
        brokerId,
      });

      if (created) {
        comisionesCreated += 1;
        console.log(`[seed:brokers-mock] + comisión ${comisionMock.folio}`);
      }
    }

    return {
      empresasCreated,
      brokersCreated,
      comisionesCreated,
      skippedEmpresas,
      skippedBrokers,
    };
  },
};
