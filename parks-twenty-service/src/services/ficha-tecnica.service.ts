import fs from 'fs';
import path from 'path';

import Handlebars from 'handlebars';

import { brokerNotificationStore } from './broker-notification.store';
import { fichaLinkStore } from './ficha-link.store';
import { pdfService } from './pdf.service';
import { type FichaTecnicaLink, type FichaTecnicaSentVia } from '../types/commercial.types';

const OUTPUT_DIR = path.join(process.cwd(), 'output/fichas');

const resolveTemplatesDirectory = (): string => {
  const fromSource = path.join(process.cwd(), 'src/templates');
  const fromDist = path.join(__dirname, '../templates');

  if (fs.existsSync(fromSource)) {
    return fromSource;
  }

  return fromDist;
};

const renderFichaHtml = (context: Record<string, unknown>): string => {
  const templatePath = path.join(
    resolveTemplatesDirectory(),
    'ficha-tecnica.hbs',
  );
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);

  return template(context);
};

const buildFichaContext = (link: FichaTecnicaLink): Record<string, unknown> => ({
  companyName: link.opportunityName,
  naveIdentificador: link.naveIdentificador,
  parqueNombre: link.parqueNombre ?? 'Parks Industrial',
  ubicacion: link.ubicacion ?? 'México',
  m2: link.m2.toLocaleString('es-MX'),
  precioUsdM2: link.precioUsdM2?.toFixed(2) ?? '0.95',
  rentaMensualEstimada: (
    (link.precioUsdM2 ?? 0.95) * link.m2
  ).toLocaleString('es-MX', { minimumFractionDigits: 0 }),
  generationDate: new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
});

export const fichaTecnicaService = {
  createLink: async ({
    opportunityId,
    opportunityName,
    naveId,
    naveIdentificador,
    parqueNombre,
    ubicacion,
    m2,
    precioUsdM2,
  }: {
    opportunityId: string;
    opportunityName: string;
    naveId: string;
    naveIdentificador: string;
    parqueNombre?: string;
    ubicacion?: string;
    m2: number;
    precioUsdM2?: number;
  }): Promise<FichaTecnicaLink> => {
    const link = fichaLinkStore.create({
      opportunityId,
      opportunityName,
      naveId,
      naveIdentificador,
      parqueNombre,
      ubicacion,
      m2,
      precioUsdM2,
    });

    brokerNotificationStore.add({
      type: 'system',
      priority: 'normal',
      title: `Ficha técnica generada — ${naveIdentificador}`,
      body: `Link listo para ${opportunityName}. Comparte la URL pública con el prospecto.`,
      area: 'Comercial',
      opportunityId,
      opportunityName,
    });

    return link;
  },

  getPublicHtml: (token: string): string | null => {
    const link = fichaLinkStore.get(token);

    if (!link) {
      return null;
    }

    return renderFichaHtml(buildFichaContext(link));
  },

  getPublicJson: (token: string): FichaTecnicaLink | null =>
    fichaLinkStore.get(token),

  recordView: (token: string): FichaTecnicaLink | null => {
    const link = fichaLinkStore.recordView(token);

    if (!link) {
      return null;
    }

    brokerNotificationStore.add({
      type: 'alert',
      priority: 'high',
      title: `${link.opportunityName} abrió la ficha técnica`,
      body: `${link.naveIdentificador} · vista #${link.viewCount} · hace un momento`,
      area: 'Broker',
      opportunityId: link.opportunityId,
      opportunityName: link.opportunityName,
    });

    return link;
  },

  markSent: (
    token: string,
    sentVia: FichaTecnicaSentVia,
  ): FichaTecnicaLink | null => {
    const link = fichaLinkStore.markSent(token, sentVia);

    if (!link || !sentVia) {
      return link;
    }

    const channelLabel =
      sentVia === 'email'
        ? 'Email'
        : sentVia === 'whatsapp'
          ? 'WhatsApp'
          : 'Link copiado';

    brokerNotificationStore.add({
      type: 'email',
      priority: 'normal',
      title: `Ficha enviada por ${channelLabel}`,
      body: `${link.naveIdentificador} → ${link.opportunityName}`,
      area: 'Comercial',
      opportunityId: link.opportunityId,
      opportunityName: link.opportunityName,
    });

    return link;
  },

  listByOpportunity: (opportunityId: string): FichaTecnicaLink[] =>
    fichaLinkStore.listByOpportunity(opportunityId),

  generatePdfBuffer: async (token: string): Promise<Buffer | null> => {
    const link = fichaLinkStore.get(token);

    if (!link) {
      return null;
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    return pdfService.generateContrato(
      'ficha-tecnica.hbs',
      buildFichaContext(link),
    );
  },
};
