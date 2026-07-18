export type MockBroker = {
  key: string;
  empresaKey: string;
  contacto: string;
  email: string;
  telefono: string;
  firma: string;
  activo: boolean;
};

export const MOCK_BROKERS: MockBroker[] = [
  {
    key: 'newmark-carlos',
    empresaKey: 'newmark',
    contacto: 'Carlos Mendoza',
    email: 'cmendoza@newmark.mx',
    telefono: '+52 33 3615 2201',
    firma: 'Newmark',
    activo: true,
  },
  {
    key: 'newmark-sofia',
    empresaKey: 'newmark',
    contacto: 'Sofía Ramírez',
    email: 'sramirez@newmark.mx',
    telefono: '+52 33 3615 2202',
    firma: 'Newmark',
    activo: true,
  },
  {
    key: 'cbre-ana',
    empresaKey: 'cbre',
    contacto: 'Ana Ruiz',
    email: 'aruiz@cbre.com',
    telefono: '+52 55 5284 0101',
    firma: 'CBRE',
    activo: true,
  },
  {
    key: 'cbre-diego',
    empresaKey: 'cbre',
    contacto: 'Diego Palacios',
    email: 'dpalacios@cbre.com',
    telefono: '+52 55 5284 0102',
    firma: 'CBRE',
    activo: true,
  },
  {
    key: 'christian-lua',
    empresaKey: 'christian-lua',
    contacto: 'Christian Lua',
    email: 'christian.lua@brokers.mx',
    telefono: '+52 33 1200 8844',
    firma: 'Independiente',
    activo: true,
  },
  {
    key: 'industria-jorge',
    empresaKey: 'industria-libre',
    contacto: 'Jorge Vega',
    email: 'jorge@industrialibre.mx',
    telefono: '+52 81 8345 9900',
    firma: 'Independiente',
    activo: true,
  },
  {
    key: 'colliers-patricia',
    empresaKey: 'colliers',
    contacto: 'Patricia Ortega',
    email: 'patricia.ortega@colliers.mx',
    telefono: '+52 55 5000 3001',
    firma: 'Otro',
    activo: true,
  },
  {
    key: 'jl-luis',
    empresaKey: 'jl-realty',
    contacto: 'Luis Herrera',
    email: 'lherrera@jlrealty.mx',
    telefono: '+52 33 1988 4411',
    firma: 'Independiente',
    activo: true,
  },
];
