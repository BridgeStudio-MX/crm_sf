export type PdfBrokerContext = {
  empresa: string;
  contacto?: string;
};

export type PdfParqueContext = {
  nombre: string;
  ubicacion: string;
};

export type PdfNaveContext = {
  identificador: string;
  m2?: number;
};

export type PdfInquilinoContext = {
  empresa: string;
  repLegalNombre?: string;
  rfc?: string;
};

export type PdfHojaAcuerdosContext = {
  m2Acordados: number;
  precioUsdM2: number;
  plazoMeses: number;
  fechaInicio?: string;
  fechaFirma?: string;
  periodoGraciaMeses?: number;
  depositoMeses?: number;
  escalacionAnualPct?: number;
  condicionesEspeciales?: string;
};

export type PdfCasoLegalContext = {
  id: string;
  referencia?: string;
  tipoDocumento: string;
};

export type PdfContext = {
  casoLegal: PdfCasoLegalContext;
  hojaAcuerdos: PdfHojaAcuerdosContext;
  inquilino: PdfInquilinoContext;
  nave: PdfNaveContext;
  parque: PdfParqueContext;
  broker?: PdfBrokerContext;
  fechaGeneracion: string;
  numeroVersion: number;
};

export const TEMPLATE_BY_DOCUMENT_TYPE: Record<string, string> = {
  'Contrato nuevo': 'contrato-arrendamiento.hbs',
  'Convenio renovación': 'convenio-renovacion.hbs',
  'Convenio aclaración': 'convenio-aclaracion.hbs',
  'Terminación anticipada': 'terminacion-anticipada.hbs',
  'Build-to-suit': 'build-to-suit.hbs',
};
