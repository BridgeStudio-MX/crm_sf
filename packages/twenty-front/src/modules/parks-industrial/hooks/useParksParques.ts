import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useParksObjectMetadataItem } from '@/parks-industrial/hooks/useParksObjectMetadataItem';
import { useParksRecordGqlFields } from '@/parks-industrial/hooks/useParksRecordGqlFields';

export type ParksParqueRecord = ObjectRecord & {
  nombre?: string;
  ubicacion?: string;
  m2Totales?: number;
  m2Rentados?: number;
  fotoEntradaUrl?: string;
};

export const useParksParques = () => {
  const { isParksMetadataReady } = useParksObjectMetadataItem('parque');
  const { recordGqlFields } = useParksRecordGqlFields('parque', 1);

  return useFindManyRecords<ParksParqueRecord>({
    objectNameSingular: 'parque',
    recordGqlFields,
    limit: 50,
    orderBy: [{ nombre: 'AscNullsLast' }],
    skip: !isParksMetadataReady,
  });
};

export const useParksFirstParqueId = (): string | undefined => {
  const { records } = useParksParques();

  const bajioParque = records.find((parque) =>
    parque.nombre?.includes('Bajío'),
  );

  return bajioParque?.id ?? records[0]?.id;
};
