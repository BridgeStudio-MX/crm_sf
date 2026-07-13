import fs from 'fs';
import path from 'path';

import Handlebars from 'handlebars';

import { brokerNotificationStore } from './broker-notification.store';
import { twentyDataService } from './twenty-data.service';
import {
  type ComposerGenerateInput,
  type ComposerGenerateResult,
} from '../types/commercial.types';

const OUTPUT_DIR = path.join(process.cwd(), 'output/composer');

const resolveTemplatesDirectory = (): string => {
  const fromSource = path.join(process.cwd(), 'src/templates');
  const fromDist = path.join(__dirname, '../templates');

  if (fs.existsSync(fromSource)) {
    return fromSource;
  }

  return fromDist;
};

const ensureOutputDirectory = (): void => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
};

const renderTemplate = (
  templateName: string,
  context: Record<string, unknown>,
): string => {
  const templatePath = path.join(resolveTemplatesDirectory(), templateName);
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);

  return template(context);
};

const buildBrochureContext = ({
  naveIdentificador,
  parqueNombre,
  ubicacion,
  m2,
  precioUsdM2,
  companyName,
  description,
}: ComposerGenerateInput): Record<string, unknown> => ({
  companyName: companyName ?? 'Parks Industrial',
  naveIdentificador,
  parqueNombre: parqueNombre ?? 'Parks Industrial',
  ubicacion: ubicacion ?? 'México',
  m2: (m2 ?? 0).toLocaleString('es-MX'),
  precioUsdM2: (precioUsdM2 ?? 0.95).toFixed(2),
  rentaMensualEstimada: (
    (precioUsdM2 ?? 0.95) * (m2 ?? 0)
  ).toLocaleString('es-MX', { minimumFractionDigits: 0 }),
  description:
    description ??
    'Nave industrial de última generación con andenes de carga, altura libre competitiva y ubicación estratégica para operaciones logísticas y de manufactura.',
  generationDate: new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
});

const buildListingReportContext = ({
  naveIdentificador,
  parqueNombre,
  ubicacion,
  m2,
  companyName,
  opportunityName,
  inquiriesCount = 4,
  toursCount = 2,
  proposalsCount = 1,
}: ComposerGenerateInput): Record<string, unknown> => ({
  ownerName: companyName ?? 'Propietario',
  naveIdentificador,
  parqueNombre: parqueNombre ?? 'Parks Industrial',
  ubicacion: ubicacion ?? 'México',
  m2: (m2 ?? 0).toLocaleString('es-MX'),
  opportunityName: opportunityName ?? naveIdentificador,
  periodLabel: new Date().toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  }),
  inquiriesCount,
  toursCount,
  proposalsCount,
  activities: [
    'Publicación en portafolio digital Parks',
    'Envío de brochure a base de prospectos calificados',
    '2 tours en sitio con decisores de operaciones',
    '1 propuesta formal con ficha técnica compartida',
  ],
  generationDate: new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
});

export const composerService = {
  generate: async (
    input: ComposerGenerateInput,
  ): Promise<ComposerGenerateResult> => {
    if (!input.naveIdentificador) {
      throw new Error('naveIdentificador is required');
    }

    ensureOutputDirectory();

    const templateName =
      input.templateType === 'listing-report'
        ? 'listing-activity-report.hbs'
        : 'brochure-propiedad.hbs';

    const context =
      input.templateType === 'listing-report'
        ? buildListingReportContext(input)
        : buildBrochureContext(input);

    const html = renderTemplate(templateName, context);
    const fileSlug = input.naveIdentificador.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${input.templateType}-${fileSlug}-${Date.now()}.html`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    fs.writeFileSync(filePath, html, 'utf-8');

    brokerNotificationStore.add({
      type: 'system',
      priority: 'normal',
      title:
        input.templateType === 'listing-report'
          ? `Reporte de listing — ${input.naveIdentificador}`
          : `Brochure generado — ${input.naveIdentificador}`,
      body: `Material listo para compartir con ${input.companyName ?? 'cliente/propietario'}.`,
      area: 'Comercial',
      opportunityId: input.opportunityId,
      opportunityName: input.opportunityName,
    });

    if (input.opportunityId) {
      await twentyDataService.createNote(
        `[Composer] ${input.templateType} — ${input.naveIdentificador}`,
        `Material generado para ${input.companyName ?? 'prospecto'}. Archivo: ${fileName}`,
      );
    }

    return {
      templateType: input.templateType,
      html,
      fileName,
      filePath,
      generatedAt: new Date().toISOString(),
    };
  },
};
