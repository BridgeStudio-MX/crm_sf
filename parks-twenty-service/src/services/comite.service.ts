import { randomUUID } from 'crypto';

import { envConfig } from '../config/env.config';
import { brokerNotificationStore } from './broker-notification.store';
import { commercialLegalHandoffService } from './commercial-legal-handoff.service';
import {
  COMITE_ESTATUS_AJUSTES_PEDIDOS,
  COMITE_MIN_GLA_M2,
  comiteStore,
  computeComiteIaFlags,
  DEFAULT_COMITE_MEMBERS,
  hydrateDealSnapshot,
  isComiteStillOnAgenda,
  requiresComiteByGla,
} from './comite.store';
import {
  PARKS_NOTIFICATION_CEO_ROLES,
  PARKS_NOTIFICATION_COMMERCIAL_ROLES,
} from './notification-audience.util';
import { buildPipelineDealActionPath } from '../utils/notification-action-path.util';
import { twentyDataService } from './twenty-data.service';
import {
  type ComiteAutorizacion,
  type ComiteConfig,
  type ComiteListSummary,
  type ComiteMiembroSeat,
  type ComitePregunta,
  type ComiteResolucion,
  type ComiteVotoValor,
  type CreateComiteFromHojaInput,
} from '../types/comite.types';
import { toSelectValue } from '../utils/select-value.util';

const OPPORTUNITY_STAGE_EN_NEGOCIACION = 'EN_NEGOCIACION';
const OPPORTUNITY_STAGE_EN_PROCESO_LEGAL = 'EN_PROCESO_LEGAL';

const recountVotes = (
  miembros: ComiteMiembroSeat[],
): Pick<
  ComiteAutorizacion,
  'votosAprueba' | 'votosRechaza' | 'votosPendientes' | 'votosAbstiene'
> => ({
  votosAprueba: miembros.filter((member) => member.voto === 'Aprueba').length,
  votosRechaza: miembros.filter((member) => member.voto === 'Rechaza').length,
  votosPendientes: miembros.filter((member) => member.voto === 'Pendiente')
    .length,
  votosAbstiene: miembros.filter((member) => member.voto === 'Se abstiene')
    .length,
});

const buildRejectionSummary = (miembros: ComiteMiembroSeat[]): string =>
  miembros
    .filter((member) => member.voto === 'Rechaza')
    .map((member) => {
      const when = member.fechaVoto
        ? new Date(member.fechaVoto).toLocaleString('es-MX')
        : '';
      return `${member.nombre} (${member.rolEtiqueta})${when ? ` — ${when}` : ''}:\n"${member.comentario ?? ''}"`;
    })
    .join('\n\n');

const appendAudit = (comite: ComiteAutorizacion, line: string): string[] => [
  ...comite.auditoria,
  `${new Date().toISOString()} ${line}`,
];

const addHours = (iso: string, hours: number): string => {
  const date = new Date(iso);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

const evaluateResultado = async (
  comite: ComiteAutorizacion,
): Promise<ComiteAutorizacion> => {
  const counts = recountVotes(comite.miembros);
  let next: ComiteAutorizacion = { ...comite, ...counts };

  if (counts.votosAprueba >= 2) {
    const hasDissident = counts.votosRechaza >= 1;
    const resolucion: ComiteResolucion =
      counts.votosAprueba === 3
        ? 'Aprobado — 3 de 3'
        : hasDissident
          ? 'Aprobado — 2 de 3 (con voto disidente)'
          : 'Aprobado — 2 de 3';

    next = {
      ...next,
      resolucion,
      fechaResolucion: new Date().toISOString(),
      estatus: hasDissident
        ? 'Resuelto — Aprobado con voto disidente'
        : 'Resuelto — Aprobado',
      auditoria: appendAudit(comite, `Resuelto: ${resolucion}`),
    };

    if (hasDissident) {
      const disidente = next.miembros.find(
        (member) => member.voto === 'Rechaza',
      );
      next = {
        ...next,
        auditoria: appendAudit(
          next,
          `Aprobado con objeción de ${disidente?.nombre ?? 'miembro'}: "${disidente?.comentario ?? ''}"`,
        ),
      };
    }

    next = await activarFlujoLegal(next);
    return comiteStore.upsert(next);
  }

  if (counts.votosRechaza >= 2) {
    const resolucion: ComiteResolucion =
      counts.votosRechaza === 3 ? 'Rechazado — 3 de 3' : 'Rechazado — 2 de 3';
    const resumen = buildRejectionSummary(next.miembros);

    next = {
      ...next,
      resolucion,
      fechaResolucion: new Date().toISOString(),
      estatus: 'Resuelto — Rechazado',
      resumenRazonesRechazo: resumen,
      auditoria: appendAudit(comite, `Resuelto: ${resolucion}`),
    };

    next = await activarFlujoRechazo(next);
    return comiteStore.upsert(next);
  }

  if (
    counts.votosAprueba === 1 &&
    counts.votosRechaza === 1 &&
    counts.votosAbstiene === 1
  ) {
    next = {
      ...next,
      resolucion: 'Empate — escalar',
      fechaResolucion: new Date().toISOString(),
      estatus: 'Vencido sin resolución',
      auditoria: appendAudit(
        comite,
        'Empate — escalar a Director General / CEO',
      ),
    };

    brokerNotificationStore.add({
      type: 'alert',
      priority: 'high',
      title: `⚖️ Empate en comité — ${next.deal.clienteRazonSocial}`,
      body: 'Se requiere decisión ejecutiva. 1 aprueba · 1 rechaza · 1 se abstiene.',
      area: 'Comercial',
      opportunityId: next.opportunityId,
      actionPath: `/parks/comite/${next.id}`,
      actionLabel: 'Ver comité',
      audienceRoleLabels: ['Parks — CEO', 'Parks — Director Comercial'],
      audienceNames: ['Charles El Mann Metta', 'Charles'],
    });

    return comiteStore.upsert(next);
  }

  return comiteStore.upsert(next);
};

const activarFlujoLegal = async (
  comite: ComiteAutorizacion,
): Promise<ComiteAutorizacion> => {
  let casoLegalId = comite.casoLegalId;

  if (comite.opportunityId && comite.hojaDeAcuerdosId) {
    try {
      const handoff =
        await commercialLegalHandoffService.handoffFromOpportunity(
          comite.opportunityId,
          comite.hojaDeAcuerdosId,
        );
      casoLegalId = handoff.casoLegalId ?? casoLegalId;

      if (handoff.created || handoff.casoLegalId) {
        await twentyDataService.updateOpportunity(comite.opportunityId, {
          stage: toSelectValue(OPPORTUNITY_STAGE_EN_PROCESO_LEGAL),
        });
      }
    } catch (error) {
      console.error('[comite] Legal handoff failed:', error);
    }
  }

  brokerNotificationStore.add({
    type: 'alert',
    priority: 'high',
    title: `📋 Nuevo caso — Comité aprobó · ${comite.deal.clienteRazonSocial}`,
    body: `${comite.resolucion} · ${comite.deal.naveNomenclatura} · ${comite.deal.glaM2.toLocaleString('es-MX')} m²`,
    area: 'Legal',
    opportunityId: comite.opportunityId,
    actionPath: casoLegalId
      ? `/parks/contratos/${casoLegalId}/aprobacion`
      : '/parks/contratos',
    actionLabel: 'Ver caso legal',
    audienceRoleLabels: [
      'Parks — Admin Legal',
      'Parks — Director Legal',
      'Parks — Subdirector Legal',
    ],
    audienceNames: ['Catalina Moreno', 'Catalina'],
  });

  brokerNotificationStore.add({
    type: 'alert',
    priority: 'normal',
    title: `✅ Comité aprobó el deal — pasó a Legal`,
    body:
      comite.resolucion.includes('disidente')
        ? 'Aprobado con voto disidente. La objeción queda en el expediente.'
        : `${comite.resolucion}`,
    area: 'Comercial',
    opportunityId: comite.opportunityId,
    actionPath: `/parks/comite/${comite.id}`,
    actionLabel: 'Ver comité',
    audienceRoleLabels: [
      'Parks — Ejecutivo Comercial',
      'Parks — Director Comercial',
    ],
    audienceNames: [comite.leasingOfficerNombre],
  });

  return {
    ...comite,
    casoLegalId,
    auditoria: appendAudit(comite, 'Handoff a Legal disparado'),
  };
};

const activarFlujoRechazo = async (
  comite: ComiteAutorizacion,
): Promise<ComiteAutorizacion> => {
  if (comite.opportunityId) {
    try {
      await twentyDataService.updateOpportunity(comite.opportunityId, {
        stage: toSelectValue(OPPORTUNITY_STAGE_EN_NEGOCIACION),
      });
    } catch (error) {
      console.error('[comite] Failed to revert opportunity stage:', error);
    }

    try {
      await twentyDataService.createTask(
        `Comunicar rechazo del comité a ${comite.deal.clienteRazonSocial}`,
        comite.resumenRazonesRechazo ??
          'Revisa las razones del comité y define si renegociar.',
      );
    } catch {
      // demo environments may lack task object
    }
  }

  brokerNotificationStore.add({
    type: 'alert',
    priority: 'high',
    title: `❌ El comité rechazó el deal — ${comite.deal.clienteRazonSocial}`,
    body:
      comite.resumenRazonesRechazo ??
      'Mayorías rechazaron. Revisa razones y renegocia o marca Perdida.',
    area: 'Comercial',
    opportunityId: comite.opportunityId,
    actionPath: `/parks/comite/${comite.id}`,
    actionLabel: 'Ver razones',
    audienceRoleLabels: [
      'Parks — Ejecutivo Comercial',
      'Parks — Director Comercial',
    ],
    audienceNames: [comite.leasingOfficerNombre, comite.cemQueFirmoNombre],
  });

  return {
    ...comite,
    auditoria: appendAudit(
      comite,
      'Deal regresado a negociación · LO/CEM notificados',
    ),
  };
};

export const comiteService = {
  getConfig: (): ComiteConfig => comiteStore.getConfig(),

  updateConfig: (patch: Partial<ComiteConfig>): ComiteConfig =>
    comiteStore.updateConfig(patch),

  list: (viewerEmail?: string): {
    comites: ComiteAutorizacion[];
    summary: ComiteListSummary;
    config: ComiteConfig;
  } => {
    const comites = comiteStore.list();
    const normalizedEmail = viewerEmail?.trim().toLowerCase();

    const summary: ComiteListSummary = {
      openCount: comites.filter(
        (item) => item.estatus === 'Abierto — en deliberación',
      ).length,
      approvedCount: comites.filter((item) =>
        item.estatus.startsWith('Resuelto — Aprobado'),
      ).length,
      rejectedCount: comites.filter(
        (item) => item.estatus === 'Resuelto — Rechazado',
      ).length,
      tiedCount: comites.filter(
        (item) => item.resolucion === 'Empate — escalar',
      ).length,
      pendingVotesForViewer: normalizedEmail
        ? comites.filter(
            (item) =>
              item.estatus === 'Abierto — en deliberación' &&
              item.miembros.some(
                (member) =>
                  member.email.toLowerCase() === normalizedEmail &&
                  member.voto === 'Pendiente',
              ),
          ).length
        : 0,
    };

    return { comites, summary, config: comiteStore.getConfig() };
  },

  getById: (comiteId: string): ComiteAutorizacion | undefined =>
    comiteStore.getById(comiteId),

  createFromHoja: async (
    input: CreateComiteFromHojaInput,
  ): Promise<ComiteAutorizacion> => {
    if (!envConfig.parksComiteEnabled) {
      throw new Error('PARKS_COMITE_ENABLED=false');
    }

    if (!requiresComiteByGla(input.deal.glaM2)) {
      throw new Error(
        `COMITE_GLA_BELOW_MIN: el comité solo aplica a deals con GLA mayor a ${COMITE_MIN_GLA_M2.toLocaleString('es-MX')} m² (recibido ${input.deal.glaM2})`,
      );
    }

    const existing =
      comiteStore.getByHojaId(input.hojaDeAcuerdosId) ??
      comiteStore.getByOpportunityId(input.opportunityId);

    if (existing && isComiteStillOnAgenda(existing)) {
      const config = comiteStore.getConfig();
      const deal = hydrateDealSnapshot(
        { ...existing.deal, ...input.deal },
        config,
      );

      return comiteStore.upsert({
        ...existing,
        deal,
        hojaDeAcuerdosId: input.hojaDeAcuerdosId,
        estatus: 'Abierto — en deliberación',
        auditoria: appendAudit(
          existing,
          existing.estatus === COMITE_ESTATUS_AJUSTES_PEDIDOS
            ? 'Comercial reenvió términos ajustados — vuelve a sesión'
            : 'Términos de Hoja actualizados — sigue en deliberación',
        ),
      });
    }

    const config = comiteStore.getConfig();
    const now = new Date().toISOString();
    const deal = hydrateDealSnapshot(input.deal, config);
    const flagsIaAtipicas = computeComiteIaFlags(deal, config);
    const miembros = DEFAULT_COMITE_MEMBERS.map((member) => ({
      ...member,
      voto: 'Pendiente' as const,
    })) as [
      ComiteMiembroSeat,
      ComiteMiembroSeat,
      ComiteMiembroSeat,
    ];

    const auditoriaInicial = [
      `${now} Comité abierto — notificación enviada a 3 miembros`,
    ];

    if (flagsIaAtipicas.length > 0) {
      const alta = flagsIaAtipicas.filter(
        (flag) => flag.severidad === 'Alta',
      ).length;
      auditoriaInicial.push(
        `${now} IA detectó ${flagsIaAtipicas.length} condición(es) atípica(s)${alta > 0 ? ` · ${alta} de severidad alta` : ''}`,
      );
    }

    const created: ComiteAutorizacion = {
      id: `comite-${randomUUID()}`,
      referencia: comiteStore.nextReferencia(),
      opportunityId: input.opportunityId,
      opportunityName: input.opportunityName,
      hojaDeAcuerdosId: input.hojaDeAcuerdosId,
      leasingOfficerNombre: input.leasingOfficerNombre ?? 'Leasing Officer',
      cemQueFirmoNombre: input.cemQueFirmoNombre ?? 'Director Comercial',
      fechaCreacion: now,
      fechaLimiteResolucion: addHours(now, config.slaHorasHabiles),
      estatus: 'Abierto — en deliberación',
      deal,
      miembros,
      ...recountVotes(miembros),
      resolucion: 'Pendiente',
      preguntas: [],
      flagsIaAtipicas,
      auditoria: auditoriaInicial,
      createdAt: now,
      updatedAt: now,
    };

    const saved = comiteStore.upsert(created);

    for (const member of saved.miembros) {
      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: `⚖️ Nuevo comité — ${saved.deal.clienteRazonSocial}`,
        body: `${saved.deal.naveNomenclatura} · Descuento ${saved.deal.descuentoPorcentaje}% (${saved.deal.semaforoPrecio}) · Vence en ${config.slaHorasHabiles}h`,
        area: 'Comercial',
        opportunityId: saved.opportunityId,
        actionPath: `/parks/comite/${saved.id}`,
        actionLabel: 'Votar ahora',
        audienceNames: [member.nombre],
      });
    }

    return saved;
  },

  vote: async ({
    comiteId,
    memberId,
    voto,
    comentario,
    viewerEmail,
  }: {
    comiteId: string;
    memberId: string;
    voto: Exclude<ComiteVotoValor, 'Pendiente'>;
    comentario?: string;
    viewerEmail?: string;
  }): Promise<ComiteAutorizacion> => {
    const comite = comiteStore.getById(comiteId);

    if (!comite) {
      throw new Error('Comité not found');
    }

    if (comite.estatus === COMITE_ESTATUS_AJUSTES_PEDIDOS) {
      throw new Error(
        'El comité espera ajustes de comercial; no se puede votar todavía',
      );
    }

    if (comite.estatus !== 'Abierto — en deliberación') {
      const seat = comite.miembros.find(
        (member) => member.memberId === memberId,
      );

      if (!seat || seat.voto !== 'Pendiente') {
        throw new Error('Committee already resolved');
      }
    }

    const seat = comite.miembros.find(
      (member) => member.memberId === memberId,
    );

    if (!seat) {
      throw new Error('Committee member not found');
    }

    if (
      viewerEmail &&
      seat.email.toLowerCase() !== viewerEmail.trim().toLowerCase()
    ) {
      throw new Error(
        'No puedes votar con un asiento que no te corresponde',
      );
    }

    if (seat.voto !== 'Pendiente') {
      throw new Error('Vote is permanent and cannot be changed');
    }

    if (voto === 'Rechaza' && !comentario?.trim()) {
      throw new Error(
        'Debes explicar el motivo del rechazo para continuar.',
      );
    }

    const updatedMembers = comite.miembros.map((member) =>
      member.memberId === memberId
        ? {
            ...member,
            voto,
            comentario: comentario?.trim() || undefined,
            fechaVoto: new Date().toISOString(),
          }
        : member,
    ) as [ComiteMiembroSeat, ComiteMiembroSeat, ComiteMiembroSeat];

    const withVote: ComiteAutorizacion = {
      ...comite,
      miembros: updatedMembers,
      ...recountVotes(updatedMembers),
      auditoria: appendAudit(
        comite,
        `${seat.nombre} votó: ${voto}${comentario?.trim() ? ` — "${comentario.trim()}"` : ''}`,
      ),
    };

    if (comite.estatus !== 'Abierto — en deliberación') {
      return comiteStore.upsert(withVote);
    }

    return evaluateResultado(withVote);
  },

  askQuestion: ({
    comiteId,
    memberId,
    preguntaTexto,
  }: {
    comiteId: string;
    memberId: string;
    preguntaTexto: string;
  }): ComiteAutorizacion => {
    const comite = comiteStore.getById(comiteId);

    if (!comite) {
      throw new Error('Comité not found');
    }

    const member = comite.miembros.find(
      (seat) => seat.memberId === memberId,
    );

    if (!member) {
      throw new Error('Committee member not found');
    }

    if (!preguntaTexto.trim()) {
      throw new Error('preguntaTexto is required');
    }

    const pregunta: ComitePregunta = {
      id: `preg-${randomUUID()}`,
      preguntaPorMemberId: member.memberId,
      preguntaPorNombre: member.nombre,
      fechaPregunta: new Date().toISOString(),
      preguntaTexto: preguntaTexto.trim(),
      resuelta: false,
    };

    const saved = comiteStore.upsert({
      ...comite,
      preguntas: [...comite.preguntas, pregunta],
      auditoria: appendAudit(
        comite,
        `${member.nombre} preguntó: "${pregunta.preguntaTexto}"`,
      ),
    });

    brokerNotificationStore.add({
      type: 'task',
      priority: 'normal',
      title: `💬 El comité tiene una pregunta — ${saved.deal.clienteRazonSocial}`,
      body: `${member.nombre}: ${pregunta.preguntaTexto}`,
      area: 'Comercial',
      opportunityId: saved.opportunityId,
      actionPath: `/parks/comite/${saved.id}`,
      actionLabel: 'Responder',
      audienceNames: [saved.leasingOfficerNombre, saved.cemQueFirmoNombre],
    });

    return saved;
  },

  answerQuestion: ({
    comiteId,
    preguntaId,
    respuestaTexto,
    respuestaPorNombre,
  }: {
    comiteId: string;
    preguntaId: string;
    respuestaTexto: string;
    respuestaPorNombre: string;
  }): ComiteAutorizacion => {
    const comite = comiteStore.getById(comiteId);

    if (!comite) {
      throw new Error('Comité not found');
    }

    if (!respuestaTexto.trim()) {
      throw new Error('respuestaTexto is required');
    }

    const preguntas = comite.preguntas.map((pregunta) =>
      pregunta.id === preguntaId
        ? {
            ...pregunta,
            respuestaTexto: respuestaTexto.trim(),
            respuestaPorNombre,
            fechaRespuesta: new Date().toISOString(),
            resuelta: true,
          }
        : pregunta,
    );

    return comiteStore.upsert({
      ...comite,
      preguntas,
      auditoria: appendAudit(
        comite,
        `${respuestaPorNombre} respondió pregunta ${preguntaId}`,
      ),
    });
  },

  requestSessionAdjustments: ({
    comiteId,
    texto,
    viewerNombre,
  }: {
    comiteId: string;
    texto: string;
    viewerNombre?: string;
  }): ComiteAutorizacion => {
    const comite = comiteStore.getById(comiteId);

    if (!comite) {
      throw new Error('Comité not found');
    }

    if (comite.estatus.startsWith('Resuelto')) {
      throw new Error('Este deal ya no está en sesión de comité');
    }

    const nota = texto.trim();

    if (!nota) {
      throw new Error('Describe el ajuste que pide la sesión');
    }

    const registradoPor = viewerNombre?.trim() || 'Sesión de comité';
    const fecha = new Date().toISOString();
    const saved = comiteStore.upsert({
      ...comite,
      estatus: COMITE_ESTATUS_AJUSTES_PEDIDOS,
      ajustesSesion: [
        ...(comite.ajustesSesion ?? []),
        { texto: nota, fecha, registradoPor },
      ],
      auditoria: appendAudit(
        comite,
        `Sesión en vivo — ajuste pedido por ${registradoPor}: "${nota}"`,
      ),
    });

    brokerNotificationStore.add({
      type: 'alert',
      priority: 'high',
      title: `↩️ Comité pidió ajustes — ${saved.deal.clienteRazonSocial}`,
      body: nota,
      area: 'Comercial',
      opportunityId: saved.opportunityId,
      actionPath: saved.opportunityId
        ? buildPipelineDealActionPath(saved.opportunityId, { tab: 'hoja' })
        : `/parks/comite/${saved.id}`,
      actionLabel: 'Ajustar Hoja',
      audienceRoleLabels: [...PARKS_NOTIFICATION_COMMERCIAL_ROLES],
      audienceNames: [
        saved.leasingOfficerNombre,
        saved.cemQueFirmoNombre,
      ].filter(Boolean),
    });

    return saved;
  },

  // Live session (or leftover empate): CEO records the room decision.
  ceoDecision: async ({
    comiteId,
    decision,
    comentario,
    viewerEmail,
    viewerNombre,
  }: {
    comiteId: string;
    decision: 'Aprueba' | 'Rechaza';
    comentario?: string;
    viewerEmail?: string;
    viewerNombre?: string;
  }): Promise<ComiteAutorizacion> => {
    const comite = comiteStore.getById(comiteId);

    if (!comite) {
      throw new Error('Comité not found');
    }

    const isStillOnAgenda = isComiteStillOnAgenda(comite);

    if (!isStillOnAgenda || comite.estatus.startsWith('Resuelto')) {
      throw new Error('Este deal ya no está en sesión de comité');
    }

    const ceoNombre = viewerNombre?.trim() || 'CEO / Director General';
    const nota = comentario?.trim();

    if (decision === 'Rechaza' && !nota) {
      throw new Error(
        'Debes explicar el motivo del rechazo ejecutivo para continuar.',
      );
    }

    if (decision === 'Aprueba') {
      let next: ComiteAutorizacion = {
        ...comite,
        resolucion: 'Aprobado — decisión CEO',
        fechaResolucion: new Date().toISOString(),
        estatus: 'Resuelto — Aprobado',
        auditoria: appendAudit(
          comite,
          `${ceoNombre}${viewerEmail ? ` <${viewerEmail}>` : ''} — sesión en vivo: Aprueba${nota ? ` — "${nota}"` : ''}`,
        ),
      };

      next = await activarFlujoLegal(next);
      return comiteStore.upsert(next);
    }

    let next: ComiteAutorizacion = {
      ...comite,
      resolucion: 'Rechazado — decisión CEO',
      fechaResolucion: new Date().toISOString(),
      estatus: 'Resuelto — Rechazado',
      resumenRazonesRechazo: `${ceoNombre} (sesión de comité):\n"${nota}"`,
      auditoria: appendAudit(
        comite,
        `${ceoNombre}${viewerEmail ? ` <${viewerEmail}>` : ''} — sesión en vivo: Rechaza — "${nota}"`,
      ),
    };

    next = await activarFlujoRechazo(next);
    return comiteStore.upsert(next);
  },

  resubmitAfterAdjustments: ({
    comiteId,
    hojaDeAcuerdosId,
  }: {
    comiteId?: string;
    hojaDeAcuerdosId?: string;
  }): ComiteAutorizacion => {
    const comite = comiteId
      ? comiteStore.getById(comiteId)
      : hojaDeAcuerdosId
        ? comiteStore.getByHojaId(hojaDeAcuerdosId)
        : undefined;

    if (!comite) {
      throw new Error('Comité not found');
    }

    if (comite.estatus !== COMITE_ESTATUS_AJUSTES_PEDIDOS) {
      return comite;
    }

    const saved = comiteStore.upsert({
      ...comite,
      estatus: 'Abierto — en deliberación',
      auditoria: appendAudit(
        comite,
        'Comercial reenvió términos ajustados — vuelve a sesión',
      ),
    });

    brokerNotificationStore.add({
      type: 'alert',
      priority: 'high',
      title: `⚖️ Términos ajustados — ${saved.deal.clienteRazonSocial}`,
      body: 'Comercial actualizó la Hoja. El deal vuelve a la mesa de comité.',
      area: 'Comercial',
      opportunityId: saved.opportunityId,
      actionPath: `/parks/comite/${saved.id}`,
      actionLabel: 'Ver sesión',
      audienceRoleLabels: [...PARKS_NOTIFICATION_CEO_ROLES],
    });

    return saved;
  },

  syncOpenComiteFromHoja: (
    hoja: {
      id: string;
      m2Acordados?: number | null;
      precioUsdM2?: number | null;
      plazoMeses?: number | null;
      periodoGraciaMeses?: number | null;
      depositoMeses?: number | null;
      condicionesEspeciales?: string | null;
      nave?: { identificador?: string | null } | null;
    },
  ): ComiteAutorizacion | undefined => {
    const comite = comiteStore.getByHojaId(hoja.id);

    if (!comite || !isComiteStillOnAgenda(comite)) {
      return undefined;
    }

    const deal = hydrateDealSnapshot({
      ...comite.deal,
      glaM2: hoja.m2Acordados ?? comite.deal.glaM2,
      precioAcordadoM2: hoja.precioUsdM2 ?? comite.deal.precioAcordadoM2,
      plazoMeses: hoja.plazoMeses ?? comite.deal.plazoMeses,
      periodoGraciaMeses:
        hoja.periodoGraciaMeses ?? comite.deal.periodoGraciaMeses,
      depositosGarantiaMeses:
        hoja.depositoMeses ?? comite.deal.depositosGarantiaMeses,
      condicionesEspeciales:
        hoja.condicionesEspeciales ?? comite.deal.condicionesEspeciales,
      naveNomenclatura:
        hoja.nave?.identificador ?? comite.deal.naveNomenclatura,
    });
    const wasWaitingAdjustments =
      comite.estatus === COMITE_ESTATUS_AJUSTES_PEDIDOS;

    const saved = comiteStore.upsert({
      ...comite,
      deal,
      estatus: wasWaitingAdjustments
        ? 'Abierto — en deliberación'
        : comite.estatus,
      auditoria: wasWaitingAdjustments
        ? appendAudit(
            comite,
            'Comercial reenvió términos ajustados — vuelve a sesión',
          )
        : comite.auditoria,
    });

    if (wasWaitingAdjustments) {
      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: `⚖️ Términos ajustados — ${saved.deal.clienteRazonSocial}`,
        body: 'Comercial actualizó la Hoja. El deal vuelve a la mesa de comité.',
        area: 'Comercial',
        opportunityId: saved.opportunityId,
        actionPath: `/parks/comite/${saved.id}`,
        actionLabel: 'Ver sesión',
        audienceRoleLabels: [...PARKS_NOTIFICATION_CEO_ROLES],
      });
    }

    return saved;
  },

  getByOpportunityId: (
    opportunityId: string,
  ): ComiteAutorizacion | undefined =>
    comiteStore.getByOpportunityId(opportunityId),

  cancelForLostOpportunity: (opportunityId: string): void => {
    const comite = comiteStore.getByOpportunityId(opportunityId);

    if (!comite || !isComiteStillOnAgenda(comite)) {
      return;
    }

    comiteStore.upsert({
      ...comite,
      estatus: 'Cancelado — oportunidad perdida',
      resolucion: 'Vencido sin resolución',
      fechaResolucion: new Date().toISOString(),
      auditoria: appendAudit(
        comite,
        'Cancelado — oportunidad marcada como perdida',
      ),
    });
  },
};
