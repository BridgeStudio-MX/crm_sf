import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { PARKS_INDUSTRIAL_TENANT_NAME } from '@/parks-industrial/constants/parks-tenant.constants';
import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { isDefined } from 'twenty-shared/utils';

export const getTimelineActivityAuthorFullName = (
  event: TimelineActivity,
  currentWorkspaceMember: CurrentWorkspaceMember,
) => {
  if (isDefined(event.workspaceMember)) {
    return currentWorkspaceMember.id === event.workspaceMember.id
      ? 'You'
      : `${event.workspaceMember?.name.firstName} ${event.workspaceMember?.name.lastName}`;
  }
  return PARKS_INDUSTRIAL_TENANT_NAME;
};
