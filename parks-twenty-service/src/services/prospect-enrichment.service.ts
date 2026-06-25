import axios from 'axios';

import { resolveProspectIndustryKey } from '../constants/prospect-industry-profiles.constants';
import { envConfig } from '../config/env.config';
import { type ProspectEnrichmentResult } from '../types/broker-notification.types';
import { prospectScoringService } from './prospect-scoring.service';

const enrichmentCache = new Map<string, ProspectEnrichmentResult>();

const INDUSTRY_ENRICHMENT_DETAILS: Record<
  string,
  Omit<
    ProspectEnrichmentResult,
    | 'opportunityId'
    | 'companyName'
    | 'usedLlm'
    | 'enrichedAt'
    | 'fitScore'
    | 'urgency'
    | 'industry'
    | 'riskLevel'
  >
> = {
  logistica: {
    employeeCountEstimate: '250–800',
    revenueEstimateUsd: '$12M–$45M USD/año',
    investmentSignals: [
      'Expansión de última milla en Bajío',
      'Contrato 3PL con retailer nacional',
    ],
    linkedInSignals: [
      'Contrataciones recientes en operaciones',
      'Publicación sobre nearshoring',
    ],
    summary:
      'Perfil industrial sólido con necesidad probable de patio de maniobras y muelles de carga.',
    suggestedActions: [
      'Agendar visita a naves con andén nivel camión',
      'Enviar ficha técnica con m² y energía trifásica',
      'Validar requerimiento de altura libre ≥ 9 m',
    ],
  },
  alimentos: {
    employeeCountEstimate: '120–400',
    revenueEstimateUsd: '$8M–$30M USD/año',
    investmentSignals: [
      'Certificación SQF en proceso',
      'Nueva línea de empaque',
    ],
    linkedInSignals: [
      'Anuncio de planta de producción en México',
      'Búsqueda de ingeniero de calidad',
    ],
    summary:
      'Prospecto con requisitos de inocuidad; priorizar naves con áreas sanitarias y servicios.',
    suggestedActions: [
      'Confirmar requerimientos FDA / HACCP',
      'Proponer naves con cuarto frío opcional',
      'Solicitar volumen de producción mensual',
    ],
  },
  automotriz: {
    employeeCountEstimate: '500–2,000',
    revenueEstimateUsd: '$25M–$120M USD/año',
    investmentSignals: [
      'Tier 2 buscando localización cerca de OEM',
      'Inversión en maquinaria CNC',
    ],
    linkedInSignals: [
      'Apertura de centro de distribución regional',
      'Alianza con proveedor transfronterizo',
    ],
    summary:
      'Alto fit industrial: ticket elevado, plazos de entrega críticos y potencial multi-nave.',
    suggestedActions: [
      'Escalar a director comercial si m² > 5,000',
      'Preparar comparativo de 3 naves en corredor industrial',
      'Agendar tour con ingeniería de facilities',
    ],
  },
  default: {
    employeeCountEstimate: '80–350',
    revenueEstimateUsd: '$5M–$20M USD/año',
    investmentSignals: [
      'Búsqueda de espacio industrial en corredor central',
      'Señales de crecimiento en plantilla operativa',
    ],
    linkedInSignals: [
      'Actividad reciente en expansión de operaciones',
      'Perfil de compras / real estate corporativo activo',
    ],
    summary:
      'Prospecto calificable; requiere confirmar m², presupuesto y fecha de ocupación.',
    suggestedActions: [
      'Llamada de descubrimiento en las próximas 2 horas',
      'Registrar requerimientos de energía y altura libre',
      'Enviar dossier de disponibilidad por zona',
    ],
  },
};

const buildMockEnrichment = ({
  opportunityId,
  companyName,
  industryHint,
  m2Requeridos,
}: {
  opportunityId: string;
  companyName: string;
  industryHint?: string;
  m2Requeridos?: number;
}): ProspectEnrichmentResult => {
  const profileKey = resolveProspectIndustryKey(companyName, industryHint);
  const details = INDUSTRY_ENRICHMENT_DETAILS[profileKey];
  const score = prospectScoringService.compute({
    companyName,
    industryHint,
    m2Requeridos,
  });

  return {
    opportunityId,
    companyName,
    ...details,
    industry: score.industry,
    fitScore: score.fitScore,
    urgency: score.urgency,
    riskLevel:
      profileKey === 'logistica' || profileKey === 'automotriz'
        ? 'bajo'
        : profileKey === 'alimentos'
          ? 'medio'
          : 'medio',
    usedLlm: false,
    enrichedAt: new Date().toISOString(),
  };
};

const enrichWithOpenAi = async ({
  opportunityId,
  companyName,
  industryHint,
  m2Requeridos,
}: {
  opportunityId: string;
  companyName: string;
  industryHint?: string;
  m2Requeridos?: number;
}): Promise<ProspectEnrichmentResult | null> => {
  if (
    envConfig.openAiApiKey.trim().length === 0 ||
    envConfig.parksAiMock
  ) {
    return null;
  }

  try {
    const response = await axios.post<{
      choices: { message: { content: string } }[];
    }>(
      'https://api.openai.com/v1/chat/completions',
      {
        model: envConfig.openAiModel,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Eres analista comercial de parques industriales en México. Responde SOLO JSON válido con las claves: industry, employeeCountEstimate, revenueEstimateUsd, investmentSignals (array), linkedInSignals (array), fitScore (0-100), urgency (alta|media|baja), riskLevel (bajo|medio|alto), summary, suggestedActions (array).',
          },
          {
            role: 'user',
            content: `Enriquece prospecto: empresa="${companyName}", industria="${industryHint ?? 'desconocida'}", m2=${m2Requeridos ?? 'N/A'}.`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${envConfig.openAiApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000,
      },
    );

    const content = response.data.choices[0]?.message?.content;

    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content) as Omit<
      ProspectEnrichmentResult,
      'opportunityId' | 'companyName' | 'usedLlm' | 'enrichedAt'
    >;

    return {
      opportunityId,
      companyName,
      industry: parsed.industry ?? 'Manufactura',
      employeeCountEstimate: parsed.employeeCountEstimate ?? 'N/D',
      revenueEstimateUsd: parsed.revenueEstimateUsd ?? 'N/D',
      investmentSignals: parsed.investmentSignals ?? [],
      linkedInSignals: parsed.linkedInSignals ?? [],
      fitScore: parsed.fitScore ?? 70,
      urgency: parsed.urgency ?? 'media',
      riskLevel: parsed.riskLevel ?? 'medio',
      summary: parsed.summary ?? 'Análisis generado por IA.',
      suggestedActions: parsed.suggestedActions ?? [],
      usedLlm: true,
      enrichedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[prospect-enrichment] OpenAI fallback to mock:', message);

    return null;
  }
};

export const prospectEnrichmentService = {
  getCached: (opportunityId: string): ProspectEnrichmentResult | null =>
    enrichmentCache.get(opportunityId) ?? null,

  enrich: async ({
    opportunityId,
    companyName,
    industryHint,
    m2Requeridos,
  }: {
    opportunityId: string;
    companyName: string;
    industryHint?: string;
    m2Requeridos?: number;
  }): Promise<ProspectEnrichmentResult> => {
    const cached = enrichmentCache.get(opportunityId);

    if (cached) {
      return cached;
    }

    const llmResult = await enrichWithOpenAi({
      opportunityId,
      companyName,
      industryHint,
      m2Requeridos,
    });

    const result =
      llmResult ??
      buildMockEnrichment({
        opportunityId,
        companyName,
        industryHint,
        m2Requeridos,
      });

    enrichmentCache.set(opportunityId, result);

    return result;
  },
};
