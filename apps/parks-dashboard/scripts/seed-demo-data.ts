/**
 * Seed demo Bajío para parks-dashboard (Parques del Bajío - Silao).
 * Uso: npm run seed:demo (desde apps/parks-dashboard)
 * Requiere TWENTY_API_URL y TWENTY_API_KEY en .env.local
 */

const TWENTY_API_URL =
  process.env.TWENTY_API_URL ?? 'http://localhost:3000/graphql';
const TWENTY_API_KEY = process.env.TWENTY_API_KEY ?? '';
const PREFIX = 'BAJIO-DEMO-';

const BAJIO_PARQUE_ENTRANCE_IMAGE_URL =
  'https://images.unsplash.com/photo-1595844730298-6cff2533fccc?auto=format&fit=crop&w=1200&q=80';

const BAJIO_NAVE_PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1595844730298-6cff2533fccc?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
] as const;

const toSelectValue = (label: string): string =>
  label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

const isoDaysFromToday = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0]!;
};

const twentyMutate = async <TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> => {
  const response = await fetch(TWENTY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as {
    data?: TData;
    errors?: { message: string }[];
  };

  if (!response.ok || payload.errors?.length) {
    const detail = payload.errors?.map((error) => error.message).join('; ');
    throw new Error(detail ?? `HTTP ${response.status}`);
  }

  if (!payload.data) {
    throw new Error('Empty GraphQL response');
  }

  return payload.data;
};

const CREATE_PARQUE = `
  mutation CreateParque($data: ParqueCreateInput!) {
    createParque(data: $data) { id nombre }
  }
`;

const CREATE_NAVE = `
  mutation CreateNave($data: NaveCreateInput!) {
    createNave(data: $data) { id identificador }
  }
`;

const CREATE_INQUILINO = `
  mutation CreateInquilino($data: InquilinoCreateInput!) {
    createInquilino(data: $data) { id empresa }
  }
`;

const CREATE_HOJA = `
  mutation CreateHoja($data: HojaDeAcuerdosCreateInput!) {
    createHojaDeAcuerdos(data: $data) { id referencia }
  }
`;

const CREATE_CASO = `
  mutation CreateCaso($data: CasoLegalCreateInput!) {
    createCasoLegal(data: $data) { id referencia }
  }
`;

const CREATE_EXPEDIENTE = `
  mutation CreateExpediente($data: ExpedienteContratoCreateInput!) {
    createExpedienteContrato(data: $data) { id }
  }
`;

const CREATE_OPPORTUNITY = `
  mutation CreateOpp($data: OpportunityCreateInput!) {
    createOpportunity(data: $data) { id name }
  }
`;

const FIND_BAJIO_PARQUE = `
  query FindBajioParque($nombre: String!) {
    parques(filter: { nombre: { eq: $nombre } }, first: 1) {
      edges { node { id nombre } }
    }
  }
`;

const FIND_NAVE_IN_PARQUE = `
  query FindNaveInParque($parqueId: UUID!, $identificador: String!) {
    naves(
      filter: {
        and: [
          { parqueId: { eq: $parqueId } }
          { identificador: { eq: $identificador } }
        ]
      }
      first: 1
    ) {
      edges { node { id } }
    }
  }
`;

const FIND_CASO_BY_REF = `
  query FindCasoByRef($referencia: String!) {
    casosLegales(filter: { referencia: { eq: $referencia } }, first: 1) {
      edges { node { id } }
    }
  }
`;

const FIND_INQUILINO_BY_RFC = `
  query FindInquilinoByRfc($rfc: String!) {
    inquilinos(filter: { rfc: { eq: $rfc } }, first: 1) {
      edges { node { id empresa } }
    }
  }
`;

const FIND_HOJA_BY_REF = `
  query FindHojaByRef($referencia: String!) {
    hojasDeAcuerdos(filter: { referencia: { eq: $referencia } }, first: 1) {
      edges { node { id referencia } }
    }
  }
`;

type IdMap = Record<string, string>;

const NAVES = [
  { key: 'n1', id: 'Nave 1', m2: 3500, tenant: 'Genomma Lab', days: 45, estatus: 'Rentada' },
  { key: 'n2', id: 'Nave 2', m2: 2800, tenant: 'Helvex', days: 140, estatus: 'Rentada' },
  { key: 'n3', id: 'Nave 3', m2: 4200, tenant: 'Grupo Lala', days: 380, estatus: 'Rentada' },
  { key: 'n4', id: 'Nave 4', m2: 3100, tenant: null, days: null, estatus: 'Disponible' },
  { key: 'n5', id: 'Nave 5', m2: 2500, tenant: 'Yazaki', days: 210, estatus: 'Rentada' },
  { key: 'n6', id: 'Nave 6', m2: 5000, tenant: 'Continental', days: 65, estatus: 'Rentada' },
  { key: 'n7', id: 'Nave 7', m2: 3800, tenant: null, days: null, estatus: 'Disponible' },
  { key: 'n8', id: 'Nave 8', m2: 2900, tenant: 'Quala', days: 160, estatus: 'Rentada' },
  { key: 'n9', id: 'Nave 9', m2: 4500, tenant: 'Bimbo', days: 290, estatus: 'Rentada' },
  { key: 'n10', id: 'Nave 10', m2: 3200, tenant: null, days: null, estatus: 'Disponible' },
  { key: 'n11', id: 'Nave 11', m2: 2700, tenant: 'Alpura', days: 85, estatus: 'Rentada' },
  { key: 'n12', id: 'Nave 12', m2: 3600, tenant: '3M', days: 420, estatus: 'Rentada' },
] as const;

const BAJIO_PARQUE_NOMBRE = 'Parques del Bajío - Silao';

const main = async () => {
  if (!TWENTY_API_KEY) {
    throw new Error('TWENTY_API_KEY requerida');
  }

  const existingOpportunity = await twentyMutate<{
    opportunities: { edges: { node: { id: string } }[] };
  }>(
    `query FindBajioOpp($filter: OpportunityFilterInput!) {
      opportunities(filter: $filter, first: 1) { edges { node { id } } }
    }`,
    { filter: { name: { startsWith: PREFIX } } },
  );

  if (existingOpportunity.opportunities.edges.length > 0) {
    console.log('[seed:bajio] Dataset Bajío ya existe — omitiendo seed');
    return;
  }

  const existingParque = await twentyMutate<{
    parques: { edges: { node: { id: string } }[] };
  }>(FIND_BAJIO_PARQUE, { nombre: BAJIO_PARQUE_NOMBRE });

  const ids: IdMap = {};
  const existingParqueId = existingParque.parques.edges[0]?.node.id;

  if (existingParqueId) {
    ids.parque = existingParqueId;
    console.log('[seed:bajio] Parque Silao existente — continuando naves...');
  } else {
    console.log('[seed:bajio] Iniciando seed Parques del Bajío - Silao...');

    const parque = await twentyMutate<{ createParque: { id: string } }>(
      CREATE_PARQUE,
      {
        data: {
          nombre: BAJIO_PARQUE_NOMBRE,
          ubicacion: 'Blvd. El Mezquital 234, Silao, GTO',
          m2Totales: NAVES.reduce((sum, nave) => sum + nave.m2, 0),
          m2Rentados: NAVES.filter((nave) => nave.tenant).reduce(
            (sum, nave) => sum + nave.m2,
            0,
          ),
          administrador: 'Lic. Roberto Sánchez',
          fotoEntradaUrl: BAJIO_PARQUE_ENTRANCE_IMAGE_URL,
        },
      },
    );
    ids.parque = parque.createParque.id;
    console.log('[seed:bajio] + parque Silao');
  }

  for (const [naveIndex, nave] of NAVES.entries()) {
    const casoReferencia = `${PREFIX}CASO-${nave.key}`;
    const existingCaso = await twentyMutate<{
      casosLegales: { edges: { node: { id: string } }[] };
    }>(FIND_CASO_BY_REF, { referencia: casoReferencia });

    if (existingCaso.casosLegales.edges.length > 0) {
      console.log(`[seed:bajio] ✓ ${nave.id} (ya existe)`);
      ids[nave.key] =
        (
          await twentyMutate<{
            naves: { edges: { node: { id: string } }[] };
          }>(FIND_NAVE_IN_PARQUE, {
            parqueId: ids.parque,
            identificador: nave.id,
          })
        ).naves.edges[0]?.node.id ?? '';
      continue;
    }

    const existingNave = await twentyMutate<{
      naves: { edges: { node: { id: string } }[] };
    }>(FIND_NAVE_IN_PARQUE, {
      parqueId: ids.parque,
      identificador: nave.id,
    });

    if (existingNave.naves.edges[0]?.node.id) {
      ids[nave.key] = existingNave.naves.edges[0].node.id;
    } else {
      const record = await twentyMutate<{ createNave: { id: string } }>(
        CREATE_NAVE,
        {
          data: {
            identificador: nave.id,
            m2: nave.m2,
            alturaLibreM: 12,
            andenes: 4,
            estatus: toSelectValue(nave.estatus),
            precioBaseUsd: 0.88,
            fotoInmuebleUrl:
              BAJIO_NAVE_PROPERTY_IMAGES[
                naveIndex % BAJIO_NAVE_PROPERTY_IMAGES.length
              ],
            parqueId: ids.parque,
          },
        },
      );
      ids[nave.key] = record.createNave.id;
    }

    if (nave.tenant) {
      const inquilinoRfc = `${PREFIX}RFC-${nave.key}`;
      const existingInquilino = await twentyMutate<{
        inquilinos: { edges: { node: { id: string } }[] };
      }>(FIND_INQUILINO_BY_RFC, { rfc: inquilinoRfc });

      if (existingInquilino.inquilinos.edges[0]?.node.id) {
        ids[`inq-${nave.key}`] = existingInquilino.inquilinos.edges[0].node.id;
      } else {
        const inquilino = await twentyMutate<{ createInquilino: { id: string } }>(
          CREATE_INQUILINO,
          {
            data: {
              empresa: nave.tenant,
              rfc: inquilinoRfc,
              sector: toSelectValue('Manufactura'),
              contactoPrincipal: 'Contacto Demo',
              emailContacto: 'demo@parks.mx',
              telefono: '+52 472 123 4567',
              estatus: toSelectValue('Activo'),
              repLegalNombre: 'Rep. Legal Demo',
              pagosAlCorriente: true,
            },
          },
        );
        ids[`inq-${nave.key}`] = inquilino.createInquilino.id;
      }

      const hojaReferencia = `${PREFIX}HOJA-${nave.key}`;
      const existingHoja = await twentyMutate<{
        hojasDeAcuerdos: { edges: { node: { id: string } }[] };
      }>(FIND_HOJA_BY_REF, { referencia: hojaReferencia });

      let hojaId: string;

      if (existingHoja.hojasDeAcuerdos.edges[0]?.node.id) {
        hojaId = existingHoja.hojasDeAcuerdos.edges[0].node.id;
      } else {
        const hoja = await twentyMutate<{ createHojaDeAcuerdos: { id: string } }>(
          CREATE_HOJA,
          {
            data: {
              referencia: hojaReferencia,
              tipoContrato: toSelectValue('Arrendamiento nuevo'),
              m2Acordados: nave.m2,
              precioUsdM2: 0.88,
              plazoMeses: 36,
              fechaFirma: isoDaysFromToday(-30),
              fechaInicio: isoDaysFromToday(-300),
              periodoGraciaMeses: 2,
              depositoMeses: 1,
              escalacionAnualPct: 3,
              brokerComisionPct: 2.5,
              ejecutivoAsignado: 'Héctor Torres',
              inquilinoId: ids[`inq-${nave.key}`],
              naveId: ids[nave.key],
            },
          },
        );
        hojaId = hoja.createHojaDeAcuerdos.id;
      }

      const caso = await twentyMutate<{ createCasoLegal: { id: string } }>(
        CREATE_CASO,
        {
          data: {
            referencia: casoReferencia,
            tipoDocumento: toSelectValue('Contrato nuevo'),
            estatus:
              nave.key === 'n1'
                ? toSelectValue('En elaboración')
                : toSelectValue('Firmado — cerrado'),
            semaforo:
              nave.days !== null && nave.days <= 90
                ? toSelectValue('Rojo')
                : toSelectValue('Verde'),
            abogadoAsignado: 'Catalina Moreno',
            fechaHojaAcuerdos: isoDaysFromToday(-30),
            slaDiasHabiles: 60,
            diasTranscurridos: nave.key === 'n1' ? 18 : 45,
            documentacionCompleta: nave.key !== 'n1',
            cotejoAprobado: nave.key !== 'n1',
            esPropiedadFuno: false,
            hojaDeAcuerdosId: hojaId,
            inquilinoId: ids[`inq-${nave.key}`],
            naveId: ids[nave.key],
            notasCatalina:
              nave.key === 'n1'
                ? 'APROBACION_ETAPA:legal\nRenovación urgente Genomma Lab'
                : undefined,
          },
        },
      );

      await twentyMutate(CREATE_EXPEDIENTE, {
        data: {
          numeroExpediente: `${PREFIX}EXP-${nave.key}`,
          fechaApertura: isoDaysFromToday(-365),
          fechaVencimiento: isoDaysFromToday(nave.days ?? 365),
          rentaMensualUsd: nave.m2 * 0.88,
          estatus: toSelectValue('Activo'),
          casoLegalId: caso.createCasoLegal.id,
          inquilinoId: ids[`inq-${nave.key}`],
          naveId: ids[nave.key],
        },
      });
    }

    console.log(`[seed:bajio] + ${nave.id}`);
  }

  const existingNestle = await twentyMutate<{
    opportunities: { edges: { node: { id: string } }[] };
  }>(
    `query FindNestle($filter: OpportunityFilterInput!) {
      opportunities(filter: $filter, first: 1) { edges { node { id } } }
    }`,
    { filter: { name: { startsWith: `${PREFIX}Nestlé` } } },
  );

  if (existingNestle.opportunities.edges.length === 0) {
    await twentyMutate(CREATE_OPPORTUNITY, {
      data: {
        name: `${PREFIX}Nestlé México — Nave 4`,
        stage: toSelectValue('En negociación'),
        tipoOperacion: toSelectValue('Arrendamiento nuevo'),
        m2Requeridos: 3100,
        canalOrigen: toSelectValue('Directo'),
        naveVinculadaId: ids.n4,
        amount: { amountMicros: 310_000_000_000, currencyCode: 'USD' },
      },
    });
    console.log('[seed:bajio] + deal Nestlé en negociación');
  }

  console.log('[seed:bajio] ✅ Seed completado');
};

main().catch((error) => {
  console.error('[seed:bajio] Error:', error);
  process.exit(1);
});
