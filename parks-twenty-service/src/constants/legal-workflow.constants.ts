import { PARKS_DEMO_EMAIL } from '../metadata/parks-demo-users.constants';

export const LEGAL_PIPELINE_STAGES = [
  { id: 'nuevo', label: 'Nuevo', estatus: 'Nuevo', responsable: 'Catalina' },
  {
    id: 'asignado',
    label: 'Asignado',
    estatus: 'Asignado',
    responsable: 'Abogado asignado',
  },
  {
    id: 'docs-incompletas',
    label: 'Documentación incompleta',
    estatus: 'Documentación incompleta',
    responsable: 'Comercial / Cliente',
  },
  {
    id: 'elaboracion',
    label: 'En elaboración',
    estatus: 'En elaboración',
    responsable: 'Abogado asignado',
  },
  {
    id: 'primera-version',
    label: 'Primera versión enviada',
    estatus: 'Primera versión enviada',
    responsable: 'Abogado asignado',
  },
  {
    id: 'negociacion',
    label: 'En negociación con cliente',
    estatus: 'En negociación con cliente',
    responsable: 'Abogado asignado',
  },
  {
    id: 'version-final',
    label: 'Versión final aceptada',
    estatus: 'Versión final aceptada',
    responsable: 'Abogado asignado',
  },
  {
    id: 'espera-firma-cliente',
    label: 'En espera de firma del cliente',
    estatus: 'En espera de firma del cliente',
    responsable: 'Cliente',
  },
  {
    id: 'cotejo',
    label: 'Cotejo pendiente',
    estatus: 'Cotejo pendiente',
    responsable: 'Catalina',
  },
  {
    id: 'firmas',
    label: 'Flujo de firmas',
    estatus: 'Flujo de firmas',
    responsable: 'Firmantes internos',
  },
  {
    id: 'funo',
    label: 'Enviado a FUNO/NEXT',
    estatus: 'Enviado a FUNO/NEXT',
    responsable: 'Apoderados FUNO',
  },
  {
    id: 'cerrado',
    label: 'Firmado — cerrado',
    estatus: 'Firmado — cerrado',
    responsable: 'Legal',
  },
] as const;

export const LEGAL_LAWYER_OPTIONS = [
  'Miguel Soto',
  'Abogado 2 — Parks Legal',
  'Abogado 3 — Parks Legal',
] as const;

export const LEGAL_LAWYER_DIRECTORY: ReadonlyArray<{
  name: string;
  email: string;
}> = [
  { name: 'Miguel Soto', email: PARKS_DEMO_EMAIL.abogadoAsignado },
  { name: 'Abogado asignado', email: PARKS_DEMO_EMAIL.abogadoAsignado },
] as const;

export const resolveLegalLawyerEmail = (lawyerName: string): string | null => {
  const normalizedName = lawyerName.trim().toLowerCase();
  const match = LEGAL_LAWYER_DIRECTORY.find(
    (lawyer) => lawyer.name.toLowerCase() === normalizedName,
  );

  return match?.email ?? null;
};

export const CASO_LEGAL_ESTATUS_ASIGNADO = 'Asignado';
export const CASO_LEGAL_ESTATUS_NEGOCIACION = 'En negociación con cliente';
export const CASO_LEGAL_ESTATUS_VERSION_FINAL = 'Versión final aceptada';
export const CASO_LEGAL_ESTATUS_ESPERA_FIRMA_CLIENTE =
  'En espera de firma del cliente';
export const CASO_LEGAL_ESTATUS_COTEJO = 'Cotejo pendiente';
export const CASO_LEGAL_ESTATUS_FUNO = 'Enviado a FUNO/NEXT';
