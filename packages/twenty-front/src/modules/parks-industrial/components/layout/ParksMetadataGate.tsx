import { type ReactNode } from 'react';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { useParksObjectMetadataItem } from '@/parks-industrial/hooks/useParksObjectMetadataItem';

type ParksMetadataGateProps = {
  children: ReactNode;
  loadingVariant?: 'dashboard' | 'list' | 'table';
  objectNameSingular?: string;
};

export const ParksMetadataGate = ({
  children,
  loadingVariant = 'dashboard',
  objectNameSingular = 'parque',
}: ParksMetadataGateProps) => {
  const { isParksMetadataReady } =
    useParksObjectMetadataItem(objectNameSingular);

  if (!isParksMetadataReady) {
    return <ParksLoadingSkeleton variant={loadingVariant} />;
  }

  return children;
};
