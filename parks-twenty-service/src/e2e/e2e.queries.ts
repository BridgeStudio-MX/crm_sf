export const FIND_E2E_HOJA = `
  query FindE2eHoja($referencia: String!) {
    hojasDeAcuerdos(filter: { referencia: { eq: $referencia } }, first: 1) {
      edges {
        node {
          id
          referencia
        }
      }
    }
  }
`;

export const FIND_CASO_BY_HOJA = `
  query FindCasoByHoja($hojaDeAcuerdosId: UUID!) {
    casosLegales(
      filter: { hojaDeAcuerdosId: { eq: $hojaDeAcuerdosId } }
      first: 1
    ) {
      edges {
        node {
          id
          referencia
          estatus
          pdfBorradorUrl
        }
      }
    }
  }
`;

export const FIND_E2E_CASO = `
  query FindE2eCaso($referencia: String!) {
    casosLegales(filter: { referencia: { eq: $referencia } }, first: 1) {
      edges {
        node {
          id
          referencia
          estatus
          pdfBorradorUrl
        }
      }
    }
  }
`;

export const FIND_PARQUE_BY_NOMBRE = `
  query FindParqueByNombre($nombre: String!) {
    parques(filter: { nombre: { eq: $nombre } }, first: 1) {
      edges {
        node {
          id
          nombre
        }
      }
    }
  }
`;

export const FIND_BROKER_BY_EMPRESA = `
  query FindBrokerByEmpresa($empresa: String!) {
    brokers(filter: { empresa: { eq: $empresa } }, first: 1) {
      edges {
        node {
          id
          empresa
        }
      }
    }
  }
`;

export const FIND_EXPEDIENTE_BY_CASO = `
  query FindExpedienteByCaso($casoLegalId: UUID!) {
    expedientesContrato(
      filter: { casoLegalId: { eq: $casoLegalId } }
      first: 1
    ) {
      edges {
        node {
          id
          numeroExpediente
          estatus
        }
      }
    }
  }
`;

export const E2E_KPI_SNAPSHOT = `
  query E2eKpiSnapshot($demoPrefix: String!) {
    casosLegales(filter: { referencia: { startsWith: $demoPrefix } }, first: 50) {
      edges {
        node {
          id
          referencia
          semaforo
          estatus
        }
      }
    }
    expedientesContrato(first: 50) {
      edges {
        node {
          id
          numeroExpediente
          estatus
        }
      }
    }
    oportunidades: opportunities(first: 50) {
      edges {
        node {
          id
          name
          stage
        }
      }
    }
  }
`;
