import {
  type ParksPortfolioByParkResult,
  type ParksPortfolioLeadItem,
  type ParksPortfolioNaveItem,
  type ParksPortfolioParkRow,
} from '@/parks-industrial/utils/parks-portfolio-by-park.util';
import { type ParksNaveInventoryKind } from '@/parks-industrial/utils/parks-portfolio-metrics.util';

const DEMO_APODACA_PARQUE_ID = 'demo-parque-apodaca-f2';

const daysAgoIso = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return date.toISOString();
};

const buildLead = (
  lead: Omit<ParksPortfolioLeadItem, 'naveId'> & { naveId: string },
): ParksPortfolioLeadItem => lead;

const buildNave = ({
  id,
  identificador,
  m2,
  precioBaseUsd,
  kind,
  daysVacant = null,
  entregaEstimada = null,
  leads = [],
}: {
  id: string;
  identificador: string;
  m2: number;
  precioBaseUsd: number;
  kind: ParksNaveInventoryKind;
  daysVacant?: number | null;
  entregaEstimada?: string | null;
  leads?: ParksPortfolioLeadItem[];
}): ParksPortfolioNaveItem => ({
  id,
  identificador,
  m2,
  precioBaseUsd,
  daysVacant,
  interestCount: leads.length,
  estatus:
    kind === 'construccion'
      ? 'En construcción'
      : kind === 'ocupada'
        ? 'Rentada'
        : kind === 'negociacion'
          ? 'En negociación'
          : 'Disponible',
  kind,
  entregaEstimada,
  leads,
});

const finalizePark = ({
  parqueId,
  nombre,
  ubicacion,
  ocupacion,
  m2Totales,
  m2Rentados,
  allNaves,
  daysSinceLastInterest,
}: {
  parqueId: string;
  nombre: string;
  ubicacion: string;
  ocupacion: number;
  m2Totales: number;
  m2Rentados: number;
  allNaves: ParksPortfolioNaveItem[];
  daysSinceLastInterest: number | null;
}): ParksPortfolioParkRow => {
  const availableNaves = allNaves.filter((nave) => nave.kind === 'disponible');
  const constructionNaves = allNaves.filter(
    (nave) => nave.kind === 'construccion',
  );
  const leads = allNaves.flatMap((nave) => nave.leads);

  return {
    parqueId,
    nombre,
    ubicacion,
    ocupacion,
    m2Totales,
    m2Rentados,
    m2Disponibles: Math.max(m2Totales - m2Rentados, 0),
    occupiedNaveCount: allNaves.filter((nave) => nave.kind === 'ocupada')
      .length,
    constructionNaveCount: constructionNaves.length,
    constructionM2: constructionNaves.reduce(
      (total, nave) => total + nave.m2,
      0,
    ),
    totalNaveCount: allNaves.length,
    availableNaves,
    allNaves,
    oldestVacantNave: availableNaves[0] ?? null,
    daysSinceLastInterest,
    leads,
    pipelineValueUsd: leads.reduce(
      (total, lead) => total + lead.pipelineValueUsd,
      0,
    ),
  };
};

const summarizePortfolio = (
  parks: ParksPortfolioParkRow[],
  unmatchedLeads: ParksPortfolioLeadItem[] = [],
): ParksPortfolioByParkResult => ({
  parks,
  unmatchedLeads,
  parqueCount: parks.length,
  availableNaveCount: parks.reduce(
    (total, park) => total + park.availableNaves.length,
    0,
  ),
  availableM2: parks.reduce((total, park) => total + park.m2Disponibles, 0),
  constructionNaveCount: parks.reduce(
    (total, park) => total + park.constructionNaveCount,
    0,
  ),
  leadCount:
    parks.reduce((total, park) => total + park.leads.length, 0) +
    unmatchedLeads.length,
  pipelineValueUsd:
    parks.reduce((total, park) => total + park.pipelineValueUsd, 0) +
    unmatchedLeads.reduce((total, lead) => total + lead.pipelineValueUsd, 0),
});

export const buildParksApodacaConstructionPark = (): ParksPortfolioParkRow =>
  finalizePark({
    parqueId: DEMO_APODACA_PARQUE_ID,
    nombre: 'Apodaca Park Fase 2',
    ubicacion: 'Apodaca, Nuevo León · entrega Q1–Q2 2027',
    ocupacion: 0,
    m2Totales: 79_500,
    m2Rentados: 0,
    daysSinceLastInterest: 2,
    allNaves: [
      buildNave({
        id: 'demo-nave-apo-a',
        identificador: 'APO-A',
        m2: 22_000,
        precioBaseUsd: 5.35,
        kind: 'construccion',
        entregaEstimada: 'Q1 2027',
        leads: [
          buildLead({
            id: 'demo-lead-apo-1',
            name: 'Tesla Supplier Park NL',
            stage: 'EN_NEGOCIACION',
            m2Requeridos: 22_000,
            pipelineValueUsd: 680_000,
            leasingOfficer: 'Israel Ramírez',
            naveId: 'demo-nave-apo-a',
            naveIdentificador: 'APO-A',
            matchReason: 'nave',
            updatedAt: daysAgoIso(2),
          }),
          buildLead({
            id: 'demo-lead-apo-2',
            name: 'Maersk Contract Logistics',
            stage: 'COTIZACION_ENVIADA',
            m2Requeridos: 20_000,
            pipelineValueUsd: 540_000,
            leasingOfficer: 'Héctor Montelongo',
            naveId: 'demo-nave-apo-a',
            naveIdentificador: 'APO-A',
            matchReason: 'nave',
            updatedAt: daysAgoIso(8),
          }),
        ],
      }),
      buildNave({
        id: 'demo-nave-apo-b',
        identificador: 'APO-B',
        m2: 18_500,
        precioBaseUsd: 5.3,
        kind: 'construccion',
        entregaEstimada: 'Q1 2027',
        leads: [
          buildLead({
            id: 'demo-lead-apo-3',
            name: 'Norte 3PL Apodaca',
            stage: 'TOUR_VISITA',
            m2Requeridos: 18_000,
            pipelineValueUsd: 310_000,
            leasingOfficer: 'Bruyel',
            naveId: 'demo-nave-apo-b',
            naveIdentificador: 'APO-B',
            matchReason: 'nave',
            updatedAt: daysAgoIso(5),
          }),
        ],
      }),
      buildNave({
        id: 'demo-nave-apo-c',
        identificador: 'APO-C',
        m2: 15_000,
        precioBaseUsd: 5.25,
        kind: 'construccion',
        entregaEstimada: 'Q2 2027',
      }),
      buildNave({
        id: 'demo-nave-apo-d',
        identificador: 'APO-D',
        m2: 24_000,
        precioBaseUsd: 5.4,
        kind: 'construccion',
        entregaEstimada: 'Q2 2027',
        leads: [
          buildLead({
            id: 'demo-lead-apo-4',
            name: 'EV Battery Hub México',
            stage: 'CALIFICADO',
            m2Requeridos: 24_000,
            pipelineValueUsd: 410_000,
            leasingOfficer: 'Israel Ramírez',
            naveId: 'demo-nave-apo-d',
            naveIdentificador: 'APO-D',
            matchReason: 'nave',
            updatedAt: daysAgoIso(11),
          }),
          buildLead({
            id: 'demo-lead-apo-5',
            name: 'Pacific Crossdock NL',
            stage: 'LEAD_RECIBIDO',
            m2Requeridos: 12_000,
            pipelineValueUsd: 95_000,
            leasingOfficer: null,
            naveId: 'demo-nave-apo-d',
            naveIdentificador: 'APO-D',
            matchReason: 'ubicacion',
            updatedAt: daysAgoIso(1),
          }),
        ],
      }),
    ],
  });

export const withParksConstructionDemoExamples = (
  portfolio: ParksPortfolioByParkResult,
): ParksPortfolioByParkResult => {
  if (
    portfolio.parks.some((park) => park.parqueId === DEMO_APODACA_PARQUE_ID)
  ) {
    return portfolio;
  }

  return summarizePortfolio(
    [...portfolio.parks, buildParksApodacaConstructionPark()],
    portfolio.unmatchedLeads,
  );
};

export const buildParksCeoDemoPortfolio = (): ParksPortfolioByParkResult =>
  summarizePortfolio([
    finalizePark({
      parqueId: 'demo-parque-gdl',
      nombre: 'Guadalajara Park',
      ubicacion: 'Guadalajara, Jalisco',
      ocupacion: 88,
      m2Totales: 90_500,
      m2Rentados: 79_401,
      daysSinceLastInterest: 4,
      allNaves: [
        buildNave({
          id: 'demo-nave-gdl-01',
          identificador: 'GDL-01',
          m2: 12_400,
          precioBaseUsd: 5.4,
          kind: 'ocupada',
        }),
        buildNave({
          id: 'demo-nave-gdl-12',
          identificador: 'GDL-12',
          m2: 3_599,
          precioBaseUsd: 5.4,
          kind: 'disponible',
          daysVacant: 41,
          leads: [
            buildLead({
              id: 'demo-lead-gdl-1',
              name: 'LogiMex Bajío',
              stage: 'COTIZACION_ENVIADA',
              m2Requeridos: 3_200,
              pipelineValueUsd: 210_000,
              leasingOfficer: 'Israel Ramírez',
              naveId: 'demo-nave-gdl-12',
              naveIdentificador: 'GDL-12',
              matchReason: 'nave',
              updatedAt: daysAgoIso(6),
            }),
            buildLead({
              id: 'demo-lead-gdl-2',
              name: 'FrioAndes Cold Storage',
              stage: 'TOUR_VISITA',
              m2Requeridos: 4_000,
              pipelineValueUsd: 180_000,
              leasingOfficer: 'Héctor Montelongo',
              naveId: 'demo-nave-gdl-12',
              naveIdentificador: 'GDL-12',
              matchReason: 'tour',
              updatedAt: daysAgoIso(12),
            }),
          ],
        }),
        buildNave({
          id: 'demo-nave-gdl-bt',
          identificador: 'BT-GDL-A',
          m2: 18_500,
          precioBaseUsd: 5.55,
          kind: 'construccion',
          entregaEstimada: 'Mar 2027',
          leads: [
            buildLead({
              id: 'demo-lead-gdl-3',
              name: 'Amazon Freight GDL',
              stage: 'HOJA_DE_ACUERDOS_FIRMADA',
              m2Requeridos: 18_500,
              pipelineValueUsd: 620_000,
              leasingOfficer: 'Israel Ramírez',
              naveId: 'demo-nave-gdl-bt',
              naveIdentificador: 'BT-GDL-A',
              matchReason: 'nave',
              updatedAt: daysAgoIso(4),
            }),
          ],
        }),
      ],
    }),
    finalizePark({
      parqueId: 'demo-parque-salto',
      nombre: 'El Salto Park III',
      ubicacion: 'El Salto, Jalisco',
      ocupacion: 51,
      m2Totales: 226_000,
      m2Rentados: 101_885,
      daysSinceLastInterest: 4,
      allNaves: [
        buildNave({
          id: 'demo-nave-salto-01',
          identificador: 'ESP-01',
          m2: 24_000,
          precioBaseUsd: 4.9,
          kind: 'ocupada',
        }),
        buildNave({
          id: 'demo-nave-salto-09',
          identificador: 'ESP-09',
          m2: 22_400,
          precioBaseUsd: 4.9,
          kind: 'disponible',
          daysVacant: 187,
        }),
        buildNave({
          id: 'demo-nave-salto-11',
          identificador: 'ESP-11',
          m2: 18_200,
          precioBaseUsd: 4.85,
          kind: 'disponible',
          daysVacant: 94,
          leads: [
            buildLead({
              id: 'demo-lead-salto-1',
              name: 'AutoParts Hub',
              stage: 'EN_NEGOCIACION',
              m2Requeridos: 18_000,
              pipelineValueUsd: 420_000,
              leasingOfficer: 'Israel Ramírez',
              naveId: 'demo-nave-salto-11',
              naveIdentificador: 'ESP-11',
              matchReason: 'nave',
              updatedAt: daysAgoIso(9),
            }),
          ],
        }),
        buildNave({
          id: 'demo-nave-salto-14',
          identificador: 'ESP-14',
          m2: 12_800,
          precioBaseUsd: 5.1,
          kind: 'disponible',
          daysVacant: 28,
          leads: [
            buildLead({
              id: 'demo-lead-salto-2',
              name: 'Pacific 3PL',
              stage: 'CALIFICADO',
              m2Requeridos: 12_000,
              pipelineValueUsd: 160_000,
              leasingOfficer: 'Bruyel',
              naveId: 'demo-nave-salto-14',
              naveIdentificador: 'ESP-14',
              matchReason: 'nave',
              updatedAt: daysAgoIso(4),
            }),
          ],
        }),
        buildNave({
          id: 'demo-nave-salto-15',
          identificador: 'ESP-15',
          m2: 28_000,
          precioBaseUsd: 5.05,
          kind: 'construccion',
          entregaEstimada: 'Mar 2027',
          leads: [
            buildLead({
              id: 'demo-lead-salto-3',
              name: 'AutoParts Hub — expansión',
              stage: 'COTIZACION_ENVIADA',
              m2Requeridos: 28_000,
              pipelineValueUsd: 490_000,
              leasingOfficer: 'Israel Ramírez',
              naveId: 'demo-nave-salto-15',
              naveIdentificador: 'ESP-15',
              matchReason: 'nave',
              updatedAt: daysAgoIso(7),
            }),
          ],
        }),
      ],
    }),
    finalizePark({
      parqueId: 'demo-parque-tmex',
      nombre: 'T-MexPark',
      ubicacion: 'Nextlalpan, Edomex',
      ocupacion: 30,
      m2Totales: 282_000,
      m2Rentados: 66_382,
      daysSinceLastInterest: 6,
      allNaves: [
        buildNave({
          id: 'demo-nave-tmex-01',
          identificador: 'TMX-01',
          m2: 18_000,
          precioBaseUsd: 5.2,
          kind: 'ocupada',
        }),
        buildNave({
          id: 'demo-nave-tmex-03',
          identificador: 'TMX-03',
          m2: 42_000,
          precioBaseUsd: 5.2,
          kind: 'disponible',
          daysVacant: 312,
        }),
        buildNave({
          id: 'demo-nave-tmex-07',
          identificador: 'TMX-07',
          m2: 28_500,
          precioBaseUsd: 5.05,
          kind: 'disponible',
          daysVacant: 140,
          leads: [
            buildLead({
              id: 'demo-lead-tmex-1',
              name: 'Valley Foods MX',
              stage: 'COTIZACION_ENVIADA',
              m2Requeridos: 26_000,
              pipelineValueUsd: 510_000,
              leasingOfficer: 'Israel Ramírez',
              naveId: 'demo-nave-tmex-07',
              naveIdentificador: 'TMX-07',
              matchReason: 'nave',
              updatedAt: daysAgoIso(38),
            }),
          ],
        }),
        buildNave({
          id: 'demo-nave-tmex-xl',
          identificador: 'XL-MTY-1',
          m2: 62_000,
          precioBaseUsd: 5.15,
          kind: 'construccion',
          entregaEstimada: 'Q2 2027',
          leads: [
            buildLead({
              id: 'demo-lead-tmex-2',
              name: 'Walmart CEDIS Norte',
              stage: 'EN_NEGOCIACION',
              m2Requeridos: 60_000,
              pipelineValueUsd: 1_120_000,
              leasingOfficer: 'Héctor Montelongo',
              naveId: 'demo-nave-tmex-xl',
              naveIdentificador: 'XL-MTY-1',
              matchReason: 'nave',
              updatedAt: daysAgoIso(6),
            }),
          ],
        }),
      ],
    }),
    finalizePark({
      parqueId: 'demo-parque-toluca',
      nombre: 'Toluca Parks III',
      ubicacion: 'Toluca, Edomex',
      ocupacion: 64,
      m2Totales: 117_000,
      m2Rentados: 60_555,
      daysSinceLastInterest: 3,
      allNaves: [
        buildNave({
          id: 'demo-nave-tol-01',
          identificador: 'TOL-01',
          m2: 14_000,
          precioBaseUsd: 4.75,
          kind: 'ocupada',
        }),
        buildNave({
          id: 'demo-nave-tol-04',
          identificador: 'TOL-04',
          m2: 16_200,
          precioBaseUsd: 4.75,
          kind: 'disponible',
          daysVacant: 76,
          leads: [
            buildLead({
              id: 'demo-lead-tol-1',
              name: 'Andes Retail DC',
              stage: 'HOJA_DE_ACUERDOS_FIRMADA',
              m2Requeridos: 16_000,
              pipelineValueUsd: 280_000,
              leasingOfficer: 'Héctor Montelongo',
              naveId: 'demo-nave-tol-04',
              naveIdentificador: 'TOL-04',
              matchReason: 'nave',
              updatedAt: daysAgoIso(3),
            }),
          ],
        }),
        buildNave({
          id: 'demo-nave-tol-p1',
          identificador: 'TOL-P1',
          m2: 22_000,
          precioBaseUsd: 4.95,
          kind: 'construccion',
          entregaEstimada: 'Nov 2026',
          leads: [
            buildLead({
              id: 'demo-lead-tol-3',
              name: 'PharmaCold Toluca',
              stage: 'TOUR_VISITA',
              m2Requeridos: 22_000,
              pipelineValueUsd: 360_000,
              leasingOfficer: 'Bruyel',
              naveId: 'demo-nave-tol-p1',
              naveIdentificador: 'TOL-P1',
              matchReason: 'nave',
              updatedAt: daysAgoIso(9),
            }),
          ],
        }),
      ],
    }),
    finalizePark({
      parqueId: 'demo-parque-nl',
      nombre: 'GuadalupePark I',
      ubicacion: 'Guadalupe, Nuevo León',
      ocupacion: 97,
      m2Totales: 95_000,
      m2Rentados: 92_213,
      daysSinceLastInterest: 1,
      allNaves: [
        buildNave({
          id: 'demo-nave-nl-01',
          identificador: 'GPE-01',
          m2: 9_200,
          precioBaseUsd: 5.6,
          kind: 'ocupada',
        }),
        buildNave({
          id: 'demo-nave-nl-11',
          identificador: 'GPE-11',
          m2: 2_787,
          precioBaseUsd: 5.6,
          kind: 'disponible',
          daysVacant: 11,
          leads: [
            buildLead({
              id: 'demo-lead-nl-1',
              name: 'Monterrey Steel Logistics',
              stage: 'TOUR_VISITA',
              m2Requeridos: 2_400,
              pipelineValueUsd: 88_000,
              leasingOfficer: 'Israel Ramírez',
              naveId: 'demo-nave-nl-11',
              naveIdentificador: 'GPE-11',
              matchReason: 'nave',
              updatedAt: daysAgoIso(1),
            }),
          ],
        }),
      ],
    }),
    finalizePark({
      parqueId: 'demo-parque-bajio',
      nombre: 'Parques del Bajío - Silao',
      ubicacion: 'Silao, Guanajuato',
      ocupacion: 79,
      m2Totales: 52_600,
      m2Rentados: 31_900,
      daysSinceLastInterest: 14,
      allNaves: [
        buildNave({
          id: 'demo-nave-silao-01',
          identificador: 'SIL-01',
          m2: 8_200,
          precioBaseUsd: 4.6,
          kind: 'ocupada',
        }),
        buildNave({
          id: 'demo-nave-silao-06',
          identificador: 'SIL-06',
          m2: 5_100,
          precioBaseUsd: 4.6,
          kind: 'disponible',
          daysVacant: 63,
          leads: [
            buildLead({
              id: 'demo-lead-silao-1',
              name: 'OEM Silao Assembly',
              stage: 'CALIFICADO',
              m2Requeridos: 5_000,
              pipelineValueUsd: 125_000,
              leasingOfficer: 'Bruyel',
              naveId: 'demo-nave-silao-06',
              naveIdentificador: 'SIL-06',
              matchReason: 'nave',
              updatedAt: daysAgoIso(14),
            }),
          ],
        }),
        buildNave({
          id: 'demo-nave-silao-xc',
          identificador: 'XC-01',
          m2: 12_000,
          precioBaseUsd: 4.8,
          kind: 'construccion',
          entregaEstimada: 'Q1 2027',
          leads: [
            buildLead({
              id: 'demo-lead-silao-2',
              name: 'GM Supplier Village',
              stage: 'COTIZACION_ENVIADA',
              m2Requeridos: 12_000,
              pipelineValueUsd: 240_000,
              leasingOfficer: 'Israel Ramírez',
              naveId: 'demo-nave-silao-xc',
              naveIdentificador: 'XC-01',
              matchReason: 'nave',
              updatedAt: daysAgoIso(10),
            }),
          ],
        }),
      ],
    }),
    buildParksApodacaConstructionPark(),
  ]);
