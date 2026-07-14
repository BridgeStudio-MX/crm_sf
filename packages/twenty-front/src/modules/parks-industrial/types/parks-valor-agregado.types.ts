export type ValorAgregadoDashboard = {
  generatedAt: string;
  f1ChecklistAlertas: Array<{
    casoLegalId: string;
    empresa: string;
    checklistDocumentosVigentes: boolean;
    documentosConAlerta: string;
  }>;
  f2Expansiones: Array<{
    id: string;
    inquilinoNombre: string;
    naveActual: string;
    parqueNombre: string;
    mesesOcupado: number;
    navesDisponibles: Array<{
      identificador: string;
      m2: number;
      precioBaseUsd: number;
    }>;
  }>;
  f3Concentracion: Array<{
    parqueNombre: string;
    m2Totales: number;
    umbralPct: number;
    contratosProximos90d: number;
    m2EnRiesgo: number;
    porcentajeRiesgo: number;
    alerta: boolean;
    contratos: Array<{
      empresa: string;
      fechaVencimiento: string;
      m2: number;
    }>;
  }>;
  f4RoiCanal: Array<{
    canalOrigen: string;
    totalOportunidades: number;
    dealsCerrados: number;
    tasaCierrePct: number;
    diasCicloPromedio: number | null;
    rentaPromedioUsd: number | null;
    costoComisionesUsd: number;
    revenueAnualizadoUsd: number;
  }>;
  f5Ofertas: Array<{
    id: string;
    empresa: string;
    loNombre: string;
    tipoIncentivo: string;
    fechaVencimientoOferta: string;
    estatus: string;
    oportunidadRenovacionId?: string;
  }>;
  f6Matches: Array<{
    opportunityId: string;
    opportunityName: string;
    matchNavesSugeridas: string;
    matchCount: number;
  }>;
  f7TiempoRespuesta: Array<{
    leasingOfficer: string;
    totalLeads: number;
    promedioHoras: number | null;
    pctExcelente: number;
    sinContacto48h: number;
  }>;
  f8BrokerAlerts: Array<{
    id: string;
    brokerEmpresa: string;
    naveIdentificador: string;
    parqueNombre: string;
    draftMailto: string;
  }>;
  f8Inactivos: Array<{
    empresa: string;
    diasSinActividad: number;
    zonasOperacion?: string;
  }>;
};
