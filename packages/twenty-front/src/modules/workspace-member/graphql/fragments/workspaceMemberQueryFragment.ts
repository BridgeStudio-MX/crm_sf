import { gql } from '@apollo/client';

import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';

export const WORKSPACE_MEMBER_QUERY_FRAGMENT = gql`
  fragment WorkspaceMemberQueryFragment on WorkspaceMember {
    id
    name {
      firstName
      lastName
    }
    colorScheme
    avatarUrl
    locale
    userEmail
    userWorkspaceId
    timeZone
    dateFormat
    timeFormat
    calendarStartDay
    numberFormat
    roles {
      ...RoleFragment
    }
  }

  ${ROLE_FRAGMENT}
`;
