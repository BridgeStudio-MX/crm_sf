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
          abogadoAsignado
          fechaHojaAcuerdos
          slaDiasHabiles
          slaFechaLimite
          diasTranscurridos
          diasPausados
          documentacionCompleta
          slaPausado
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
            parque {
              id
              nombre
            }
          }
        }
      }
    }
  }
`;

export const GET_ALL_CASOS_LEGALES = `
  query GetAllCasosLegales {
    casosLegales(first: 250, orderBy: [{ updatedAt: DescNullsLast }]) {
      edges {
        node {
          id
          referencia
          tipoDocumento
          estatus
          abogadoAsignado
          slaDiasHabiles
          diasTranscurridos
          semaforo
          inquilinoId
          inquilino {
            empresa
          }
          nave {
            identificador
            parque {
              nombre
            }
          }
        }
      }
    }
  }
`;

export const FIND_CASOS_LEGALES_BY_INQUILINO = `
  query FindCasosLegalesByInquilino($inquilinoId: UUID!) {
    casosLegales(
      filter: { inquilinoId: { eq: $inquilinoId } }
      first: 50
      orderBy: [{ updatedAt: DescNullsLast }]
    ) {
      edges {
        node {
          id
          referencia
          tipoDocumento
          estatus
          abogadoAsignado
          fechaHojaAcuerdos
          slaDiasHabiles
          slaFechaLimite
          diasTranscurridos
          documentacionCompleta
          cotejoAprobado
          slaPausado
          esPropiedadFuno
          semaforo
          hojaDeAcuerdosId
          inquilinoId
          naveId
          nave {
            id
            identificador
            esPropiedadFuno
            parque {
              id
              nombre
            }
          }
        }
      }
    }
  }
`;

export const FIND_EXPEDIENTES_BY_INQUILINO = `
  query FindExpedientesByInquilino($inquilinoId: UUID!) {
    expedientesContrato(
      filter: { inquilinoId: { eq: $inquilinoId } }
      first: 50
      orderBy: [{ fechaVencimiento: AscNullsLast }]
    ) {
      edges {
        node {
          id
          numeroExpediente
          fechaApertura
          fechaVencimiento
          rentaMensualUsd
          estatus
          oracleSincronizado
          oracleContratoId
          casoLegalId
          inquilinoId
          naveId
          nave {
            id
            identificador
            m2
            esPropiedadFuno
            parque {
              id
              nombre
            }
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
      abogadoAsignado
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
      tipoContrato
      m2Acordados
      precioUsdM2
      plazoMeses
      fechaInicio
      fechaFirma
      periodoGraciaMeses
      depositoMeses
      escalacionAnualPct
      condicionesEspeciales
      esquemaComision
      estatus
      firmadaPorCliente
      firmadaPorCem
      brokerComisionPct
      brokerComisionMonto
      ejecutivoAsignado
      naveId
      inquilinoId
      brokerId
      oportunidadVinculadaId
      nave {
        id
        identificador
        esPropiedadFuno
      }
      inquilino {
        id
        empresa
      }
      broker {
        id
        empresa
        contacto
      }
    }
  }
`;

export const FIND_HOJA_DE_ACUERDOS_BY_OPPORTUNITY = `
  query FindHojaDeAcuerdosByOpportunity($opportunityId: UUID!) {
    hojasDeAcuerdos(
      filter: { oportunidadVinculadaId: { eq: $opportunityId } }
      first: 5
      orderBy: [{ createdAt: DescNullsLast }]
    ) {
      edges {
        node {
          id
          referencia
          tipoContrato
          m2Acordados
          precioUsdM2
          plazoMeses
          fechaInicio
          fechaFirma
          periodoGraciaMeses
          depositoMeses
          escalacionAnualPct
          condicionesEspeciales
          esquemaComision
          estatus
          firmadaPorCliente
          firmadaPorCem
          brokerComisionPct
          brokerComisionMonto
          ejecutivoAsignado
          naveId
          inquilinoId
          brokerId
          oportunidadVinculadaId
          nave {
            id
            identificador
            esPropiedadFuno
          }
          inquilino {
            id
            empresa
          }
          broker {
            id
            empresa
            contacto
          }
        }
      }
    }
  }
`;

export const FIND_HOJAS_DE_ACUERDOS_BY_INQUILINO = `
  query FindHojasDeAcuerdosByInquilino($inquilinoId: UUID!) {
    hojasDeAcuerdos(
      filter: { inquilinoId: { eq: $inquilinoId } }
      first: 50
      orderBy: [{ updatedAt: DescNullsLast }]
    ) {
      edges {
        node {
          id
          referencia
          tipoContrato
          m2Acordados
          precioUsdM2
          plazoMeses
          fechaInicio
          fechaFirma
          periodoGraciaMeses
          depositoMeses
          escalacionAnualPct
          condicionesEspeciales
          estatus
          firmadaPorCliente
          firmadaPorCem
          ejecutivoAsignado
          naveId
          inquilinoId
          oportunidadVinculadaId
          nave {
            id
            identificador
            esPropiedadFuno
            parque {
              id
              nombre
            }
          }
        }
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
      m2
      alturaLibreM
      andenes
      cargaPisoTon
      potenciaKva
      oficinasM2
      precioBaseUsd
      estatus
      fotoInmuebleUrl
      parqueId
      parque {
        id
        nombre
        ubicacion
        fotoEntradaUrl
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
          montoUsd
          estatus
        }
      }
    }
  }
`;

export const FIND_CASO_LEGAL_BY_HOJA = `
  query FindCasoLegalByHoja($hojaDeAcuerdosId: UUID!) {
    casosLegales(
      filter: { hojaDeAcuerdosId: { eq: $hojaDeAcuerdosId } }
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

export const GET_ALL_COMISIONES = `
  query GetAllComisiones {
    comisiones(first: 200, orderBy: [{ updatedAt: DescNullsLast }]) {
      edges {
        node {
          id
          tipo
          beneficiario
          montoUsd
          estatus
          baseCalculo
          hojaDeAcuerdosId
          casoLegalId
          hojaDeAcuerdos {
            referencia
            m2Acordados
            precioUsdM2
            nave {
              identificador
            }
          }
          casoLegal {
            referencia
          }
        }
      }
    }
  }
`;

export const GET_OPPORTUNITIES_SUMMARY = `
  query GetOpportunitiesSummary {
    opportunities(first: 200, orderBy: [{ updatedAt: DescNullsLast }]) {
      edges {
        node {
          id
          name
          stage
          m2Requeridos
          updatedAt
          aprobacionRequerida
          estatusAprobacion
          nivelAprobacion
          comentarioAprobacion
          amount {
            amountMicros
            currencyCode
          }
        }
      }
    }
  }
`;

export const GET_OPPORTUNITIES_FOR_DEMAND_SEARCH = `
  query GetOpportunitiesForDemandSearch {
    opportunities(first: 200, orderBy: [{ updatedAt: DescNullsLast }]) {
      edges {
        node {
          id
          name
          stage
          m2Requeridos
          ubicacionDeseada
          canalOrigen
          plazoContratoMeses
          updatedAt
          amount {
            amountMicros
            currencyCode
          }
          inquilinoVinculado {
            id
            empresa
            sector
            rfc
          }
          naveVinculada {
            id
            identificador
          }
        }
      }
    }
  }
`;

export const GET_INQUILINO_BY_ID = `
  query GetInquilinoById($inquilinoId: UUID!) {
    inquilino(filter: { id: { eq: $inquilinoId } }) {
      id
      empresa
      rfc
      contactoPrincipal
      emailContacto
      telefono
      repLegalNombre
      repLegalEmail
      sector
      estatus
      oracleClienteId
      ultimoPagoFecha
      pagosAlCorriente
    }
  }
`;

export const FIND_OPPORTUNITIES_BY_INQUILINO = `
  query FindOpportunitiesByInquilino($inquilinoId: UUID!) {
    opportunities(
      filter: { inquilinoVinculadoId: { eq: $inquilinoId } }
      first: 50
      orderBy: [{ updatedAt: DescNullsLast }]
    ) {
      edges {
        node {
          id
          name
          stage
          tipoOperacion
          m2Requeridos
          ubicacionDeseada
          updatedAt
          createdAt
          naveVinculada {
            id
            identificador
          }
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
      m2Requeridos
      m2Ofertados
      precioPorM2Usd
      plazoContratoMeses
      periodoGraciaMeses
      depositoGarantiaMeses
      rentasAdelantadasMeses
      escalacionAnual
      aprobacionRequerida
      estatusAprobacion
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
          fechaEnvio
          fechaFirma
          casoLegalId
        }
      }
    }
  }
`;

export const GET_VERSIONES_BY_CASO = `
  query GetVersionesByCaso($casoLegalId: UUID!) {
    versionesDocumento(
      filter: { casoLegalId: { eq: $casoLegalId } }
      first: 50
      orderBy: [{ numeroVersion: AscNullsLast }]
    ) {
      edges {
        node {
          id
          titulo
          numeroVersion
          fechaEnvio
          enviadoPor
          dirigidoA
          respuestaCliente
          cambiosSolicitados
          esVersionFinal
          pdfUrl
        }
      }
    }
  }
`;

export const GET_ACTAS_BY_CASO = `
  query GetActasByCaso($casoLegalId: UUID!) {
    actasRestitucion(
      filter: { casoLegalId: { eq: $casoLegalId } }
      first: 10
    ) {
      edges {
        node {
          id
          referencia
          fechaSalidaCliente
          fechaRecepcionActa
          diasRetrasoActa
          estadoNave
          decisionDeposito
          montoDepositoOriginal
          montoADevolver
          montoARetener
          aprobadoPorComercial
          actaFirmadaCliente
        }
      }
    }
  }
`;

export const GET_HOLDOVERS_ACTIVOS = `
  query GetHoldoversActivos($resolucionActivo: String!) {
    holdovers(
      filter: { resolucion: { eq: $resolucionActivo } }
      first: 100
    ) {
      edges {
        node {
          id
          referencia
          fechaInicioHoldover
          montoHoldoverMensual
          diasHoldoverAcumulados
          montoAcumuladoUsd
          montoCobradoUsd
          condonacionSolicitada
          condonacionMotivo
          condonacionEstatus
          condonacionAutorizada
          montoCondonado
          inquilino {
            empresa
          }
          nave {
            identificador
          }
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
          fechaApertura
          fechaVencimiento
          rentaMensualUsd
          estatus
          casoLegalId
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
            m2
            esPropiedadFuno
            parque {
              id
              nombre
            }
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
          alturaLibreM
          andenes
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

export const GET_NAVES_MATCHING_CATALOG = `
  query GetNavesMatchingCatalog {
    naves(
      filter: {
        or: [
          { estatus: { eq: "DISPONIBLE" } }
          { estatus: { eq: "EN_NEGOCIACION" } }
        ]
      }
      first: 200
      orderBy: [{ m2: DescNullsLast }]
    ) {
      edges {
        node {
          id
          identificador
          m2
          estatus
          alturaLibreM
          andenes
          fotoInmuebleUrl
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
