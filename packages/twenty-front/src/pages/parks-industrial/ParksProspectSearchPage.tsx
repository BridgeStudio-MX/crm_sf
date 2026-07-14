import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import {
  IconBuildingWarehouse,
  IconSearch,
  IconUsers,
} from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksProspectSearchContent } from '@/parks-industrial/components/prospectos/ParksProspectSearchContent';
import { ParksProspectsListContent } from '@/parks-industrial/components/prospectos/ParksProspectsListContent';
import { ParksPageTabs } from '@/parks-industrial/components/ui/ParksPageTabs';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

type ProspectosTab = 'prospectos' | 'clientes' | 'matching';

const StyledTabsWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const ParksProspectSearchPage = () => {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState<ProspectosTab>('prospectos');

  return (
    <ParksPageShell
      title={t`Prospectos`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Todos los prospectos por etapa, clientes firmados y matching de inventario`,
      )}
      icon={<IconUsers size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="dashboard">
        <StyledTabsWrap>
          <ParksPageTabs
            ariaLabel={t`Vistas de prospectos`}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={[
              {
                id: 'prospectos',
                label: t`Prospectos`,
                icon: IconUsers,
              },
              {
                id: 'clientes',
                label: t`Clientes`,
                icon: IconBuildingWarehouse,
              },
              {
                id: 'matching',
                label: t`Matching inventario`,
                icon: IconSearch,
              },
            ]}
          >
            {activeTab === 'prospectos' ? (
              <ParksProspectsListContent variant="prospectos" />
            ) : null}
            {activeTab === 'clientes' ? (
              <ParksProspectsListContent variant="clientes" />
            ) : null}
            {activeTab === 'matching' ? <ParksProspectSearchContent /> : null}
          </ParksPageTabs>
        </StyledTabsWrap>
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
