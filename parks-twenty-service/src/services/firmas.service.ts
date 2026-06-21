import {
  CASO_LEGAL_ESTATUS_CERRADO,
  FLUJO_FIRMAS_ESTATUS_ENVIADO,
  FLUJO_FIRMAS_ESTATUS_FIRMADO,
  FLUJO_FIRMAS_ESTATUS_PENDIENTE,
} from '../constants/parks.constants';
import { type CasoLegalRecord } from '../types/parks.types';
import { toSelectValue } from '../utils/select-value.util';
import { twentyDataService } from './twenty-data.service';

type FlujoFirmaStepDefinition = {
  orden: number;
  firmante: string;
  rol: string;
  esExterno?: boolean;
};

const BASE_FLUJO_STEPS: FlujoFirmaStepDefinition[] = [
  { orden: 1, firmante: 'Representante legal cliente', rol: 'Cliente' },
  { orden: 2, firmante: 'Subdirector Legal', rol: 'Subdirector Legal' },
  { orden: 3, firmante: 'Director General', rol: 'Director General' },
];

const FUNO_FLUJO_STEPS: FlujoFirmaStepDefinition[] = [
  {
    orden: 4,
    firmante: 'Apoderado FUNO 1',
    rol: 'Apoderado FUNO 1',
    esExterno: true,
  },
  {
    orden: 5,
    firmante: 'Apoderado FUNO 2',
    rol: 'Apoderado FUNO 2',
    esExterno: true,
  },
];

const buildFlujoSteps = (casoLegal: CasoLegalRecord): FlujoFirmaStepDefinition[] => {
  const esFuno =
    casoLegal.esPropiedadFuno || casoLegal.nave?.esPropiedadFuno === true;

  if (esFuno) {
    return [...BASE_FLUJO_STEPS, ...FUNO_FLUJO_STEPS];
  }

  return BASE_FLUJO_STEPS;
};

export const firmasService = {
  iniciarFlujoFirmas: async (casoLegal: CasoLegalRecord): Promise<void> => {
    const fullCasoLegal =
      (await twentyDataService.getCasoLegalById(casoLegal.id)) ?? casoLegal;

    const existingSteps = await twentyDataService.findFlujosFirmasByCasoLegal(
      fullCasoLegal.id,
    );

    if (existingSteps.length > 0) {
      console.log(
        `[firmas.service] Flujo already exists for caso ${fullCasoLegal.id}`,
      );
      return;
    }

    const steps = buildFlujoSteps(fullCasoLegal);

    for (const [index, step] of steps.entries()) {
      await twentyDataService.createFlujoFirmas({
        orden: step.orden,
        firmante: step.firmante,
        rol: toSelectValue(step.rol),
        estatus: toSelectValue(
          index === 0
            ? FLUJO_FIRMAS_ESTATUS_ENVIADO
            : FLUJO_FIRMAS_ESTATUS_PENDIENTE,
        ),
        esExterno: step.esExterno ?? false,
        casoLegalId: fullCasoLegal.id,
      });
    }

    await twentyDataService.updateCasoLegal(fullCasoLegal.id, {
      estatus: toSelectValue('Flujo de firmas'),
    });

    console.log(
      `[firmas.service] Started signature flow (${steps.length} steps) — caso ${fullCasoLegal.referencia ?? fullCasoLegal.id}`,
    );
  },

  advanceAfterSignature: async (casoLegalId: string): Promise<void> => {
    const steps =
      await twentyDataService.findFlujosFirmasByCasoLegal(casoLegalId);

    if (steps.length === 0) {
      return;
    }

    const firmadoValue = toSelectValue(FLUJO_FIRMAS_ESTATUS_FIRMADO);
    const enviadoValue = toSelectValue(FLUJO_FIRMAS_ESTATUS_ENVIADO);
    const pendienteValue = toSelectValue(FLUJO_FIRMAS_ESTATUS_PENDIENTE);

    const everyStepSigned = steps.every(
      (step) => step.estatus === firmadoValue,
    );

    if (everyStepSigned) {
      await twentyDataService.updateCasoLegal(casoLegalId, {
        estatus: toSelectValue(CASO_LEGAL_ESTATUS_CERRADO),
        semaforo: 'VERDE',
      });

      console.log(
        `[firmas.service] All signatures complete — caso ${casoLegalId} closed`,
      );

      return;
    }

    const nextStep = steps.find((step) => step.estatus === pendienteValue);

    if (!nextStep) {
      return;
    }

    await twentyDataService.updateFlujoFirmas(nextStep.id, {
      estatus: enviadoValue,
    });

    console.log(
      `[firmas.service] Activated next signer (orden ${nextStep.orden}) — caso ${casoLegalId}`,
    );
  },
};
