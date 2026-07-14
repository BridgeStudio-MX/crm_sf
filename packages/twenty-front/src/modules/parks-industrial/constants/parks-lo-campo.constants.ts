export const PARKS_LO_CAMPO_RECOMMENDATION_CHIPS = [
  'Cliente muy interesado',
  'Pedir cotización formal',
  'Mostrar otra nave',
  'Precio percibido alto',
  'Necesita más m²',
  'Timing largo (6+ meses)',
  'Decisor no asistió',
  'Follow-up en 48h',
] as const;

export const PARKS_LO_CAMPO_CHECKLIST_ITEMS = [
  {
    id: 'cita',
    label: 'Confirmar cita y acceso al parque',
  },
  {
    id: 'guion',
    label: 'Revisar guión y naves del tour',
  },
  {
    id: 'fichas',
    label: 'Llevar fichas técnicas / brochure',
  },
  {
    id: 'decisor',
    label: 'Validar asistencia del decisor',
  },
  {
    id: 'feedback',
    label: 'Capturar comentarios en vivo',
  },
  {
    id: 'proximo',
    label: 'Acordar próximo paso con el cliente',
  },
  {
    id: 'crm',
    label: 'Guardar tour y follow-up en CRM',
  },
] as const;

export const PARKS_LO_CAMPO_TOUR_STAGES = [
  'TOUR_VISITA',
  'CALIFICADO',
  'COTIZACION_ENVIADA',
  'LEAD_RECIBIDO',
] as const;
