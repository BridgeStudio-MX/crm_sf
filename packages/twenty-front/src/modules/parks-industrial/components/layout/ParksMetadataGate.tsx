import { type ReactNode } from 'react';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { useParksObjectMetadataItem } from '@/parks-industrial/hooks/useParksObjectMetadataItem';

type ParksMetadataGateProps = {
  children: ReactNode;
  loadingVariant?: 'dashboard' | 'list' | 'table';
};

export const ParksMetadataGate = ({
  children,
  loadingVariant = 'dashboard',
}: ParksMetadataGateProps) => {
  const { isParksMetadataReady } = useParksObjectMetadataItem('parque');

  if (!isParksMetadataReady) {
    return <ParksLoadingSkeleton variant={loadingVariant} />;
  }

  return children;
};
