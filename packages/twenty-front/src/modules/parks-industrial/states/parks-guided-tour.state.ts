import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const parksGuidedTourActiveState = createAtomState<boolean>({
  key: 'parksGuidedTourActiveState',
  defaultValue: false,
});

export const parksGuidedTourStepIndexState = createAtomState<number>({
  key: 'parksGuidedTourStepIndexState',
  defaultValue: 0,
});

export const parksGuidedTourCompletedEmailsState = createAtomState<
  Record<string, boolean>
>({
  key: 'parksGuidedTourCompletedEmailsState',
  defaultValue: {},
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
