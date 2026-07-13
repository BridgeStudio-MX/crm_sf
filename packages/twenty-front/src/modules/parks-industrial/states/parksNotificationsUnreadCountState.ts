import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const parksNotificationsUnreadCountState = createAtomState<number>({
  key: 'parksNotificationsUnreadCountState',
  defaultValue: 0,
});
