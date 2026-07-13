export const UPDATE_CASO_LEGAL = `
  mutation UpdateCasoLegal($casoLegalId: UUID!, $data: CasoLegalUpdateInput!) {
    updateCasoLegal(id: $casoLegalId, data: $data) {
      id
      estatus
      abogadoAsignado
      slaDiasHabiles
      slaFechaLimite
      diasTranscurridos
      semaforo
      notasCatalina
      pdfBorradorUrl
      documentacionCompleta
    }
  }
`;

export const CREATE_DOCUMENTO_CHECKLIST = `
  mutation CreateDocumentoChecklist($data: DocumentoChecklistCreateInput!) {
    createDocumentoChecklist(data: $data) {
      id
      titulo
      tipoDocumento
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

export const CREATE_COMISION = `
  mutation CreateComision($data: ComisionCreateInput!) {
    createComision(data: $data) {
      id
      tipo
      beneficiario
      montoUsd
    }
  }
`;

export const UPDATE_COMISION = `
  mutation UpdateComision($comisionId: UUID!, $data: ComisionUpdateInput!) {
    updateComision(id: $comisionId, data: $data) {
      id
      tipo
      beneficiario
      montoUsd
      estatus
    }
  }
`;

export const CREATE_EXPEDIENTE_CONTRATO = `
  mutation CreateExpedienteContrato($data: ExpedienteContratoCreateInput!) {
    createExpedienteContrato(data: $data) {
      id
      numeroExpediente
      fechaApertura
      fechaVencimiento
    }
  }
`;

export const UPDATE_INQUILINO = `
  mutation UpdateInquilino($inquilinoId: UUID!, $data: InquilinoUpdateInput!) {
    updateInquilino(id: $inquilinoId, data: $data) {
      id
      estatus
    }
  }
`;

export const UPDATE_NAVE = `
  mutation UpdateNave($naveId: UUID!, $data: NaveUpdateInput!) {
    updateNave(id: $naveId, data: $data) {
      id
      estatus
    }
  }
`;

export const UPDATE_EXPEDIENTE_CONTRATO = `
  mutation UpdateExpedienteContrato(
    $expedienteContratoId: UUID!
    $data: ExpedienteContratoUpdateInput!
  ) {
    updateExpedienteContrato(id: $expedienteContratoId, data: $data) {
      id
      estatus
      notas
    }
  }
`;

export const CREATE_NOTE = `
  mutation CreateNote($data: NoteCreateInput!) {
    createNote(data: $data) {
      id
      title
      bodyV2 {
        blocknote
      }
    }
  }
`;

export const CREATE_TASK = `
  mutation CreateTask($data: TaskCreateInput!) {
    createTask(data: $data) {
      id
      title
    }
  }
`;

export const CREATE_CASO_LEGAL = `
  mutation CreateCasoLegal($data: CasoLegalCreateInput!) {
    createCasoLegal(data: $data) {
      id
      referencia
      estatus
      tipoDocumento
    }
  }
`;

export const CREATE_FLUJO_FIRMAS = `
  mutation CreateFlujoFirmas($data: FlujoFirmasCreateInput!) {
    createFlujoFirmas(data: $data) {
      id
      orden
      estatus
    }
  }
`;

export const UPDATE_FLUJO_FIRMAS = `
  mutation UpdateFlujoFirmas($flujoFirmasId: UUID!, $data: FlujoFirmasUpdateInput!) {
    updateFlujoFirmas(id: $flujoFirmasId, data: $data) {
      id
      orden
      estatus
    }
  }
`;

export const UPDATE_DOCUMENTO_CHECKLIST = `
  mutation UpdateDocumentoChecklist(
    $documentoChecklistId: UUID!
    $data: DocumentoChecklistUpdateInput!
  ) {
    updateDocumentoChecklist(id: $documentoChecklistId, data: $data) {
      id
      entregado
      fechaEntrega
    }
  }
`;

export const CREATE_VERSION_DOCUMENTO = `
  mutation CreateVersionDocumento($data: VersionDocumentoCreateInput!) {
    createVersionDocumento(data: $data) {
      id
      titulo
      numeroVersion
      fechaEnvio
      respuestaCliente
      esVersionFinal
    }
  }
`;

export const UPDATE_VERSION_DOCUMENTO = `
  mutation UpdateVersionDocumento(
    $versionDocumentoId: UUID!
    $data: VersionDocumentoUpdateInput!
  ) {
    updateVersionDocumento(id: $versionDocumentoId, data: $data) {
      id
      respuestaCliente
      esVersionFinal
    }
  }
`;

export const CREATE_ACTA_RESTITUCION = `
  mutation CreateActaRestitucion($data: ActaRestitucionCreateInput!) {
    createActaRestitucion(data: $data) {
      id
      referencia
    }
  }
`;

export const UPDATE_ACTA_RESTITUCION = `
  mutation UpdateActaRestitucion(
    $actaRestitucionId: UUID!
    $data: ActaRestitucionUpdateInput!
  ) {
    updateActaRestitucion(id: $actaRestitucionId, data: $data) {
      id
      aprobadoPorComercial
      montoADevolver
    }
  }
`;

export const UPDATE_HOLDOVER = `
  mutation UpdateHoldover($holdoverId: UUID!, $data: HoldoverUpdateInput!) {
    updateHoldover(id: $holdoverId, data: $data) {
      id
      condonacionEstatus
      montoCondonado
    }
  }
`;

export const UPDATE_OPPORTUNITY = `
  mutation UpdateOpportunity($opportunityId: UUID!, $data: OpportunityUpdateInput!) {
    updateOpportunity(id: $opportunityId, data: $data) {
      id
      stage
    }
  }
`;
