export const DEMO_REF_PREFIX = 'DEMO-';

export const DEMO_PARQUES = [
  {
    key: 'parqueGdl',
    referencia: `${DEMO_REF_PREFIX}PARQUE-GDL-NORTE`,
    nombre: 'Parque Industrial Guadalajara Norte',
    ubicacion: 'El Salto, Jalisco',
    m2Totales: 120000,
    m2Rentados: 78000,
    administrador: 'Lic. Roberto Sánchez',
  },
  {
    key: 'parqueMty',
    referencia: `${DEMO_REF_PREFIX}PARQUE-MTY-ESTE`,
    nombre: 'Parque Industrial Monterrey Este',
    ubicacion: 'Apodaca, Nuevo León',
    m2Totales: 95000,
    m2Rentados: 62000,
    administrador: 'Ing. Laura Mendoza',
  },
] as const;

export const DEMO_BROKERS = [
  {
    key: 'brokerNewmark',
    empresa: 'Newmark',
    contacto: 'Carlos Mendoza',
    email: 'cmendoza@newmark.mx',
    firma: 'Newmark',
  },
  {
    key: 'brokerCbre',
    empresa: 'CBRE',
    contacto: 'Ana Ruiz',
    email: 'aruiz@cbre.com',
    firma: 'CBRE',
  },
  {
    key: 'brokerIndependiente',
    empresa: 'Industria Libre Brokers',
    contacto: 'Jorge Vega',
    email: 'jorge@industrialibre.mx',
    firma: 'Independiente',
  },
] as const;
