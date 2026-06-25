import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { useParksObjectMetadataItem } from '@/parks-industrial/hooks/useParksObjectMetadataItem';

export const useParksRecordGqlFields = (
  objectNameSingular: string,
  depth: 0 | 1 = 1,
) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectMetadataItem, isParksMetadataReady } =
    useParksObjectMetadataItem(objectNameSingular);

  if (!isParksMetadataReady || !objectMetadataItem) {
    return { recordGqlFields: undefined, isParksMetadataReady: false };
  }

  return {
    recordGqlFields: generateDepthRecordGqlFieldsFromObject({
      objectMetadataItems,
      objectMetadataItem,
      depth,
      shouldOnlyLoadRelationIdentifiers: true,
    }),
    isParksMetadataReady: true,
  };
};
