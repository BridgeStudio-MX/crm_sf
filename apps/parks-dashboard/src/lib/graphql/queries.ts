export const GET_PARQUES = `
  query GetParques($first: Int!) {
    parques(first: $first) {
      edges {
        node {
          id
          nombre
          ubicacion
          m2Totales
          m2Rentados
        }
      }
    }
  }
`;

export const GET_PARQUE = `
  query GetParque($id: UUID!) {
    parque(filter: { id: { eq: $id } }) {
      id
      nombre
      ubicacion
      m2Totales
      m2Rentados
    }
  }
`;

export const GET_NAVES_BY_PARQUE = `
  query GetNavesByParque($parqueId: UUID!, $first: Int!) {
    naves(
      filter: { parqueId: { eq: $parqueId } }
      first: $first
      orderBy: { identificador: AscNullsLast }
    ) {
      edges {
        node {
          id
          identificador
          m2
          precioBaseUsd
          estatus
          parque {
            id
            nombre
          }
        }
      }
    }
  }
`;

export const GET_EXPEDIENTES_ACTIVOS = `
  query GetExpedientesActivos($first: Int!) {
    expedientesContrato(filter: { estatus: { eq: "ACTIVO" } }, first: $first) {
      edges {
        node {
          id
          numeroExpediente
          fechaVencimiento
          fechaApertura
          rentaMensualUsd
          estatus
          inquilino {
            id
            empresa
          }
          nave {
            id
            identificador
            m2
            precioBaseUsd
            parque {
              id
              nombre
            }
          }
          casoLegal {
            id
            referencia
          }
        }
      }
    }
  }
`;

export const GET_OPPORTUNITIES = `
  query GetOpportunities($first: Int!) {
    opportunities(first: $first, orderBy: { updatedAt: DescNullsLast }) {
      edges {
        node {
          id
          name
          stage
          m2Requeridos
          tipoOperacion
          amount {
            amountMicros
            currencyCode
          }
          createdAt
          updatedAt
          owner {
            name {
              firstName
              lastName
            }
          }
          naveVinculada {
            id
            identificador
          }
          inquilinoVinculado {
            id
            empresa
          }
        }
      }
    }
  }
`;

export const UPDATE_OPPORTUNITY_STAGE = `
  mutation UpdateOpportunityStage($id: UUID!, $stage: String!) {
    updateOpportunity(id: $id, data: { stage: $stage }) {
      id
      stage
    }
  }
`;

export const GET_CASOS_LEGALES = `
  query GetCasosLegales($first: Int!) {
    casosLegales(first: $first, orderBy: { updatedAt: DescNullsLast }) {
      edges {
        node {
          id
          referencia
          tipoDocumento
          estatus
          semaforo
          abogadoAsignado
          notasCatalina
          inquilino {
            id
            empresa
          }
          nave {
            id
            identificador
            m2
          }
          hojaDeAcuerdos {
            id
            m2Acordados
            precioUsdM2
            plazoMeses
          }
        }
      }
    }
  }
`;

export const GET_CASO_LEGAL = `
  query GetCasoLegal($id: UUID!) {
    casoLegal(filter: { id: { eq: $id } }) {
      id
      referencia
      tipoDocumento
      estatus
      semaforo
      abogadoAsignado
      notasCatalina
      inquilino {
        id
        empresa
      }
      nave {
        id
        identificador
        m2
        precioBaseUsd
      }
      hojaDeAcuerdos {
        id
        m2Acordados
        precioUsdM2
        plazoMeses
        fechaInicio
      }
    }
  }
`;

export const UPDATE_CASO_LEGAL = `
  mutation UpdateCasoLegal($id: UUID!, $data: CasoLegalUpdateInput!) {
    updateCasoLegal(id: $id, data: $data) {
      id
      notasCatalina
      estatus
    }
  }
`;

export const GET_COMISIONES = `
  query GetComisiones($first: Int!) {
    comisiones(first: $first, orderBy: { createdAt: DescNullsLast }) {
      edges {
        node {
          id
          tipo
          beneficiario
          montoUsd
          baseCalculo
          estatus
          casoLegal {
            id
            referencia
          }
          hojaDeAcuerdos {
            id
            referencia
            nave {
              id
              identificador
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_COMISION = `
  mutation UpdateComision($id: UUID!, $data: ComisionUpdateInput!) {
    updateComision(id: $id, data: $data) {
      id
      estatus
    }
  }
`;
