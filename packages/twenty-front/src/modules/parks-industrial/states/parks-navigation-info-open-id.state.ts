import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Only one nav module info popover open at a time (avoids overlap).
export const parksNavigationInfoOpenIdState = createAtomState<string | null>({
  key: 'parksNavigationInfoOpenIdState',
  defaultValue: null,
});
