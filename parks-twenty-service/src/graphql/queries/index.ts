// GraphQL queries hacia Twenty Data API (camelCase según metadata Parks)

export const GET_CASOS_LEGALES_ACTIVOS = `
  query GetCasosLegalesActivos(
    $estatusCerrado: String!
    $estatusCancelado: String!
  ) {
    casosLegales(
      filter: {
        and: [
          { estatus: { neq: $estatusCerrado } }
          { estatus: { neq: $estatusCancelado } }
        ]
      }
      first: 250
    ) {
      edges {
        node {
          id
          referencia
          tipoDocumento
          estatus
          fechaHojaAcuerdos
          slaDiasHabiles
          slaFechaLimite
          diasTranscurridos
          documentacionCompleta
          esPropiedadFuno
          semaforo
          notasCatalina
          pdfBorradorUrl
          hojaDeAcuerdosId
          inquilinoId
          naveId
          inquilino {
            id
            empresa
            estatus
          }
          nave {
            id
            identificador
            esPropiedadFuno
          }
        }
      }
    }
  }
`;

export const GET_CASO_LEGAL_BY_ID = `
  query GetCasoLegalById($casoLegalId: UUID!) {
    casoLegal(filter: { id: { eq: $casoLegalId } }) {
      id
      referencia
      tipoDocumento
      estatus
      fechaHojaAcuerdos
      slaDiasHabiles
      slaFechaLimite
      diasTranscurridos
      documentacionCompleta
      cotejoAprobado
      esPropiedadFuno
      semaforo
      notasCatalina
      pdfBorradorUrl
      hojaDeAcuerdosId
      inquilinoId
      naveId
      hojaDeAcuerdos {
        id
        referencia
        m2Acordados
        precioUsdM2
        plazoMeses
        fechaInicio
        fechaFirma
        brokerComisionPct
        ejecutivoAsignado
        naveId
        brokerId
        nave {
          id
          identificador
          m2
          esPropiedadFuno
          parque {
            id
            nombre
            ubicacion
          }
        }
        broker {
          id
          empresa
          contacto
        }
      }
      inquilino {
        id
        empresa
        rfc
        repLegalNombre
        contactoPrincipal
        emailContacto
        estatus
      }
      nave {
        id
        identificador
        esPropiedadFuno
        parque {
          id
          nombre
          ubicacion
        }
      }
    }
  }
`;

export const GET_HOJA_DE_ACUERDOS_BY_ID = `
  query GetHojaDeAcuerdosById($hojaDeAcuerdosId: UUID!) {
    hojaDeAcuerdos(filter: { id: { eq: $hojaDeAcuerdosId } }) {
      id
      referencia
      m2Acordados
      precioUsdM2
      plazoMeses
      fechaInicio
      fechaFirma
      brokerComisionPct
      brokerComisionMonto
      ejecutivoAsignado
      naveId
      inquilinoId
      brokerId
      nave {
        id
        identificador
        esPropiedadFuno
      }
      broker {
        id
        empresa
        contacto
      }
    }
  }
`;

export const GET_NAVE_BY_ID = `
  query GetNaveById($naveId: UUID!) {
    nave(filter: { id: { eq: $naveId } }) {
      id
      identificador
      esPropiedadFuno
      parqueId
      parque {
        id
        nombre
        ubicacion
      }
    }
  }
`;

export const GET_DOCUMENTOS_CHECKLIST_BY_CASO = `
  query GetDocumentosChecklistByCaso($casoLegalId: UUID!) {
    documentosChecklist(
      filter: { casoLegalId: { eq: $casoLegalId } }
      first: 50
    ) {
      edges {
        node {
          id
          titulo
          tipoDocumento
          entregado
        }
      }
    }
  }
`;

export const GET_EXPEDIENTES_VENCIDOS = `
  query GetExpedientesVencidos($hoy: DateTime!, $estatusActivo: String!) {
    expedientesContrato(
      filter: {
        and: [
          { estatus: { eq: $estatusActivo } }
          { fechaVencimiento: { lte: $hoy } }
        ]
      }
      first: 250
    ) {
      edges {
        node {
          id
          numeroExpediente
          fechaVencimiento
          rentaMensualUsd
          estatus
          casoLegalId
          inquilinoId
          naveId
          inquilino {
            id
            empresa
            estatus
          }
          nave {
            id
            identificador
          }
          casoLegal {
            id
            estatus
            tipoDocumento
          }
        }
      }
    }
  }
`;

export const GET_EXPEDIENTES_BY_YEAR_PREFIX = `
  query GetExpedientesByYearPrefix($prefix: String!) {
    expedientesContrato(
      filter: { numeroExpediente: { startsWith: $prefix } }
      first: 250
    ) {
      edges {
        node {
          id
          numeroExpediente
        }
      }
    }
  }
`;

export const GET_HOLDOVER_BY_EXPEDIENTE = `
  query GetHoldoverByExpediente(
    $naveId: UUID!
    $inquilinoId: UUID!
    $resolucionActivo: String!
  ) {
    holdovers(
      filter: {
        and: [
          { naveId: { eq: $naveId } }
          { inquilinoId: { eq: $inquilinoId } }
          { resolucion: { eq: $resolucionActivo } }
        ]
      }
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

export const GET_COMISIONES_BY_HOJA = `
  query GetComisionesByHoja($hojaDeAcuerdosId: UUID!) {
    comisiones(
      filter: { hojaDeAcuerdosId: { eq: $hojaDeAcuerdosId } }
      first: 20
    ) {
      edges {
        node {
          id
          tipo
          beneficiario
        }
      }
    }
  }
`;

export const GET_OPPORTUNITY_BY_ID = `
  query GetOpportunityById($opportunityId: UUID!) {
    opportunity(filter: { id: { eq: $opportunityId } }) {
      id
      name
      stage
      etapaRenovacion
      tipoOperacion
      inquilinoVinculadoId
      naveVinculadaId
      brokerVinculadoId
    }
  }
`;

export const FIND_HOJA_DE_ACUERDOS_FOR_HANDOFF = `
  query FindHojaDeAcuerdosForHandoff(
    $inquilinoId: UUID!
    $naveId: UUID!
  ) {
    hojasDeAcuerdos(
      filter: {
        and: [
          { inquilinoId: { eq: $inquilinoId } }
          { naveId: { eq: $naveId } }
        ]
      }
      first: 1
    ) {
      edges {
        node {
          id
          referencia
          tipoContrato
          fechaFirma
          m2Acordados
          precioUsdM2
          plazoMeses
          ejecutivoAsignado
          nave {
            esPropiedadFuno
          }
        }
      }
    }
  }
`;

export const GET_FLUJOS_FIRMAS_BY_CASO = `
  query GetFlujosFirmasByCaso($casoLegalId: UUID!) {
    flujosFirmas(
      filter: { casoLegalId: { eq: $casoLegalId } }
      first: 20
    ) {
      edges {
        node {
          id
          orden
          firmante
          rol
          estatus
          casoLegalId
        }
      }
    }
  }
`;

export const GET_EXPEDIENTE_BY_ID = `
  query GetExpedienteById($expedienteContratoId: UUID!) {
    expedienteContrato(filter: { id: { eq: $expedienteContratoId } }) {
      id
      numeroExpediente
      fechaVencimiento
      rentaMensualUsd
      estatus
      oracleSincronizado
      oracleContratoId
      casoLegalId
      inquilinoId
      naveId
      inquilino {
        id
        empresa
        oracleClienteId
      }
      nave {
        id
        identificador
        oracleNaveId
      }
    }
  }
`;

export const GET_EXPEDIENTES_ACTIVOS = `
  query GetExpedientesActivos($estatusActivo: String!) {
    expedientesContrato(
      filter: { estatus: { eq: $estatusActivo } }
      first: 250
    ) {
      edges {
        node {
          id
          numeroExpediente
          fechaVencimiento
          rentaMensualUsd
          estatus
          inquilinoId
          naveId
          inquilino {
            id
            empresa
            contactoPrincipal
            emailContacto
          }
          nave {
            id
            identificador
          }
        }
      }
    }
  }
`;

export const FIND_OPPORTUNITY_BY_INQUILINO_NAVE = `
  query FindOpportunityByInquilinoNave(
    $inquilinoId: UUID!
    $naveId: UUID!
  ) {
    opportunities(
      filter: {
        and: [
          { inquilinoVinculadoId: { eq: $inquilinoId } }
          { naveVinculadaId: { eq: $naveId } }
        ]
      }
      first: 1
    ) {
      edges {
        node {
          id
          name
          stage
          etapaRenovacion
          inquilinoVinculadoId
          naveVinculadaId
        }
      }
    }
  }
`;

export const COUNT_ACTIVE_RENOVACION_CASOS = `
  query CountActiveRenovacionCasos(
    $inquilinoId: UUID!
    $naveId: UUID!
    $tipoRenovacion: String!
    $estatusCerrado: String!
    $estatusCancelado: String!
  ) {
    casosLegales(
      filter: {
        and: [
          { inquilinoId: { eq: $inquilinoId } }
          { naveId: { eq: $naveId } }
          { tipoDocumento: { eq: $tipoRenovacion } }
          { estatus: { neq: $estatusCerrado } }
          { estatus: { neq: $estatusCancelado } }
        ]
      }
      first: 1
    ) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

export const GET_NAVES_DISPONIBLES = `
  query GetNavesDisponibles($estatusDisponible: String!) {
    naves(
      filter: { estatus: { eq: $estatusDisponible } }
      first: 200
      orderBy: [{ m2: DescNullsLast }]
    ) {
      edges {
        node {
          id
          identificador
          m2
          estatus
          parque {
            id
            nombre
            ubicacion
          }
        }
      }
    }
  }
`;
