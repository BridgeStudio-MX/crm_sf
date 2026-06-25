import { useCallback } from 'react';
import { t } from '@lingui/core/macro';

import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { type ParksNaveRecord } from '@/parks-industrial/hooks/useParksRecords';
import { isParksNaveDisponible } from '@/parks-industrial/utils/parks-portfolio-metrics.util';

type UseParksReserveNaveArgs = {
  parqueNombre?: string;
};

export const useParksReserveNave = ({ parqueNombre }: UseParksReserveNaveArgs) => {
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: 'opportunity',
  });
  const { updateOneRecord } = useUpdateOneRecord();

  const getDisponibleNavesInParque = useCallback(
    (naves: ParksNaveRecord[], parqueId: string) =>
      naves.filter(
        (nave) =>
          nave.parqueId === parqueId && isParksNaveDisponible(nave.estatus),
      ),
    [],
  );

  const reserveNave = useCallback(
    async (nave: ParksNaveRecord) => {
      const opportunity = await createOneRecord({
        name: t`Reserva — ${nave.identificador ?? t`Nave`}${parqueNombre ? ` · ${parqueNombre}` : ''}`,
        stage: 'EN_NEGOCIACION',
        m2Requeridos: nave.m2 ?? 0,
        naveVinculadaId: nave.id,
        tipoOperacion: 'Arrendamiento nuevo',
        canalOrigen: 'Directo',
      });

      await updateOneRecord({
        objectNameSingular: 'nave',
        idToUpdate: nave.id,
        updateOneRecordInput: { estatus: 'En negociación' },
      });

      return opportunity;
    },
    [createOneRecord, parqueNombre, updateOneRecord],
  );

  return {
    getDisponibleNavesInParque,
    reserveNave,
  };
};
