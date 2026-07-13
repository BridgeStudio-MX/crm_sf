import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import {
  IconMail,
  IconPhone,
  IconCheckbox,
  IconCalendarEvent,
} from 'twenty-ui/icon';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { fetchParksActivityTimeline } from '@/parks-industrial/services/parks-commercial.client';
import {
  type ActivityTimelineEntry,
  type ActivityTimelineResult,
} from '@/parks-industrial/types/parks-commercial.types';

const StyledTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledEntry = styled.div`
  border-left: 3px solid ${themeCssVariables.color.blue3};
  padding-left: ${themeCssVariables.spacing[3]};
`;

const StyledEntryHeader = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledEntryTitle = styled.strong`
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledEntryMeta = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledEntrySummary = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: ${themeCssVariables.spacing[1]} 0 0;
`;

const resolveEntryIcon = (
  type: ActivityTimelineEntry['type'],
): IconComponent => {
  if (type === 'email') {
    return IconMail;
  }

  if (type === 'call') {
    return IconPhone;
  }

  if (type === 'task') {
    return IconCheckbox;
  }

  return IconCalendarEvent;
};

type ParksActivityTimelinePanelProps = {
  opportunityId: string;
  embedded?: boolean;
};

export const ParksActivityTimelinePanel = ({
  opportunityId,
  embedded = false,
}: ParksActivityTimelinePanelProps) => {
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<ActivityTimelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadTimeline = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchParksActivityTimeline(opportunityId);

        if (!cancelled) {
          setTimeline(result);
        }
      } catch (timelineError) {
        if (!cancelled) {
          const message =
            timelineError instanceof Error
              ? timelineError.message
              : 'No se pudo cargar actividad';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadTimeline();

    return () => {
      cancelled = true;
    };
  }, [opportunityId]);

  const content = (
    <>
      {timeline?.gmailConnected ? (
        <ParksStatusBadge color="green" label={t`Gmail conectado · timeline unificado`} />
      ) : null}

      {loading ? <ParksLoadingSkeleton variant="list" /> : null}

      {timeline ? (
        <StyledTimeline>
          {timeline.entries.map((entry) => {
            const EntryIcon = resolveEntryIcon(entry.type);

            return (
              <StyledEntry key={entry.id}>
                <StyledEntryHeader>
                  <StyledEntryTitle>
                    <EntryIcon size={14} /> {entry.subject}
                  </StyledEntryTitle>
                  <StyledEntryMeta>
                    {formatDistanceToNow(parseISO(entry.occurredAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </StyledEntryMeta>
                </StyledEntryHeader>
                <StyledEntryMeta>
                  {entry.participant} · {entry.source} · {entry.direction}
                </StyledEntryMeta>
                <StyledEntrySummary>{entry.summary}</StyledEntrySummary>
              </StyledEntry>
            );
          })}
        </StyledTimeline>
      ) : null}

      {error ? <ParksStatusBadge color="red" label={error} /> : null}
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <ParksSectionCard title={t`Actividad (Gmail + CRM)`}>
      {content}
    </ParksSectionCard>
  );
};
