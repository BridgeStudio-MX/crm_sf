export type MockEmpresaBroker = {
  key: string;
  nombre: string;
  contactoPrincipal: string;
  email: string;
  telefono: string;
  comisionPct: number;
  comisionPctNuevo: number;
  comisionPctPreventa: number;
  comisionPctRenovacion: number;
  clasificacion: 'Top 10' | 'No top 10';
  sectores: string;
  zonasOperacion: string;
  notas: string;
  activo: boolean;
};

export const MOCK_EMPRESAS_BROKER: MockEmpresaBroker[] = [
  {
    key: 'newmark',
    nombre: 'Newmark',
    contactoPrincipal: 'Carlos Mendoza',
    email: 'cmendoza@newmark.mx',
    telefono: '+52 33 3615 2200',
    comisionPct: 5,
    comisionPctNuevo: 5,
    comisionPctPreventa: 4,
    comisionPctRenovacion: 2.5,
    clasificacion: 'Top 10',
    sectores: 'Logística, Automotriz, E-commerce',
    zonasOperacion: 'Guadalajara, Bajío, CDMX',
    notas: 'Broker institucional con pipeline recurrente en corredor GDL.',
    activo: true,
  },
  {
    key: 'cbre',
    nombre: 'CBRE',
    contactoPrincipal: 'Ana Ruiz',
    email: 'aruiz@cbre.com',
    telefono: '+52 55 5284 0100',
    comisionPct: 5,
    comisionPctNuevo: 5,
    comisionPctPreventa: 3.5,
    comisionPctRenovacion: 2,
    clasificacion: 'Top 10',
    sectores: 'Manufactura, Logística, Oficina industrial',
    zonasOperacion: 'CDMX, Toluca, Monterrey',
    notas: 'Cuenta estratégica nacional; deals multi-nave frecuentes.',
    activo: true,
  },
  {
    key: 'christian-lua',
    nombre: 'Christian Lua Brokers',
    contactoPrincipal: 'Christian Lua',
    email: 'christian.lua@brokers.mx',
    telefono: '+52 33 1200 8844',
    comisionPct: 4.5,
    comisionPctNuevo: 4.5,
    comisionPctPreventa: 3.5,
    comisionPctRenovacion: 2,
    clasificacion: 'Top 10',
    sectores: 'Logística, Distribución',
    zonasOperacion: 'Guadalajara, El Salto, Tlaquepaque',
    notas: 'Boutique local con fuerte red de prospectos GDL.',
    activo: true,
  },
  {
    key: 'industria-libre',
    nombre: 'Industria Libre Brokers',
    contactoPrincipal: 'Jorge Vega',
    email: 'jorge@industrialibre.mx',
    telefono: '+52 81 8345 9900',
    comisionPct: 4,
    comisionPctNuevo: 4,
    comisionPctPreventa: 3,
    comisionPctRenovacion: 1.5,
    clasificacion: 'No top 10',
    sectores: 'Manufactura ligera, Alimentos',
    zonasOperacion: 'Monterrey, Saltillo',
    notas: 'Broker regional en Norte; volumen medio.',
    activo: true,
  },
  {
    key: 'colliers',
    nombre: 'Colliers México',
    contactoPrincipal: 'Patricia Ortega',
    email: 'patricia.ortega@colliers.mx',
    telefono: '+52 55 5000 3000',
    comisionPct: 5,
    comisionPctNuevo: 5,
    comisionPctPreventa: 4,
    comisionPctRenovacion: 2.5,
    clasificacion: 'Top 10',
    sectores: 'Automotriz, Nearshoring, 3PL',
    zonasOperacion: 'Bajío, Querétaro, Silao',
    notas: 'Foco nearshoring; deals de alto ticket.',
    activo: true,
  },
  {
    key: 'jl-realty',
    nombre: 'JL Realty Partners',
    contactoPrincipal: 'Luis Herrera',
    email: 'lherrera@jlrealty.mx',
    telefono: '+52 33 1988 4411',
    comisionPct: 3.5,
    comisionPctNuevo: 3.5,
    comisionPctPreventa: 3,
    comisionPctRenovacion: 1.5,
    clasificacion: 'No top 10',
    sectores: 'E-commerce, Retail industrial',
    zonasOperacion: 'Guadalajara, Zapopan',
    notas: 'Boutique emergente; documentación en proceso.',
    activo: true,
  },
];
