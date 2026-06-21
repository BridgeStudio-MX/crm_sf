import { pdfService } from '../src/services/pdf.service';
import { type PdfContext } from '../src/types/pdf.types';

const demoContext: PdfContext = {
  casoLegal: {
    id: 'caso-legal-demo-001',
    referencia: 'LogiMex — Contrato nuevo',
    tipoDocumento: 'Contrato nuevo',
  },
  hojaAcuerdos: {
    m2Acordados: 4500,
    precioUsdM2: 0.85,
    plazoMeses: 60,
    fechaInicio: '2026-08-01',
    periodoGraciaMeses: 2,
    depositoMeses: 1,
    escalacionAnualPct: 3,
    condicionesEspeciales:
      'Incluye área de andenes adicional y oficinas administrativas.',
  },
  inquilino: {
    empresa: 'LogiMex S.A. de C.V.',
    repLegalNombre: 'Lic. María González',
    rfc: 'LOG850101ABC',
  },
  nave: {
    identificador: 'NVA-GDL-001',
    m2: 4500,
  },
  parque: {
    nombre: 'Parque Industrial Guadalajara Norte',
    ubicacion: 'El Salto, Jalisco',
  },
  broker: {
    empresa: 'Newmark',
    contacto: 'Carlos Mendoza',
  },
  fechaGeneracion: new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  numeroVersion: 1,
};

const main = async (): Promise<void> => {
  console.log('[pdf:test] Generating demo PDF (Contrato nuevo)...');

  const outputPath = await pdfService.generateContractPdf(demoContext);

  console.log('[pdf:test] PDF written to:', outputPath);
  console.log('[pdf:test] Templates available:', [
    'contrato-arrendamiento.hbs',
    'convenio-renovacion.hbs',
    'convenio-aclaracion.hbs',
    'terminacion-anticipada.hbs',
    'build-to-suit.hbs',
  ]);
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('[pdf:test] Failed:', message);
  process.exit(1);
});
