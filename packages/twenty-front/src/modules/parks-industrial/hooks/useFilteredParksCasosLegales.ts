import { useMemo } from 'react';

import { isParksLegalCasoActivo } from '@/parks-industrial/constants/parks-legal-workflow.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import {
  type ParksCasoLegalRecord,
  useParksCasosLegales,
} from '@/parks-industrial/hooks/useParksRecords';
import { filterParksCasosLegalesForAssignedLawyer } from '@/parks-industrial/utils/parks-role-access.util';

type UseFilteredParksCasosLegalesReturn = {
  records: ParksCasoLegalRecord[];
  loading: boolean;
};

export const useFilteredParksCasosLegales =
  (): UseFilteredParksCasosLegalesReturn => {
    const { records, loading } = useParksCasosLegales();
    const { assignedLawyerName, assignedLawyerMatchNames, isAssignedLawyerOnly } =
      useParksAccess();

    const filteredRecords = useMemo(
      () =>
        filterParksCasosLegalesForAssignedLawyer({
          casosLegales: records.filter((casoLegal) =>
            isParksLegalCasoActivo(casoLegal.estatus),
          ),
          assignedLawyerName,
          assignedLawyerMatchNames,
          isAssignedLawyerOnly,
        }),
      [
        assignedLawyerMatchNames,
        assignedLawyerName,
        isAssignedLawyerOnly,
        records,
      ],
    );

    return {
      records: filteredRecords,
      loading,
    };
  };
