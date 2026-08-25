export const PARKS_DEMO_LOGIN_DOMAIN = 'prk.com.mx';
export const PARKS_DEMO_USER_PASSWORD = 'parksindustrial2026!';

export const PARKS_DEMO_EMAIL = {
  ceo: `ceo@${PARKS_DEMO_LOGIN_DOMAIN}`,
  directorComercial: `directorcomercial@${PARKS_DEMO_LOGIN_DOMAIN}`,
  loAaaIsrael: `leasingofficeraaa@${PARKS_DEMO_LOGIN_DOMAIN}`,
  loAaaUae: `leasingofficeraaa2@${PARKS_DEMO_LOGIN_DOMAIN}`,
  loEstandar: `leasingofficer@${PARKS_DEMO_LOGIN_DOMAIN}`,
  ejecutivoComercial: `ejecutivocomercial@${PARKS_DEMO_LOGIN_DOMAIN}`,
  adminLegal: `adminlegal@${PARKS_DEMO_LOGIN_DOMAIN}`,
  directorLegal: `directorlegal@${PARKS_DEMO_LOGIN_DOMAIN}`,
  subdirectorLegal: `subdirectorlegal@${PARKS_DEMO_LOGIN_DOMAIN}`,
  abogadoAsignado: `abogado@${PARKS_DEMO_LOGIN_DOMAIN}`,
  cfo: `cfo@${PARKS_DEMO_LOGIN_DOMAIN}`,
  directorOperaciones: `directoroperaciones@${PARKS_DEMO_LOGIN_DOMAIN}`,
  gerenteCxc: `gerentecxc@${PARKS_DEMO_LOGIN_DOMAIN}`,
  ejecutivoCxc1: `ejecutivocxc@${PARKS_DEMO_LOGIN_DOMAIN}`,
  ejecutivoCxc2: `ejecutivocxc2@${PARKS_DEMO_LOGIN_DOMAIN}`,
  ejecutivoCxc3: `ejecutivocxc3@${PARKS_DEMO_LOGIN_DOMAIN}`,
  contratosFacturacion: `contratos@${PARKS_DEMO_LOGIN_DOMAIN}`,
  adminSistema: `adminsistema@${PARKS_DEMO_LOGIN_DOMAIN}`,
  adminParque: `adminparque@${PARKS_DEMO_LOGIN_DOMAIN}`,
  marketing: `marketing@${PARKS_DEMO_LOGIN_DOMAIN}`,
} as const;

export const PARKS_DEMO_EMAIL_ALIASES: Record<string, string> = {
  'jony.ive@apple.dev': PARKS_DEMO_EMAIL.ceo,
  'charles.elmann@parksindustrial.com': PARKS_DEMO_EMAIL.ceo,
  'phil.schiler@apple.dev': PARKS_DEMO_EMAIL.directorComercial,
  'hector.montelongo@parksindustrial.com': PARKS_DEMO_EMAIL.directorComercial,
  'israel.ramirez@parksindustrial.com': PARKS_DEMO_EMAIL.loAaaIsrael,
  'uae@parksindustrial.com': PARKS_DEMO_EMAIL.loAaaUae,
  'bruyel@parksindustrial.com': PARKS_DEMO_EMAIL.loEstandar,
  'jane.austen@apple.dev': PARKS_DEMO_EMAIL.adminLegal,
  'catalina.moreno@parksindustrial.com': PARKS_DEMO_EMAIL.adminLegal,
  'roberto.salinas@apple.dev': PARKS_DEMO_EMAIL.directorLegal,
  'roberto.salinas@parksindustrial.com': PARKS_DEMO_EMAIL.directorLegal,
  'patricia.nunez@apple.dev': PARKS_DEMO_EMAIL.subdirectorLegal,
  'patricia.nunez@parksindustrial.com': PARKS_DEMO_EMAIL.subdirectorLegal,
  'miguel.soto@apple.dev': PARKS_DEMO_EMAIL.abogadoAsignado,
  'miguel.soto@parksindustrial.com': PARKS_DEMO_EMAIL.abogadoAsignado,
  'laura.fernandez@parksindustrial.com': PARKS_DEMO_EMAIL.cfo,
  'director.financiero@parksindustrial.com': PARKS_DEMO_EMAIL.cfo,
  'ricardo.campos@parksindustrial.com': PARKS_DEMO_EMAIL.directorOperaciones,
  'director.operaciones@parksindustrial.com':
    PARKS_DEMO_EMAIL.directorOperaciones,
  'scott.forstall@apple.dev': PARKS_DEMO_EMAIL.gerenteCxc,
  'claudia.rodriguez@parksindustrial.com': PARKS_DEMO_EMAIL.gerenteCxc,
  'ejecutivo.cxc1@parksindustrial.com': PARKS_DEMO_EMAIL.ejecutivoCxc1,
  'ejecutivo.cxc2@parksindustrial.com': PARKS_DEMO_EMAIL.ejecutivoCxc2,
  'ejecutivo.cxc3@parksindustrial.com': PARKS_DEMO_EMAIL.ejecutivoCxc3,
  'jesus.gazon@parksindustrial.com': PARKS_DEMO_EMAIL.contratosFacturacion,
  'lilibeth.lopez@parksindustrial.com': PARKS_DEMO_EMAIL.adminSistema,
  'admin.parque.gdl@parksindustrial.com': PARKS_DEMO_EMAIL.adminParque,
};

export const resolveParksDemoCanonicalEmail = (email: string): string => {
  const normalizedEmail = email.trim().toLowerCase();

  return PARKS_DEMO_EMAIL_ALIASES[normalizedEmail] ?? normalizedEmail;
};
