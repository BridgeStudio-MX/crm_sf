import { t } from '@lingui/core/macro';
import { IconFileText } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksContratosList } from '@/parks-industrial/components/contratos/ParksContratosList';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { useParksCasosLegales } from '@/parks-industrial/hooks/useParksRecords';

const ParksContratosContent = () => {
  const { records, loading } = useParksCasosLegales();

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  return <ParksContratosList casosLegales={records} />;
};

export const ParksContratosPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Contratos en aprobación`}
      subtitle={t`Casos legales ordenados por prioridad y semáforo`}
      icon={<IconFileText size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="list">
        <ParksContratosContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
