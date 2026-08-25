import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const parksGuidedTourActiveState = createAtomState<boolean>({
  key: 'parksGuidedTourActiveState',
  defaultValue: false,
});

export const parksGuidedTourStepIndexState = createAtomState<number>({
  key: 'parksGuidedTourStepIndexState',
  defaultValue: 0,
});

// Session-scoped: which email already got the auto-start tour.
// Survives Parks page remounts; clears on logout so the next login restarts it.
export const parksGuidedTourAutoStartedEmailState = createAtomState<
  string | null
>({
  key: 'parksGuidedTourAutoStartedEmailState',
  defaultValue: null,
});
