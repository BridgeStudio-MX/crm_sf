import fs from 'fs';
import path from 'path';

import Handlebars from 'handlebars';

import {
  resolveParksNavePropertyImageUrl,
  resolveParksParqueEntranceImageUrl,
} from '../seed/parks-demo-image.constants';
import {
  type FichaTecnicaLink,
  type FichaTecnicaSentVia,
} from '../types/ficha-tecnica.types';
import { buildFichaTecnicaDetalle } from '../utils/ficha-tecnica-detalle.util';
import { brokerNotificationStore } from './broker-notification.store';
import { fichaLinkStore } from './ficha-link.store';
import { pdfService } from './pdf.service';
import { twentyDataService } from './twenty-data.service';

const OUTPUT_DIR = path.join(process.cwd(), 'output/fichas');
const PARKS_LOGO_COLOR_PATH = '/images/parks-industrial/parks-logo-color.png';

const resolveTemplatesDirectory = (): string => {
  const fromSource = path.join(process.cwd(), 'src/templates');
  const fromDist = path.join(__dirname, '../templates');

  if (fs.existsSync(fromSource)) {
    return fromSource;
  }

  return fromDist;
};

const getFrontBaseUrl = (): string =>
  process.env.PARKS_FRONT_BASE_URL ?? 'http://localhost:3001';

const toPublicImageUrl = (imageUrl: string): string => {
  const trimmedUrl = imageUrl.trim();

  if (
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://')
  ) {
    return trimmedUrl;
  }

  const frontBaseUrl = getFrontBaseUrl().replace(/\/$/, '');
  const pathSegment = trimmedUrl.startsWith('/')
    ? trimmedUrl
    : `/${trimmedUrl}`;

  return `${frontBaseUrl}${pathSegment}`;
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

const hashSeed = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash + value.charCodeAt(index) * (index + 1)) % 2147483647;
  }

  return Math.abs(hash);
};

const SITE_PLAN_PADS = [
  { pinLeftPct: 20, pinTopPct: 30, manzanaLabel: 'Manzana A-1' },
  { pinLeftPct: 20, pinTopPct: 62, manzanaLabel: 'Manzana A-2' },
  { pinLeftPct: 44, pinTopPct: 30, manzanaLabel: 'Manzana B-1' },
  { pinLeftPct: 40, pinTopPct: 62, manzanaLabel: 'Manzana B-2' },
  { pinLeftPct: 52, pinTopPct: 62, manzanaLabel: 'Manzana B-3' },
  { pinLeftPct: 76, pinTopPct: 30, manzanaLabel: 'Manzana C-1' },
  { pinLeftPct: 76, pinTopPct: 62, manzanaLabel: 'Manzana C-2' },
] as const;

const buildSitePlanPin = (seed: string) => {
  const pad = SITE_PLAN_PADS[hashSeed(seed) % SITE_PLAN_PADS.length]!;

  return {
    pinLeftPct: pad.pinLeftPct,
    pinTopPct: pad.pinTopPct,
    manzanaLabel: pad.manzanaLabel,
  };
};

const formatNumber = (value: number): string =>
  value.toLocaleString('es-MX', { maximumFractionDigits: 1 });

const buildFichaContext = (link: FichaTecnicaLink): Record<string, unknown> => {
  const sitePlan = buildSitePlanPin(`${link.naveId}-${link.naveIdentificador}`);
  const detalle =
    link.detalle ??
    buildFichaTecnicaDetalle({
      naveIdentificador: link.naveIdentificador,
      parqueNombre: link.parqueNombre ?? 'Parks Industrial',
      ubicacion: link.ubicacion ?? 'México',
      m2: link.m2,
      precioUsdM2: link.precioUsdM2,
      fotoInmuebleUrl: link.fotoInmuebleUrl,
      fotoParqueUrl: link.fotoParqueUrl,
      publicUrl: link.publicUrl,
      preparedForCompany: link.opportunityName,
    });

  const rentaMensual = detalle.precioUsdM2Mes * detalle.glaM2;

  return {
    companyName: link.opportunityName,
    generationDate: new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    logoUrl: toPublicImageUrl(PARKS_LOGO_COLOR_PATH),
    pinLeftPct: sitePlan.pinLeftPct,
    pinTopPct: sitePlan.pinTopPct,
    manzanaLabel: sitePlan.manzanaLabel,
    d: {
      ...detalle,
      glaM2Label: formatNumber(detalle.glaM2),
      oficinasM2Label: formatNumber(detalle.oficinasM2),
      precioUsdM2MesLabel: detalle.precioUsdM2Mes.toFixed(2),
      rentaMensualLabel: formatNumber(rentaMensual),
      gasNaturalLabel: detalle.gasNatural ? 'Sí' : 'No',
      accesoControladoLabel: detalle.accesoControlado24h ? 'Sí' : 'No',
      cctvLabel: detalle.cctv ? 'Sí' : 'No',
      alumbradoLabel: detalle.alumbradoPerimetral ? 'Sí' : 'No',
      vialidadesLabel: detalle.vialidadesPavimentadas ? 'Sí' : 'No',
      areaCargaLabel: detalle.areaCargaExclusiva ? 'Sí' : 'No',
      distanciaPuertoLabel:
        detalle.distanciaPuertoKm == null
          ? 'N/A'
          : `${detalle.distanciaPuertoKm} km`,
      distanciaFronteraLabel:
        detalle.distanciaFronteraKm == null
          ? 'N/A'
          : `${detalle.distanciaFronteraKm} km`,
      fechaDisponibilidadLabel:
        detalle.fechaDisponibilidad ?? 'Inmediata',
    },
  };
};

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
    fotoInmuebleUrl: inputFotoInmuebleUrl,
    fotoParqueUrl: inputFotoParqueUrl,
  }: {
    opportunityId: string;
    opportunityName: string;
    naveId: string;
    naveIdentificador: string;
    parqueNombre?: string;
    ubicacion?: string;
    m2: number;
    precioUsdM2?: number;
    fotoInmuebleUrl?: string;
    fotoParqueUrl?: string;
  }): Promise<FichaTecnicaLink> => {
    const nave = await twentyDataService.getNaveById(naveId);
    const resolvedParqueNombre =
      parqueNombre ?? nave?.parque?.nombre ?? 'Parks Industrial';
    const resolvedUbicacion =
      ubicacion ?? nave?.parque?.ubicacion ?? 'México';

    const fotoInmuebleUrl = toPublicImageUrl(
      inputFotoInmuebleUrl ??
        resolveParksNavePropertyImageUrl({
          fotoInmuebleUrl: nave?.fotoInmuebleUrl,
          identificador: naveIdentificador,
          recordId: naveId,
        }),
    );

    const fotoParqueUrl = toPublicImageUrl(
      inputFotoParqueUrl ??
        resolveParksParqueEntranceImageUrl({
          fotoEntradaUrl: nave?.parque?.fotoEntradaUrl,
          nombre: resolvedParqueNombre,
          ubicacion: resolvedUbicacion,
          recordId: nave?.parque?.id ?? naveId,
        }),
    );

    const resolvedM2 = nave?.m2 ?? m2;
    const resolvedPrecio = precioUsdM2 ?? nave?.precioBaseUsd;

    const draftLink = fichaLinkStore.create({
      opportunityId,
      opportunityName,
      naveId,
      naveIdentificador,
      parqueNombre: resolvedParqueNombre,
      ubicacion: resolvedUbicacion,
      m2: resolvedM2,
      precioUsdM2: resolvedPrecio,
      fotoInmuebleUrl,
      fotoParqueUrl,
    });

    const detalle = buildFichaTecnicaDetalle({
      naveIdentificador,
      parqueNombre: resolvedParqueNombre,
      ubicacion: resolvedUbicacion,
      m2: resolvedM2,
      precioUsdM2: resolvedPrecio,
      fotoInmuebleUrl,
      fotoParqueUrl,
      publicUrl: draftLink.publicUrl,
      nave,
      preparedForCompany: opportunityName,
    });

    const link = fichaLinkStore.upsert({
      ...draftLink,
      detalle,
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
