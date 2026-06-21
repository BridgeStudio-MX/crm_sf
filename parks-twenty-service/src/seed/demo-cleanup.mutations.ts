export const DESTROY_DOCUMENTOS_CHECKLIST = `
  mutation DestroyDocumentosChecklist($filter: DocumentoChecklistFilterInput!) {
    destroyDocumentosChecklist(filter: $filter) {
      id
    }
  }
`;

export const DESTROY_VERSIONES_DOCUMENTO = `
  mutation DestroyVersionesDocumento($filter: VersionDocumentoFilterInput!) {
    destroyVersionesDocumento(filter: $filter) {
      id
    }
  }
`;

export const DESTROY_FLUJOS_FIRMAS = `
  mutation DestroyFlujosFirmas($filter: FlujoFirmasFilterInput!) {
    destroyFlujosFirmas(filter: $filter) {
      id
    }
  }
`;

export const DESTROY_COMISIONES = `
  mutation DestroyComisiones($filter: ComisionFilterInput!) {
    destroyComisiones(filter: $filter) {
      id
    }
  }
`;

export const DESTROY_EXPEDIENTES_CONTRATO = `
  mutation DestroyExpedientesContrato($filter: ExpedienteContratoFilterInput!) {
    destroyExpedientesContrato(filter: $filter) {
      id
    }
  }
`;

export const DESTROY_HOLDOVERS = `
  mutation DestroyHoldovers($filter: HoldoverFilterInput!) {
    destroyHoldovers(filter: $filter) {
      id
    }
  }
`;

export const DESTROY_CASOS_LEGALES = `
  mutation DestroyCasosLegales($filter: CasoLegalFilterInput!) {
    destroyCasosLegales(filter: $filter) {
      id
    }
  }
`;

export const DESTROY_HOJAS_DE_ACUERDOS = `
  mutation DestroyHojasDeAcuerdos($filter: HojaDeAcuerdosFilterInput!) {
    destroyHojasDeAcuerdos(filter: $filter) {
      id
    }
  }
`;

export const DESTROY_OPPORTUNITIES = `
  mutation DestroyOpportunities($filter: OpportunityFilterInput!) {
    destroyOpportunities(filter: $filter) {
      id
    }
  }
`;

export const DESTROY_NAVES = `
  mutation DestroyNaves($filter: NaveFilterInput!) {
    destroyNaves(filter: $filter) {
      id
    }
  }
`;

export const DESTROY_INQUILINOS = `
  mutation DestroyInquilinos($filter: InquilinoFilterInput!) {
    destroyInquilinos(filter: $filter) {
      id
    }
  }
`;

export const DESTROY_BROKERS = `
  mutation DestroyBrokers($filter: BrokerFilterInput!) {
    destroyBrokers(filter: $filter) {
      id
    }
  }
`;

export const DESTROY_PARQUES = `
  mutation DestroyParques($filter: ParqueFilterInput!) {
    destroyParques(filter: $filter) {
      id
    }
  }
`;
