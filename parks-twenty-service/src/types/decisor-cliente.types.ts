import { type DecisorClienteRol } from '../constants/decisor-cliente.constants';

export type DecisorCliente = {
  id: string;
  inquilinoId?: string;
  opportunityId?: string;
  nombre: string;
  correo?: string;
  telefono?: string;
  rol: DecisorClienteRol;
  asistioTour?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpsertDecisorClienteInput = {
  id?: string;
  inquilinoId?: string;
  opportunityId?: string;
  nombre: string;
  correo?: string;
  telefono?: string;
  rol: DecisorClienteRol;
  asistioTour?: boolean;
};
