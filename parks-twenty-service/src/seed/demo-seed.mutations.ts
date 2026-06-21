export const CREATE_PARQUE = `
  mutation CreateParque($data: ParqueCreateInput!) {
    createParque(data: $data) {
      id
      nombre
    }
  }
`;

export const CREATE_NAVE = `
  mutation CreateNave($data: NaveCreateInput!) {
    createNave(data: $data) {
      id
      identificador
    }
  }
`;

export const CREATE_INQUILINO = `
  mutation CreateInquilino($data: InquilinoCreateInput!) {
    createInquilino(data: $data) {
      id
      empresa
    }
  }
`;

export const CREATE_BROKER = `
  mutation CreateBroker($data: BrokerCreateInput!) {
    createBroker(data: $data) {
      id
      empresa
    }
  }
`;

export const CREATE_HOJA_DE_ACUERDOS = `
  mutation CreateHojaDeAcuerdos($data: HojaDeAcuerdosCreateInput!) {
    createHojaDeAcuerdos(data: $data) {
      id
      referencia
    }
  }
`;

export const CREATE_OPPORTUNITY = `
  mutation CreateOpportunity($data: OpportunityCreateInput!) {
    createOpportunity(data: $data) {
      id
      name
      stage
    }
  }
`;

export const CREATE_CASO_LEGAL = `
  mutation CreateCasoLegal($data: CasoLegalCreateInput!) {
    createCasoLegal(data: $data) {
      id
      referencia
    }
  }
`;

export const CREATE_EXPEDIENTE_CONTRATO = `
  mutation CreateExpedienteContrato($data: ExpedienteContratoCreateInput!) {
    createExpedienteContrato(data: $data) {
      id
      numeroExpediente
    }
  }
`;

export const CREATE_HOLDOVER = `
  mutation CreateHoldover($data: HoldoverCreateInput!) {
    createHoldover(data: $data) {
      id
      referencia
    }
  }
`;

export const FIND_DEMO_CASOS = `
  query FindDemoCasos($prefix: String!) {
    casosLegales(
      filter: { referencia: { startsWith: $prefix } }
      first: 1
    ) {
      edges {
        node {
          id
          referencia
        }
      }
    }
  }
`;
