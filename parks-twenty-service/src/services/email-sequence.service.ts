import { brokerNotificationStore } from './broker-notification.store';
import { prospectScoringService } from './prospect-scoring.service';

export type EmailSequenceStepStatus = 'scheduled' | 'sent';

export type EmailSequenceStep = {
  stepNumber: number;
  subject: string;
  scheduledIn: string;
  status: EmailSequenceStepStatus;
  preview: string;
};

export type EmailSequenceResult = {
  opportunityId: string;
  companyName: string;
  industry: string;
  steps: EmailSequenceStep[];
};

const sequenceStore = new Map<string, EmailSequenceResult>();

const buildSteps = ({
  companyName,
  industry,
}: {
  companyName: string;
  industry: string;
}): EmailSequenceStep[] => [
  {
    stepNumber: 1,
    subject: `Bienvenida industrial — ${companyName}`,
    scheduledIn: 'Inmediato',
    status: 'sent',
    preview:
      'Presentación de Parks Industrial, disponibilidad por corredor y CTA para agendar visita.',
  },
  {
    stepNumber: 2,
    subject: `Caso de éxito en ${industry}`,
    scheduledIn: 'Día 3',
    status: 'scheduled',
    preview:
      'Historia de cliente similar, métricas de ocupación y ahorro logístico en el parque.',
  },
  {
    stepNumber: 3,
    subject: 'Disponibilidad actualizada + ficha técnica',
    scheduledIn: 'Día 7',
    status: 'scheduled',
    preview:
      'Shortlist de naves con m², energía y link a ficha rastreable para el prospecto.',
  },
];

export const emailSequenceService = {
  getForOpportunity: ({
    opportunityId,
    companyName,
    industryHint,
  }: {
    opportunityId: string;
    companyName: string;
    industryHint?: string;
  }): EmailSequenceResult => {
    const cached = sequenceStore.get(opportunityId);

    if (cached) {
      return cached;
    }

    const score = prospectScoringService.compute({
      companyName,
      industryHint,
    });

    const result: EmailSequenceResult = {
      opportunityId,
      companyName,
      industry: score.industry,
      steps: buildSteps({
        companyName,
        industry: score.industry,
      }),
    };

    sequenceStore.set(opportunityId, result);

    return result;
  },

  scheduleForNewLead: ({
    opportunityId,
    companyName,
    industryHint,
  }: {
    opportunityId: string;
    companyName: string;
    industryHint?: string;
  }): EmailSequenceResult => {
    const sequence = emailSequenceService.getForOpportunity({
      opportunityId,
      companyName,
      industryHint,
    });

    for (const step of sequence.steps) {
      brokerNotificationStore.add({
        type: 'email',
        priority: step.stepNumber === 1 ? 'normal' : 'low',
        title: `Email ${step.stepNumber}/3 — ${step.subject}`,
        body: `${step.scheduledIn}: ${step.preview}`,
        area: 'Marketing',
        opportunityId,
        opportunityName: companyName,
      });
    }

    return sequence;
  },
};
