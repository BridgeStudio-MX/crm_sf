import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useEffect, useState } from 'react';
import { IconBriefcase, IconUsers } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksBrokersTable } from '@/parks-industrial/components/brokers/ParksBrokersTable';
import { ParksEmpresasBrokerTable } from '@/parks-industrial/components/brokers/ParksEmpresasBrokerTable';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksPageTabs } from '@/parks-industrial/components/ui/ParksPageTabs';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import {
  fetchParksBrokers,
  fetchParksEmpresasBroker,
  type ParksBroker,
  type ParksEmpresaBroker,
} from '@/parks-industrial/services/parks-commercial.client';

type ParksBrokersTab = 'empresas' | 'brokers';

const StyledTabsWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ParksEmpresasBrokerContent = () => {
  const [empresas, setEmpresas] = useState<ParksEmpresaBroker[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchParksEmpresasBroker()
      .then((result) => {
        if (!cancelled) {
          setEmpresas(result);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : t`No se pudo cargar el directorio de empresas de brokers`,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (errorMessage) {
    return (
      <ParksEmptyState
        title={t`No se pudo cargar el directorio de empresas de brokers`}
        description={errorMessage}
      />
    );
  }

  if (!empresas) {
    return <ParksLoadingSkeleton variant="table" />;
  }

  return (
    <ParksEmpresasBrokerTable
      empresas={empresas}
      onEmpresasChanged={setEmpresas}
    />
  );
};

const ParksBrokersContent = () => {
  const [brokers, setBrokers] = useState<ParksBroker[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchParksBrokers()
      .then((result) => {
        if (!cancelled) {
          setBrokers(result);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : t`No se pudo cargar el directorio de brokers`,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (errorMessage) {
    return (
      <ParksEmptyState
        title={t`No se pudo cargar el directorio de brokers`}
        description={errorMessage}
      />
    );
  }

  if (!brokers) {
    return <ParksLoadingSkeleton variant="table" />;
  }

  return <ParksBrokersTable brokers={brokers} onBrokersChanged={setBrokers} />;
};

export const ParksBrokersPage = () => {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState<ParksBrokersTab>('empresas');

  return (
    <ParksPageShell
      title={t`Brokers`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Empresas de brokers, sus brokers individuales y comisiones externas`,
      )}
      icon={<IconUsers size={theme.icon.size.md} />}
    >
      <StyledTabsWrap>
        <ParksPageTabs
          ariaLabel={t`Vistas de brokers`}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            {
              id: 'empresas',
              label: t`Empresas`,
              icon: IconBriefcase,
            },
            {
              id: 'brokers',
              label: t`Brokers`,
              icon: IconUsers,
            },
          ]}
        >
          {activeTab === 'empresas' ? <ParksEmpresasBrokerContent /> : null}
          {activeTab === 'brokers' ? <ParksBrokersContent /> : null}
        </ParksPageTabs>
      </StyledTabsWrap>
    </ParksPageShell>
  );
};
