import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppPath } from 'twenty-shared/types';
import { Link } from 'react-router-dom';
import {
  IconBell,
  IconMail,
  IconSparkles,
  IconAlertTriangle,
  IconCheckbox,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { useParksNotifications } from '@/parks-industrial/hooks/useParksNotifications';
import { type BrokerNotification } from '@/parks-industrial/types/parks-commercial.types';

const StyledHero = styled.div`
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.purple1} 0%,
    ${themeCssVariables.background.primary} 60%,
    ${themeCssVariables.color.blue1} 100%
  );
  border: 1px solid ${themeCssVariables.color.purple3};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeroTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing[2]};
`;

const StyledHeroText = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  margin: 0;
  max-width: 720px;
`;

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNotificationCard = styled.button<{ isRead: boolean }>`
  background: ${({ isRead }) =>
    isRead
      ? themeCssVariables.background.primary
      : themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: auto 1fr auto;
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  width: 100%;

  &:hover {
    border-color: ${themeCssVariables.border.color.strong};
  }
`;

const StyledIconWrap = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  height: 36px;
  justify-content: center;
  width: 36px;
`;

const StyledTitle = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledBody = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledDealLink = styled(Link)`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  text-decoration: underline;
`;

const resolveNotificationIcon = (notification: BrokerNotification) => {
  switch (notification.type) {
    case 'enrichment':
      return IconSparkles;
    case 'email':
      return IconMail;
    case 'alert':
      return IconAlertTriangle;
    case 'task':
      return IconCheckbox;
    default:
      return IconBell;
  }
};

const resolvePriorityColor = (
  priority: BrokerNotification['priority'],
): 'red' | 'yellow' | 'gray' => {
  if (priority === 'high') {
    return 'red';
  }

  if (priority === 'normal') {
    return 'yellow';
  }

  return 'gray';
};

export const ParksNotificacionesContent = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  } = useParksNotifications();

  const emailNotifications = notifications.filter(
    (notification) => notification.type === 'email',
  );
  const otherNotifications = notifications.filter(
    (notification) => notification.type !== 'email',
  );

  const handleNotificationClick = (notification: BrokerNotification) => {
    if (!notification.read) {
      void markRead(notification.id);
    }
  };

  return (
    <StyledParksPageStack>
      <StyledHero>
        <StyledHeroTitle>{t`Centro de notificaciones del broker`}</StyledHeroTitle>
        <StyledHeroText>
          {t`Tareas automáticas, enriquecimiento IA y alertas comerciales en un solo lugar. Se actualiza cada 30 segundos.`}
        </StyledHeroText>
      </StyledHero>

      <StyledToolbar>
        <ParksStatusBadge
          color={unreadCount > 0 ? 'yellow' : 'green'}
          label={t`${unreadCount} sin leer`}
        />
        <div style={{ display: 'flex', gap: themeCssVariables.spacing[2] }}>
          <Button
            variant="secondary"
            title={t`Actualizar`}
            onClick={() => void refresh()}
          />
          <Button
            variant="primary"
            title={t`Marcar todo leído`}
            onClick={() => void markAllRead()}
            disabled={unreadCount === 0}
          />
        </div>
      </StyledToolbar>

      {loading ? <ParksLoadingSkeleton variant="list" /> : null}

      {!loading && error ? (
        <ParksEmptyState
          title={t`Servicio no disponible`}
          description={error}
        />
      ) : null}

      {!loading && !error && notifications.length === 0 ? (
        <ParksEmptyState
          title={t`Sin notificaciones`}
          description={t`Crea un lead en Prospecto nuevo para disparar tareas y enriquecimiento IA.`}
        />
      ) : null}

      {!loading && !error && notifications.length > 0 ? (
        <>
          {emailNotifications.length > 0 ? (
            <ParksSectionCard title={t`Secuencia nurture (emails)`}>
              <StyledList>
                {emailNotifications.map((notification) => {
                  const NotificationIcon = resolveNotificationIcon(notification);
                  const timeAgo = formatDistanceToNow(
                    parseISO(notification.createdAt),
                    { addSuffix: true, locale: es },
                  );

                  return (
                    <StyledNotificationCard
                      key={notification.id}
                      type="button"
                      isRead={notification.read}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <StyledIconWrap>
                        <NotificationIcon size={18} />
                      </StyledIconWrap>
                      <div>
                        <StyledTitle>{notification.title}</StyledTitle>
                        <StyledBody>{notification.body}</StyledBody>
                        <StyledMeta>
                          {notification.area ? (
                            <span>{notification.area}</span>
                          ) : null}
                          <span>{timeAgo}</span>
                        </StyledMeta>
                      </div>
                      <ParksStatusBadge
                        color={resolvePriorityColor(notification.priority)}
                        label={notification.read ? t`Leída` : t`Nueva`}
                      />
                    </StyledNotificationCard>
                  );
                })}
              </StyledList>
            </ParksSectionCard>
          ) : null}

          {otherNotifications.length > 0 ? (
            <ParksSectionCard title={t`Actividad reciente`}>
              <StyledList>
                {otherNotifications.map((notification) => {
                  const NotificationIcon = resolveNotificationIcon(notification);
                  const timeAgo = formatDistanceToNow(
                    parseISO(notification.createdAt),
                    { addSuffix: true, locale: es },
                  );

                  return (
                    <StyledNotificationCard
                      key={notification.id}
                      type="button"
                      isRead={notification.read}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <StyledIconWrap>
                        <NotificationIcon size={18} />
                      </StyledIconWrap>
                      <div>
                        <StyledTitle>{notification.title}</StyledTitle>
                        <StyledBody>{notification.body}</StyledBody>
                        <StyledMeta>
                          {notification.area ? (
                            <span>{notification.area}</span>
                          ) : null}
                          <span>{timeAgo}</span>
                          {notification.opportunityId ? (
                            <StyledDealLink
                              to={AppPath.ParksPipeline}
                              onClick={(event) => event.stopPropagation()}
                            >
                              {t`Ver en pipeline`}
                            </StyledDealLink>
                          ) : null}
                        </StyledMeta>
                      </div>
                      <ParksStatusBadge
                        color={resolvePriorityColor(notification.priority)}
                        label={notification.read ? t`Leída` : t`Nueva`}
                      />
                    </StyledNotificationCard>
                  );
                })}
              </StyledList>
            </ParksSectionCard>
          ) : null}
        </>
      ) : null}
    </StyledParksPageStack>
  );
};
