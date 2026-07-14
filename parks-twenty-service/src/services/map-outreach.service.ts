import { brokerNotificationStore } from './broker-notification.store';
import { twentyDataService } from './twenty-data.service';

export type MapOutreachNaveInput = {
  naveId: string;
  naveIdentificador: string;
  parqueNombre?: string;
  ubicacion?: string;
  m2?: number;
  precioUsdM2?: number;
  availabilityLabel?: string;
};

export type MapOutreachLeadInput = {
  opportunityId: string;
  opportunityName: string;
  companyName?: string;
  ubicacionDeseada?: string;
  m2Requeridos?: number;
  contactEmail?: string;
};

export type MapOutreachDraft = {
  opportunityId: string;
  opportunityName: string;
  companyName: string;
  toEmail: string | null;
  subject: string;
  body: string;
  mailtoUrl: string;
};

export type MapOutreachResult = {
  sentCount: number;
  drafts: MapOutreachDraft[];
  message: string;
  generatedAt: string;
};

const buildCompanyName = (lead: MapOutreachLeadInput): string => {
  const fromExplicit = lead.companyName?.trim();

  if (fromExplicit) {
    return fromExplicit;
  }

  const opportunityName = lead.opportunityName.trim();
  const separatorIndex = opportunityName.indexOf('—');

  if (separatorIndex > 0) {
    return opportunityName.slice(0, separatorIndex).trim();
  }

  return opportunityName || 'Prospecto Parks';
};

const formatM2 = (value?: number): string =>
  (value ?? 0).toLocaleString('es-MX');

const formatUsd = (value?: number): string =>
  (value ?? 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });

const buildSubject = ({
  nave,
  companyName,
}: {
  nave: MapOutreachNaveInput;
  companyName: string;
}): string =>
  `Oportunidad Parks — ${nave.naveIdentificador} para ${companyName}`;

const buildBody = ({
  lead,
  nave,
  companyName,
  personalNote,
}: {
  lead: MapOutreachLeadInput;
  nave: MapOutreachNaveInput;
  companyName: string;
  personalNote?: string;
}): string => {
  const availability =
    nave.availabilityLabel?.trim() || 'Disponible / próxima a liberar';
  const m2Line = nave.m2
    ? `${formatM2(nave.m2)} m²`
    : 'superficie por confirmar';
  const priceLine = nave.precioUsdM2
    ? `${formatUsd(nave.precioUsdM2)}/m²`
    : 'precio por cotizar';
  const demandLine = lead.m2Requeridos
    ? `Vi que buscan cerca de ${formatM2(lead.m2Requeridos)} m²`
    : 'Vi su interés en espacio industrial';
  const regionLine = lead.ubicacionDeseada
    ? ` en ${lead.ubicacionDeseada}`
    : '';

  const noteBlock = personalNote?.trim()
    ? `\n${personalNote.trim()}\n`
    : '';

  return [
    `Hola equipo ${companyName},`,
    '',
    `${demandLine}${regionLine}. Quiero compartirles una nave que encaja bien:`,
    '',
    `• Nave: ${nave.naveIdentificador}`,
    `• Parque: ${nave.parqueNombre ?? 'Parks Industrial'}`,
    `• Ubicación: ${nave.ubicacion ?? 'México'}`,
    `• Superficie: ${m2Line}`,
    `• Precio referencia: ${priceLine}`,
    `• Estatus: ${availability}`,
    noteBlock,
    'Si les interesa, agendo un tour o les mando la ficha técnica completa.',
    '',
    'Saludos,',
    'Leasing Officer — Parks Industrial',
  ]
    .filter((line) => line !== undefined)
    .join('\n');
};

const buildMailtoUrl = ({
  toEmail,
  subject,
  body,
}: {
  toEmail: string | null;
  subject: string;
  body: string;
}): string => {
  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${toEmail ?? ''}?${params.toString()}`;
};

export const mapOutreachService = {
  send: async ({
    leads,
    nave,
    personalNote,
    senderName,
  }: {
    leads: MapOutreachLeadInput[];
    nave: MapOutreachNaveInput;
    personalNote?: string;
    senderName?: string;
  }): Promise<MapOutreachResult> => {
    if (leads.length === 0) {
      throw new Error('At least one lead is required');
    }

    if (!nave.naveId || !nave.naveIdentificador) {
      throw new Error('naveId and naveIdentificador are required');
    }

    const drafts: MapOutreachDraft[] = [];

    for (const lead of leads) {
      const companyName = buildCompanyName(lead);
      const subject = buildSubject({ nave, companyName });
      const body = buildBody({
        lead,
        nave,
        companyName,
        personalNote,
      });
      const toEmail = lead.contactEmail?.trim() || null;
      const mailtoUrl = buildMailtoUrl({ toEmail, subject, body });

      drafts.push({
        opportunityId: lead.opportunityId,
        opportunityName: lead.opportunityName,
        companyName,
        toEmail,
        subject,
        body,
        mailtoUrl,
      });

      await twentyDataService.createNote(
        `[Mapa] Outreach — ${nave.naveIdentificador}`,
        [
          `Oferta enviada desde Mapa de Inventario.`,
          `Lead: ${lead.opportunityName}`,
          `Nave: ${nave.naveIdentificador} (${nave.parqueNombre ?? 'Parks'})`,
          `Estatus nave: ${nave.availabilityLabel ?? 'N/D'}`,
          senderName ? `LO: ${senderName}` : null,
          '',
          subject,
          '',
          body,
        ]
          .filter((line) => line !== null)
          .join('\n'),
      );

      await twentyDataService.createTask(
        `[Comercial] Follow-up oferta ${nave.naveIdentificador}`,
        `Dar seguimiento al email de oferta de ${nave.naveIdentificador} para ${companyName}. Opportunity: ${lead.opportunityId}`,
      );

      brokerNotificationStore.add({
        type: 'email',
        priority: 'normal',
        title: `Oferta enviada — ${nave.naveIdentificador}`,
        body: `${companyName} · ${nave.parqueNombre ?? 'Parks'} · ${nave.availabilityLabel ?? 'Disponible'}`,
        area: 'Comercial',
        opportunityId: lead.opportunityId,
        opportunityName: lead.opportunityName,
      });
    }

    return {
      sentCount: drafts.length,
      drafts,
      message: `Se prepararon ${drafts.length} emails de oferta para ${nave.naveIdentificador}.`,
      generatedAt: new Date().toISOString(),
    };
  },
};
