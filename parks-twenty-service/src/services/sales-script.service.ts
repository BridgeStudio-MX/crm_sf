import axios from 'axios';

import { envConfig } from '../config/env.config';
import { type SalesScriptResult } from '../types/commercial.types';

const SCRIPT_TEMPLATES: Record<
  string,
  Omit<SalesScriptResult, 'opportunityId' | 'companyName' | 'industry' | 'usedLlm' | 'generatedAt'>
> = {
  logistica: {
    scriptTitle: 'Guion — Logística y distribución',
    openingLine:
      'Buen día, le contacto de Parks Industrial. Vi que están evaluando espacio para operaciones logísticas y tengo opciones con patio de maniobras y andén.',
    discoveryQuestions: [
      '¿Qué m² necesitan para almacén vs. área de despacho?',
      '¿Requieren muelles nivel camión o rampa?',
      '¿Cuál es su fecha objetivo de ocupación?',
      '¿Operan turnos extendidos (energía trifásica)?',
    ],
    valueProposition:
      'Nuestras naves en corredor Bajío reducen tiempos de última milla hacia Guadalajara, Querétaro y CDMX, con disponibilidad inmediata y renta en USD/m².',
    visitAgenda: [
      'Recorrido de andenes y circulación de trailers',
      'Validar altura libre y capacidad de piso',
      'Revisar accesos y seguridad perimetral',
    ],
    closingLine:
      '¿Le parece agendar una visita esta semana? Le envío ficha técnica con m², precio y plano.',
  },
  automotriz: {
    scriptTitle: 'Guion — Automotriz y autopartes',
    openingLine:
      'Le saludo de Parks Industrial. Entiendo que buscan localización cerca de su cadena de suministro automotriz.',
    discoveryQuestions: [
      '¿Es planta de ensamble, almacén de secuencia o centro de distribución?',
      '¿Qué certificaciones requieren en el inmueble (IATF, ISO)?',
      '¿Necesitan ampliación futura en el mismo parque?',
    ],
    valueProposition:
      'Tenemos naves con claros industriales altos, energía robusta y proximidad a OEMs en el centro del país.',
    visitAgenda: [
      'Recorrido con ingeniería de planta',
      'Validar cargas de piso y layout de producción',
      'Revisar servicios y subestación eléctrica',
    ],
    closingLine:
      'Propongo una visita técnica con su equipo de facilities. ¿Martes o jueves le funciona?',
  },
  alimentos: {
    scriptTitle: 'Guion — Alimentos y bebidas',
    openingLine:
      'Le contacto de Parks Industrial. Sé que en alimentos la inocuidad y servicios sanitarios son críticos al elegir nave.',
    discoveryQuestions: [
      '¿Procesan producto refrigerado o seco?',
      '¿Qué normas deben cumplir (SQF, HACCP, FDA)?',
      '¿Requieren áreas segregadas o cuarto frío?',
    ],
    valueProposition:
      'Podemos proponer naves con infraestructura adaptable a líneas de producción alimentaria y servicios de agua/drenaje industrial.',
    visitAgenda: [
      'Recorrido de áreas de producción potenciales',
      'Revisar servicios y ventilación',
      'Validar accesos para inspección sanitaria',
    ],
    closingLine:
      '¿Le envío ficha técnica y agendamos visita con su responsable de calidad?',
  },
  default: {
    scriptTitle: 'Guion comercial — Manufactura',
    openingLine:
      'Buen día, le contacto de Parks Industrial respecto a su búsqueda de espacio industrial.',
    discoveryQuestions: [
      '¿Qué m² requiere y para qué operación?',
      '¿Cuál es su presupuesto objetivo USD/m²?',
      '¿En qué plazo necesitan ocupar?',
    ],
    valueProposition:
      'Contamos con naves disponibles en corredores industriales clave con renta competitiva y soporte FUNO.',
    visitAgenda: [
      'Recorrido general de la nave',
      'Revisión de servicios e infraestructura',
      'Sesión de preguntas con el broker',
    ],
    closingLine:
      '¿Le comparto ficha técnica y coordinamos visita esta semana?',
  },
};

const resolveIndustryKey = (industry: string): keyof typeof SCRIPT_TEMPLATES => {
  const normalized = industry.toLowerCase();

  if (normalized.includes('logistic') || normalized.includes('logística')) {
    return 'logistica';
  }

  if (normalized.includes('automotriz') || normalized.includes('auto')) {
    return 'automotriz';
  }

  if (normalized.includes('alimento') || normalized.includes('food')) {
    return 'alimentos';
  }

  return 'default';
};

const buildMockScript = ({
  opportunityId,
  companyName,
  industry,
  m2Requeridos,
  naveDestacada,
}: {
  opportunityId?: string;
  companyName: string;
  industry: string;
  m2Requeridos?: number;
  naveDestacada?: string;
}): SalesScriptResult => {
  const template = SCRIPT_TEMPLATES[resolveIndustryKey(industry)];
  const m2Line = m2Requeridos
    ? ` Entiendo que buscan aproximadamente ${m2Requeridos.toLocaleString('es-MX')} m².`
    : '';
  const naveLine = naveDestacada
    ? ` Tengo especialmente ${naveDestacada} como opción prioritaria.`
    : '';

  return {
    opportunityId,
    companyName,
    industry,
    ...template,
    openingLine: `Hola, ¿hablo con ${companyName}? ${template.openingLine}${m2Line}${naveLine}`,
    usedLlm: false,
    generatedAt: new Date().toISOString(),
  };
};

export const salesScriptService = {
  generate: async ({
    opportunityId,
    companyName,
    industry,
    m2Requeridos,
    naveDestacada,
  }: {
    opportunityId?: string;
    companyName: string;
    industry: string;
    m2Requeridos?: number;
    naveDestacada?: string;
  }): Promise<SalesScriptResult> => {
    if (
      envConfig.openAiApiKey.trim().length === 0 ||
      envConfig.parksAiMock
    ) {
      return buildMockScript({
        opportunityId,
        companyName,
        industry,
        m2Requeridos,
        naveDestacada,
      });
    }

    try {
      const response = await axios.post<{
        choices: { message: { content: string } }[];
      }>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: envConfig.openAiModel,
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'Genera guiones comerciales B2B para arrendamiento industrial en México. Responde JSON con: scriptTitle, openingLine, discoveryQuestions (array), valueProposition, visitAgenda (array), closingLine. Español México, tono profesional.',
            },
            {
              role: 'user',
              content: `Empresa: ${companyName}, industria: ${industry}, m2: ${m2Requeridos ?? 'N/A'}, nave sugerida: ${naveDestacada ?? 'N/A'}`,
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
        throw new Error('Empty LLM response');
      }

      const parsed = JSON.parse(content) as Omit<
        SalesScriptResult,
        'opportunityId' | 'companyName' | 'industry' | 'usedLlm' | 'generatedAt'
      >;

      return {
        opportunityId,
        companyName,
        industry,
        ...parsed,
        usedLlm: true,
        generatedAt: new Date().toISOString(),
      };
    } catch {
      return buildMockScript({
        opportunityId,
        companyName,
        industry,
        m2Requeridos,
        naveDestacada,
      });
    }
  },
};
