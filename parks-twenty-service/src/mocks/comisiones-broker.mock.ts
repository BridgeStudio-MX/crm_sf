export type MockComisionBroker = {
  key: string;
  brokerKey: string;
  beneficiario: string;
  folio: string;
  clienteNombre: string;
  leasingOfficer: string;
  montoUsd: number;
  pctAplicado: number;
  estatus: 'Calculada' | 'Aprobada' | 'Pagada';
  origenDeal: string;
  tipoContratoComision: 'Nuevo' | 'Renovación';
};

export const MOCK_COMISIONES_BROKER: MockComisionBroker[] = [
  {
    key: 'com-newmark-1',
    brokerKey: 'newmark-carlos',
    beneficiario: 'Newmark',
    folio: 'PI-2026-000101',
    clienteNombre: 'Tramex Logistics',
    leasingOfficer: 'Bruyel',
    montoUsd: 48500,
    pctAplicado: 5,
    estatus: 'Calculada',
    origenDeal: 'Broker',
    tipoContratoComision: 'Nuevo',
  },
  {
    key: 'com-newmark-2',
    brokerKey: 'newmark-sofia',
    beneficiario: 'Newmark',
    folio: 'PI-2026-000102',
    clienteNombre: 'ColdChain MX',
    leasingOfficer: 'Israel',
    montoUsd: 32200,
    pctAplicado: 5,
    estatus: 'Aprobada',
    origenDeal: 'Broker',
    tipoContratoComision: 'Nuevo',
  },
  {
    key: 'com-cbre-1',
    brokerKey: 'cbre-ana',
    beneficiario: 'CBRE',
    folio: 'PI-2026-000103',
    clienteNombre: 'AutoParts Bajío',
    leasingOfficer: 'Bruyel',
    montoUsd: 67800,
    pctAplicado: 5,
    estatus: 'Pagada',
    origenDeal: 'Broker',
    tipoContratoComision: 'Nuevo',
  },
  {
    key: 'com-cbre-2',
    brokerKey: 'cbre-diego',
    beneficiario: 'CBRE',
    folio: 'PI-2026-000104',
    clienteNombre: 'Rappi MX Hub',
    leasingOfficer: 'UAE',
    montoUsd: 29100,
    pctAplicado: 3.5,
    estatus: 'Calculada',
    origenDeal: 'Broker',
    tipoContratoComision: 'Nuevo',
  },
  {
    key: 'com-lua-1',
    brokerKey: 'christian-lua',
    beneficiario: 'Christian Lua Brokers',
    folio: 'PI-2026-000105',
    clienteNombre: 'Distribuidora Occidente',
    leasingOfficer: 'Bruyel',
    montoUsd: 21400,
    pctAplicado: 4.5,
    estatus: 'Aprobada',
    origenDeal: 'Broker',
    tipoContratoComision: 'Nuevo',
  },
  {
    key: 'com-colliers-1',
    brokerKey: 'colliers-patricia',
    beneficiario: 'Colliers México',
    folio: 'PI-2026-000106',
    clienteNombre: 'Nearshore Components',
    leasingOfficer: 'Israel',
    montoUsd: 91200,
    pctAplicado: 5,
    estatus: 'Calculada',
    origenDeal: 'Broker',
    tipoContratoComision: 'Nuevo',
  },
  {
    key: 'com-jl-1',
    brokerKey: 'jl-luis',
    beneficiario: 'JL Realty Partners',
    folio: 'PI-2026-000107',
    clienteNombre: 'Pack & Ship GDL',
    leasingOfficer: 'UAE',
    montoUsd: 15600,
    pctAplicado: 3.5,
    estatus: 'Calculada',
    origenDeal: 'Broker',
    tipoContratoComision: 'Renovación',
  },
  {
    key: 'com-industria-1',
    brokerKey: 'industria-jorge',
    beneficiario: 'Industria Libre Brokers',
    folio: 'PI-2026-000108',
    clienteNombre: 'Alimentos del Norte',
    leasingOfficer: 'Bruyel',
    montoUsd: 18800,
    pctAplicado: 4,
    estatus: 'Pagada',
    origenDeal: 'Broker',
    tipoContratoComision: 'Nuevo',
  },
];
