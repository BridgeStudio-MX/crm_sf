// Deals above these thresholds must pass through consejo / comité approval.
export const CONSEJO_M2_THRESHOLD = 20_000;
export const CONSEJO_RENTA_MENSUAL_THRESHOLD = 5_000;

export type ConsejoApprovalCheck = {
  requiresConsejo: boolean;
  reasons: string[];
};

export const evaluateConsejoApproval = (input: {
  m2Ofertados?: number;
  rentaMensualCalculada?: number;
}): ConsejoApprovalCheck => {
  const reasons: string[] = [];

  if (
    typeof input.m2Ofertados === 'number' &&
    input.m2Ofertados > CONSEJO_M2_THRESHOLD
  ) {
    reasons.push(
      `Superficie ofertada ${input.m2Ofertados.toLocaleString('es-MX')} m² (> ${CONSEJO_M2_THRESHOLD.toLocaleString('es-MX')} m²)`,
    );
  }

  if (
    typeof input.rentaMensualCalculada === 'number' &&
    input.rentaMensualCalculada > CONSEJO_RENTA_MENSUAL_THRESHOLD
  ) {
    reasons.push(
      `Renta mensual ${input.rentaMensualCalculada.toLocaleString('es-MX')} (> ${CONSEJO_RENTA_MENSUAL_THRESHOLD.toLocaleString('es-MX')})`,
    );
  }

  return {
    requiresConsejo: reasons.length > 0,
    reasons,
  };
};
