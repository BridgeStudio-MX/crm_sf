export type FichaDisponibilidadEstatus =
  | 'Disponible inmediata'
  | 'Disponible en fecha'
  | 'En negociación'
  | 'Build-to-suit';

export type FichaTecnicaDetalle = {
  // Bloque 1 — Identificación
  parqueNombre: string;
  naveIdentificador: string;
  ciudadEstado: string;
  corredorIndustrial: string;
  distanciaAutopistaKm: number;
  distanciaAeropuertoKm: number;
  distanciaPuertoKm: number | null;
  distanciaFronteraKm: number | null;
  lat: number;
  lng: number;
  mapaUbicacionUrl: string;
  mapaEmbedUrl: string;
  mapaEnlaceUrl: string;

  // Bloque 2 — Specs
  glaM2: number;
  oficinasM2: number;
  alturaLibreM: number;
  andenes: number;
  andenesDetalle: string;
  puertasNivelPiso: number;
  cargaPisoTonM2: number;
  potenciaKva: number;
  cajonesAutos: number;
  cajonesTrailers: number;
  profundidadPatioM: number;
  iluminacion: string;
  sistemaContraIncendios: string;
  tipoPiso: string;
  skylights: string;
  gasNatural: boolean;

  // Bloque 3 — Comercial
  disponibilidadEstatus: FichaDisponibilidadEstatus;
  fechaDisponibilidad: string | null;
  tipoOperacion: string;
  precioUsdM2Mes: number;
  plazoMinimoMeses: number;
  monedaContrato: 'USD' | 'MXN';
  periodoGraciaMeses: number;

  // Bloque 4 — Parque
  accesoControlado24h: boolean;
  cctv: boolean;
  alumbradoPerimetral: boolean;
  vialidadesPavimentadas: boolean;
  areaCargaExclusiva: boolean;
  serviciosParque: string[];
  certificaciones: string[];
  serviciosOpcionales: string[];
  inquilinosReferencia: string[];

  // Bloque 5 — Visual
  fotoExteriorUrl: string;
  fotoInteriorUrl: string;
  fotoAereaUrl: string;
  planoPlantaNota: string;

  // Bloque 6 — Contacto LO
  loNombre: string;
  loTelefono: string;
  loWhatsapp: string;
  loEmail: string;
  qrCodeUrl: string;
};

export type FichaTecnicaSentVia = 'email' | 'whatsapp' | 'link' | null;

export type FichaTecnicaLink = {
  token: string;
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
  detalle?: FichaTecnicaDetalle;
  publicUrl: string;
  viewCount: number;
  lastViewedAt?: string;
  sentVia: FichaTecnicaSentVia;
  sentAt?: string;
  createdAt: string;
};
