import fs from 'fs';
import path from 'path';

import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';

import {
  type PdfContext,
  TEMPLATE_BY_DOCUMENT_TYPE,
} from '../types/pdf.types';
import { toSelectValue } from '../utils/select-value.util';
import { twentyDataService } from './twenty-data.service';

const OUTPUT_DIR = path.join(process.cwd(), 'output/pdfs');

const SYSTEM_CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

const resolveBrowserLaunchOptions = (): {
  headless: boolean;
  args: string[];
  executablePath?: string;
} => {
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };

  for (const chromePath of SYSTEM_CHROME_PATHS) {
    if (fs.existsSync(chromePath)) {
      return { ...launchOptions, executablePath: chromePath };
    }
  }

  return launchOptions;
};

const resolveTemplatesDirectory = (): string => {
  const fromSource = path.join(process.cwd(), 'src/templates');
  const fromDist = path.join(__dirname, '../templates');

  if (fs.existsSync(fromSource)) {
    return fromSource;
  }

  return fromDist;
};

const registerHandlebarsHelpers = (): void => {
  Handlebars.registerHelper('rentaMensualTotal', (hojaAcuerdos: unknown) => {
    if (
      typeof hojaAcuerdos !== 'object' ||
      hojaAcuerdos === null ||
      !('precioUsdM2' in hojaAcuerdos) ||
      !('m2Acordados' in hojaAcuerdos)
    ) {
      return '0.00';
    }

    const record = hojaAcuerdos as {
      precioUsdM2: number;
      m2Acordados: number;
    };

    return (record.precioUsdM2 * record.m2Acordados).toFixed(2);
  });
};

const resolveTemplateFileName = (tipoDocumento: string): string => {
  const directMatch = TEMPLATE_BY_DOCUMENT_TYPE[tipoDocumento];

  if (directMatch) {
    return directMatch;
  }

  const selectValueMatch = Object.entries(TEMPLATE_BY_DOCUMENT_TYPE).find(
    ([documentTypeLabel]) => toSelectValue(documentTypeLabel) === tipoDocumento,
  );

  if (selectValueMatch) {
    return selectValueMatch[1];
  }

  throw new Error(`No PDF template for document type: ${tipoDocumento}`);
};

const renderHtmlFromTemplate = (
  templateFileName: string,
  context: PdfContext,
): string => {
  registerHandlebarsHelpers();

  const templatePath = path.join(resolveTemplatesDirectory(), templateFileName);
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);

  return template(context);
};

const ensureOutputDirectory = (): void => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
};

const formatGenerationDate = (): string =>
  new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const pdfService = {
  buildPDFContext: async (
    casoLegalId: string,
    numeroVersion = 1,
  ): Promise<PdfContext | null> => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    if (!casoLegal?.tipoDocumento) {
      console.warn(
        `[pdf.service] Cannot build PDF context — missing caso ${casoLegalId}`,
      );
      return null;
    }

    let hojaDeAcuerdos = casoLegal.hojaDeAcuerdos;
    const inquilino = casoLegal.inquilino;
    let nave = casoLegal.nave;

    // Twenty omits some nested relations on casoLegal — hydrate via direct queries
    if (hojaDeAcuerdos?.id && !hojaDeAcuerdos.broker) {
      const hojaFull = await twentyDataService.getHojaDeAcuerdosById(
        hojaDeAcuerdos.id,
      );

      if (hojaFull) {
        hojaDeAcuerdos = { ...hojaDeAcuerdos, ...hojaFull };
      }
    }

    if (nave?.id && !nave.parque) {
      const naveFull = await twentyDataService.getNaveById(nave.id);

      if (naveFull) {
        nave = naveFull;
      }
    }

    const parque = nave?.parque;

    if (!hojaDeAcuerdos || !inquilino || !nave || !parque) {
      console.warn(
        `[pdf.service] Incomplete relations for caso ${casoLegalId}`,
      );
      return null;
    }

    return {
      casoLegal: {
        id: casoLegal.id,
        referencia: casoLegal.referencia,
        tipoDocumento: casoLegal.tipoDocumento,
      },
      hojaAcuerdos: {
        m2Acordados: hojaDeAcuerdos.m2Acordados,
        precioUsdM2: hojaDeAcuerdos.precioUsdM2,
        plazoMeses: hojaDeAcuerdos.plazoMeses,
        fechaInicio: hojaDeAcuerdos.fechaInicio,
        fechaFirma: hojaDeAcuerdos.fechaFirma,
      },
      inquilino: {
        empresa: inquilino.empresa ?? 'Inquilino',
        repLegalNombre: inquilino.repLegalNombre,
        rfc: inquilino.rfc,
      },
      nave: {
        identificador: nave.identificador ?? 'N/A',
        m2: hojaDeAcuerdos.m2Acordados,
      },
      parque: {
        nombre: parque.nombre ?? 'Parque Industrial',
        ubicacion: parque.ubicacion ?? '',
      },
      broker: hojaDeAcuerdos.broker
        ? {
            empresa: hojaDeAcuerdos.broker.empresa ?? 'Broker',
            contacto: hojaDeAcuerdos.broker.contacto,
          }
        : undefined,
      fechaGeneracion: formatGenerationDate(),
      numeroVersion,
    };
  },

  generateForCasoLegal: async (
    casoLegalId: string,
    numeroVersion = 1,
  ): Promise<string | null> => {
    const context = await pdfService.buildPDFContext(casoLegalId, numeroVersion);

    if (!context) {
      return null;
    }

    const outputPath = await pdfService.generateContractPdf(context);

    await twentyDataService.updateCasoLegal(casoLegalId, {
      pdfBorradorUrl: outputPath,
    });

    return outputPath;
  },

  generarPDFContrato: async (
    context: PdfContext,
    casoLegalId?: string,
  ): Promise<string> => {
    const outputPath = await pdfService.generateContractPdf(context);

    if (casoLegalId) {
      await twentyDataService.updateCasoLegal(casoLegalId, {
        pdfBorradorUrl: outputPath,
      });
    }

    return outputPath;
  },

  resolveTemplateForDocumentType: (tipoDocumento: string): string =>
    resolveTemplateFileName(tipoDocumento),

  renderHtml: (context: PdfContext): string => {
    const templateFileName = resolveTemplateFileName(
      context.casoLegal.tipoDocumento,
    );

    return renderHtmlFromTemplate(templateFileName, context);
  },

  generateContractPdf: async (context: PdfContext): Promise<string> => {
    const html = pdfService.renderHtml(context);
    ensureOutputDirectory();

    const fileName = `${context.casoLegal.id}_v${context.numeroVersion}_${Date.now()}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    const browser = await puppeteer.launch(resolveBrowserLaunchOptions());

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });

      await page.pdf({
        path: outputPath,
        format: 'Letter',
        margin: {
          top: '2cm',
          bottom: '2cm',
          left: '2.5cm',
          right: '2cm',
        },
        printBackground: true,
      });
    } finally {
      await browser.close();
    }

    console.log(`[pdf.service] Generated: ${outputPath}`);

    return outputPath;
  },

  generateContrato: async (
    templateName: string,
    context: Record<string, unknown>,
  ): Promise<Buffer> => {
    registerHandlebarsHelpers();

    const templatePath = path.join(resolveTemplatesDirectory(), templateName);
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);
    const html = template(context);

    return pdfService.generateContratoFromHtml(html);
  },

  generateContratoFromHtml: async (html: string): Promise<Buffer> => {
    const browser = await puppeteer.launch(resolveBrowserLaunchOptions());

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '2cm',
          bottom: '2cm',
          left: '2.5cm',
          right: '2cm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  },
};
