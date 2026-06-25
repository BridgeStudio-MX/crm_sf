import { t } from '@lingui/core/macro';
import { IconCoins } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksComisionesTable } from '@/parks-industrial/components/comisiones/ParksComisionesTable';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { useParksComisiones } from '@/parks-industrial/hooks/useParksRecords';

const ParksComisionesContent = () => {
  const { records, loading } = useParksComisiones();

  if (loading) {
    return <ParksLoadingSkeleton variant="table" />;
  }

  return <ParksComisionesTable comisiones={records} />;
};

export const ParksComisionesPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Motor de comisiones`}
      subtitle={t`Control de pagos a brokers y comisiones pendientes`}
      icon={<IconCoins size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="table">
        <ParksComisionesContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
