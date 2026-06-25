import { type CasoLegalRecord } from '../types/parks.types';
import { parksAiContextService } from './parks-ai-context.service';
import {
  type ParksAiAction,
  type ParksAiChecklistDocument,
  type ParksAiNaveSnapshot,
  type ParksAiRouteContext,
} from './parks-ai.types';

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('es-MX').format(Math.round(value * 100) / 100);

const parseMinimumM2FromQuery = (message: string): number | null => {
  const match = message.replace(/,/g, '').match(/(\d{3,6})\s*m/iu);

  if (!match) {
    return null;
  }

  return Number(match[1]);
};

const matchesCityFilter = (
  nave: ParksAiNaveSnapshot,
  cityFilterId?: string,
): boolean => {
  if (!cityFilterId || cityFilterId === 'all') {
    return true;
  }

  const searchText =
    `${nave.parqueNombre ?? ''} ${nave.ubicacion ?? ''}`.toLowerCase();

  const cityKeywords: Record<string, string[]> = {
    'ciudad-de-mexico': [
      'méxico',
      'mexico',
      'edomex',
      'toluca',
      'tultitlán',
      'tultitlan',
      'tlalnepantla',
      'nextlalpan',
      't-mex',
      'tulti',
      'tlane',
    ],
    guadalajara: ['jalisco', 'guadalajara', 'el salto', 'tlaquepaque'],
    monterrey: ['monterrey', 'nuevo león', 'nuevo leon', 'guadalupe'],
    bajio: ['bajío', 'bajio', 'silao', 'guanajuato', 'querétaro', 'queretaro'],
  };

  const keywords = cityKeywords[cityFilterId] ?? [];

  return keywords.some((keyword) => searchText.includes(keyword));
};

const buildChecklistReviewReply = (
  casoLegal: CasoLegalRecord,
  checklist: ParksAiChecklistDocument[],
): string => {
  const expectedTypes = parksAiContextService.getExpectedChecklistTypes();
  const delivered = checklist.filter((document) => document.entregado === true);
  const pending = checklist.filter((document) => document.entregado !== true);
  const completionRate =
    checklist.length > 0
      ? Math.round((delivered.length / checklist.length) * 100)
      : 0;

  const pendingLines =
    pending.length > 0
      ? pending
          .map(
            (document) =>
              `- **${document.titulo ?? document.tipoDocumento ?? 'Documento'}**`,
          )
          .join('\n')
      : '- Ninguno — checklist completo.';

  const recommendation =
    pending.length > 0 || casoLegal.documentacionCompleta === false
      ? '**Recomendación:** No avanzar a firma hasta completar la documentación pendiente.'
      : '**Recomendación:** Documentación lista para revisión legal detallada.';

  return [
    `## Verificación de checklist — ${casoLegal.referencia ?? casoLegal.id}`,
    '',
    `**Estatus del caso:** ${casoLegal.estatus ?? '—'}`,
    `**Semáforo SLA:** ${casoLegal.semaforo ?? '—'}`,
    `**Bandera documentación completa:** ${
      casoLegal.documentacionCompleta ? 'Sí' : 'No'
    }`,
    `**Avance checklist:** ${delivered.length}/${checklist.length} (${completionRate}%)`,
    '',
    '### Documentos pendientes',
    pendingLines,
    '',
    '### Catálogo esperado (10 ítems)',
    expectedTypes.map((type) => `- ${type}`).join('\n'),
    '',
    recommendation,
  ].join('\n');
};

const buildCaseSummaryReply = (
  casoLegal: CasoLegalRecord,
  checklist: ParksAiChecklistDocument[],
): string => {
  const hoja = casoLegal.hojaDeAcuerdos;
  const nave = hoja?.nave ?? casoLegal.nave;
  const parque = nave?.parque;
  const rentaMensual =
    (hoja?.m2Acordados ?? 0) * (hoja?.precioUsdM2 ?? 0);
  const pendingDocs = checklist.filter((document) => document.entregado !== true);

  return [
    `## Resumen ejecutivo — ${casoLegal.referencia ?? 'Caso legal'}`,
    '',
    `**Inquilino:** ${casoLegal.inquilino?.empresa ?? '—'}`,
    `**Nave:** ${nave?.identificador ?? '—'}${
      parque?.nombre ? ` · ${parque.nombre}` : ''
    }`,
    `**Ubicación:** ${parque?.ubicacion ?? '—'}`,
    `**Tipo de documento:** ${casoLegal.tipoDocumento ?? '—'}`,
    `**Superficie acordada:** ${
      hoja?.m2Acordados ? `${formatNumber(hoja.m2Acordados)} m²` : '—'
    }`,
    `**Precio:** ${
      hoja?.precioUsdM2 ? `USD ${hoja.precioUsdM2}/m²` : '—'
    }`,
    `**Plazo:** ${hoja?.plazoMeses ? `${hoja.plazoMeses} meses` : '—'}`,
    `**Renta mensual estimada:** ${
      rentaMensual > 0 ? `USD ${formatNumber(rentaMensual)}` : '—'
    }`,
    '',
    '### SLA y riesgo',
    `- Días transcurridos: ${casoLegal.diasTranscurridos ?? '—'}`,
    `- SLA: ${casoLegal.slaDiasHabiles ?? '—'} días hábiles`,
    `- Semáforo: ${casoLegal.semaforo ?? '—'}`,
    `- Documentos pendientes: ${pendingDocs.length}`,
    '',
    casoLegal.esPropiedadFuno
      ? '**Nota FUNO:** Propiedad del fondo — validar ruta de archivo expediente.'
      : '**Nota:** Propiedad de terceros / estándar Parks.',
  ].join('\n');
};

const buildAvailabilityReply = (
  naves: ParksAiNaveSnapshot[],
  context?: ParksAiRouteContext,
  message?: string,
): string => {
  const minimumM2 = message ? parseMinimumM2FromQuery(message) : null;
  const filteredNaves = naves
    .filter((nave) => matchesCityFilter(nave, context?.cityFilterId))
    .filter((nave) =>
      minimumM2 === null ? true : (nave.m2 ?? 0) >= minimumM2,
    )
    .sort((left, right) => (right.m2 ?? 0) - (left.m2 ?? 0))
    .slice(0, 8);

  if (filteredNaves.length === 0) {
    return [
      '## Disponibilidad',
      '',
      'No encontré naves **Disponibles** que coincidan con el filtro actual.',
      'Prueba ampliar la región o bajar el mínimo de m².',
    ].join('\n');
  }

  const lines = filteredNaves.map(
    (nave) =>
      `- **${nave.identificador}** · ${formatNumber(nave.m2 ?? 0)} m² · ${
        nave.parqueNombre ?? 'Parque'
      } (${nave.ubicacion ?? '—'})`,
  );

  return [
    '## Naves disponibles (catálogo Parks)',
    '',
    context?.cityFilterId && context.cityFilterId !== 'all'
      ? `Filtro de región: **${context.cityFilterId}**`
      : 'Cartera nacional',
    minimumM2 ? `Mínimo solicitado: **${formatNumber(minimumM2)} m²**` : null,
    '',
    lines.join('\n'),
    '',
    `**Total mostradas:** ${filteredNaves.length} de ${naves.length} disponibles en sistema.`,
  ]
    .filter((line) => line !== null)
    .join('\n');
};

export const parksAiDemoService = {
  respond: async ({
    action,
    message,
    context,
    casoLegal,
    checklist,
    disponibleNaves,
  }: {
    action: ParksAiAction;
    message: string;
    context?: ParksAiRouteContext;
    casoLegal?: CasoLegalRecord | null;
    checklist?: ParksAiChecklistDocument[];
    disponibleNaves?: ParksAiNaveSnapshot[];
  }): Promise<{ reply: string; suggestedFollowUps: string[] }> => {
    if (action === 'checklist_review' && casoLegal) {
      return {
        reply: buildChecklistReviewReply(
          casoLegal,
          checklist ?? [],
        ),
        suggestedFollowUps: [
          'Resumir el caso legal',
          '¿Qué riesgos SLA tiene este caso?',
        ],
      };
    }

    if (action === 'case_summary' && casoLegal) {
      return {
        reply: buildCaseSummaryReply(casoLegal, checklist ?? []),
        suggestedFollowUps: [
          'Verificar checklist documental',
          'Redactar comentario de aprobación',
        ],
      };
    }

    if (action === 'availability_search') {
      return {
        reply: buildAvailabilityReply(
          disponibleNaves ?? [],
          context,
          message,
        ),
        suggestedFollowUps: [
          '¿Qué hay disponible en CDMX arriba de 5,000 m²?',
          'Mostrar opciones en Guadalajara',
        ],
      };
    }

    const screenHint = parksAiContextService.buildScreenHint(context);

    return {
      reply: [
        '## Asistente Parks (modo demo)',
        '',
        `Recibí tu consulta: "${message.trim()}"`,
        '',
        `**Contexto:** ${screenHint}`,
        '',
        'Puedo ayudarte con:',
        '- **Verificar checklist** en aprobación de contratos',
        '- **Resumir casos legales** con datos de hoja de acuerdos',
        '- **Buscar naves disponibles** desde el mapa o cartera',
        '',
        'Usa los botones rápidos en cada pantalla o pregunta de forma específica.',
      ].join('\n'),
      suggestedFollowUps: [
        'Verificar checklist del caso actual',
        'Resumir este caso',
        '¿Qué naves tengo disponibles?',
      ],
    };
  },
};
