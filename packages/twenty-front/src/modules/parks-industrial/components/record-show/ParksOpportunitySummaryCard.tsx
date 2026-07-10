import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { type ReactNode, useContext, useId } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Tag, TintedIconTile } from 'twenty-ui/data-display';
import { IconBuildingSkyscraper, useIcons } from 'twenty-ui/icon';
import { AppTooltip } from 'twenty-ui/surfaces';
import { type ThemeColor } from 'twenty-ui/theme';
import {
  MOBILE_VIEWPORT,
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { isFieldUuid } from '@/object-record/record-field/ui/types/guards/isFieldUuid';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierFamilySelector';
import { ParksPropertyImage } from '@/parks-industrial/components/ui/ParksPropertyImage';
import {
  getParksPipelineStageColor,
  getParksPipelineStageLabel,
} from '@/parks-industrial/constants/parks-industrial.constants';
import {
  formatParksNumber,
  formatParksUsd,
  getParksAmountFromMicros,
  getParksPipelineStageTheme,
} from '@/parks-industrial/utils/parks-format.util';
import { resolveParksNavePropertyImageUrl } from '@/parks-industrial/utils/parks-image.util';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

type ParksOpportunitySummaryCardProps = {
  objectRecordId: string;
  isInSidePanel: boolean;
};

type RelationSummary = {
  id?: string;
  label?: string;
  imageUrl?: string | null;
};

const StyledCard = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledImageSection = styled.div`
  position: relative;
`;

const StyledIconOverlay = styled.div`
  bottom: ${themeCssVariables.spacing[2]};
  box-shadow: ${themeCssVariables.boxShadow.light};
  left: ${themeCssVariables.spacing[3]};
  position: absolute;
`;

const StyledContentSection = styled.div<{ accentColor: string }>`
  background: linear-gradient(
    165deg,
    ${({ accentColor }) => accentColor}18 0%,
    ${themeCssVariables.background.primary} 68%
  );
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]}
      ${themeCssVariables.spacing[3]};
  }
`;

const StyledTitle = styled.div<{ isMobile: boolean }>`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  justify-content: ${({ isMobile }) => (isMobile ? 'flex-start' : 'center')};
  line-height: 1.25;
  width: 100%;
`;

const StyledFallbackTitle = styled.span`
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

const StyledMetaRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
`;

const StyledCompanyName = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledKpiRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const StyledKpiTile = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledKpiLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const StyledKpiValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledFooterRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
`;

const StyledDate = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledPipelineLink = styled(Link)`
  color: ${themeCssVariables.color.blue};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledNaveHint = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: 4px;
`;

const StyledSkeletonCard = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const ParksOpportunitySummaryCardSkeleton = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledSkeletonCard>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={4}
      >
        <Skeleton
          width="100%"
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.xl * 2.5}
        />
        <Skeleton width={180} height={SKELETON_LOADER_HEIGHT_SIZES.standard.m} />
        <Skeleton width={120} height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
      </SkeletonTheme>
    </StyledSkeletonCard>
  );
};

const getRelationSummary = (
  relationValue: unknown,
  labelKeys: string[],
  imageKey?: string,
): RelationSummary | null => {
  if (!isDefined(relationValue) || typeof relationValue !== 'object') {
    return null;
  }

  const relationRecord = relationValue as Record<string, unknown>;
  const label = labelKeys
    .map((labelKey) => relationRecord[labelKey])
    .find((value) => typeof value === 'string' && value.trim().length > 0) as
    | string
    | undefined;
  const id =
    typeof relationRecord.id === 'string' ? relationRecord.id : undefined;
  const imageUrl =
    imageKey !== undefined &&
    typeof relationRecord[imageKey] === 'string'
      ? (relationRecord[imageKey] as string)
      : null;

  if (!isDefined(label) && !isDefined(id)) {
    return null;
  }

  return {
    id,
    label,
    imageUrl,
  };
};

const getOpportunityAmountMicros = (amount: unknown): number | undefined => {
  if (!isDefined(amount) || typeof amount !== 'object') {
    return undefined;
  }

  const amountRecord = amount as { amountMicros?: unknown };
  return typeof amountRecord.amountMicros === 'number'
    ? amountRecord.amountMicros
    : undefined;
};

export const ParksOpportunitySummaryCard = ({
  objectRecordId,
  isInSidePanel,
}: ParksOpportunitySummaryCardProps) => {
  const { getIcon } = useIcons();
  const dateElementId = useId();
  const { recordLoading } = useRecordShowContainerData({
    objectRecordId,
  });
  const isMobile = useIsMobile() || isInSidePanel;
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const recordCreatedAt = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    {
      recordId: objectRecordId,
      fieldName: 'createdAt',
    },
  ) as string | null;
  const stage = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: objectRecordId,
    fieldName: 'stage',
  }) as string | null;
  const m2Requeridos = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: objectRecordId,
    fieldName: 'm2Requeridos',
  }) as number | null;
  const amount = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: objectRecordId,
    fieldName: 'amount',
  });
  const naveVinculada = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: objectRecordId,
    fieldName: 'naveVinculada',
  });
  const inquilinoVinculado = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    {
      recordId: objectRecordId,
      fieldName: 'inquilinoVinculado',
    },
  );
  const recordIdentifier = useAtomFamilySelectorValue(
    recordStoreIdentifierFamilySelector,
    {
      recordId: objectRecordId,
      allowRequestsToTwentyIcons,
    },
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'opportunity',
  });
  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular: 'opportunity',
    });
  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular: 'opportunity',
  });
  const isTitleReadOnly = useIsRecordFieldReadOnly({
    recordId: objectRecordId,
    fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
    objectMetadataId: objectMetadataItem.id,
  });

  const stageId = typeof stage === 'string' ? stage : null;
  const stageColor = getParksPipelineStageColor(stageId);
  const stageTheme = getParksPipelineStageTheme(stageColor);
  const stageLabel = getParksPipelineStageLabel(stageId);
  const naveSummary = getRelationSummary(naveVinculada, ['identificador'], 'fotoInmuebleUrl');
  const inquilinoSummary = getRelationSummary(inquilinoVinculado, [
    'empresa',
    'name',
  ]);
  const companyName = inquilinoSummary?.label ?? null;
  const propertyImageUrl = resolveParksNavePropertyImageUrl({
    fotoInmuebleUrl: naveSummary?.imageUrl,
    identificador: naveSummary?.label,
    recordId: naveSummary?.id ?? objectRecordId,
  });
  const OpportunityIcon = getIcon(objectMetadataItem.icon);
  const beautifiedCreatedAt =
    recordCreatedAt !== null && recordCreatedAt !== ''
      ? beautifyPastDateRelativeToNow(recordCreatedAt, localeCatalog)
      : '';
  const exactCreatedAt =
    recordCreatedAt !== null && recordCreatedAt !== ''
      ? beautifyExactDateTime(recordCreatedAt)
      : '';
  const fieldDefinition =
    labelIdentifierFieldMetadataItem !== undefined
      ? formatFieldMetadataItemAsFieldDefinition({
          field: labelIdentifierFieldMetadataItem,
          objectMetadataItem,
        })
      : null;
  const canUseRecordTitleCell =
    isDefined(fieldDefinition) &&
    (isFieldText(fieldDefinition) ||
      isFieldFullName(fieldDefinition) ||
      isFieldUuid(fieldDefinition));
  const fallbackTitle = recordIdentifier?.name ?? stageLabel;

  const titleNode: ReactNode = canUseRecordTitleCell ? (
    <FieldContext.Provider
      value={{
        recordId: objectRecordId,
        isLabelIdentifier: false,
        fieldDefinition,
        useUpdateRecord: useUpdateOneObjectRecordMutation,
        isCentered: !isMobile,
        isDisplayModeFixHeight: true,
        isRecordFieldReadOnly: isTitleReadOnly,
      }}
    >
      <RecordTitleCell
        sizeVariant="md"
        containerType={RecordTitleCellContainerType.ShowPage}
      />
    </FieldContext.Provider>
  ) : (
    <StyledFallbackTitle>{fallbackTitle}</StyledFallbackTitle>
  );

  if (recordLoading || !isDefined(recordCreatedAt)) {
    return <ParksOpportunitySummaryCardSkeleton />;
  }

  return (
    <StyledCard>
      <StyledImageSection>
        <ParksPropertyImage
          imageUrl={propertyImageUrl}
          alt={naveSummary?.label ?? stageLabel}
          fallbackLabel={naveSummary?.label ?? companyName ?? fallbackTitle}
          accentColor={stageTheme.background}
          height={isMobile ? 96 : 120}
          showBorderRadius={false}
        />
        <StyledIconOverlay>
          <TintedIconTile
            Icon={OpportunityIcon}
            color={stageColor as ThemeColor}
            size={36}
          />
        </StyledIconOverlay>
      </StyledImageSection>

      <StyledContentSection accentColor={stageTheme.accent}>
        <StyledTitle isMobile={isMobile}>{titleNode}</StyledTitle>

        <StyledMetaRow>
          <Tag
            color={stageColor as ThemeColor}
            text={stageLabel}
            variant="solid"
            weight="medium"
          />
          {companyName ? (
            <StyledCompanyName>{companyName}</StyledCompanyName>
          ) : null}
        </StyledMetaRow>

        <StyledKpiRow>
          <StyledKpiTile>
            <StyledKpiLabel>
              <Trans>Valor</Trans>
            </StyledKpiLabel>
            <StyledKpiValue>
              {formatParksUsd(getParksAmountFromMicros(getOpportunityAmountMicros(amount)))}
            </StyledKpiValue>
          </StyledKpiTile>
          <StyledKpiTile>
            <StyledKpiLabel>
              <Trans>Espacio</Trans>
            </StyledKpiLabel>
            <StyledKpiValue>
              {formatParksNumber(
                typeof m2Requeridos === 'number' ? m2Requeridos : null,
              )}{' '}
              m²
            </StyledKpiValue>
          </StyledKpiTile>
        </StyledKpiRow>

        <StyledFooterRow>
          {naveSummary?.label ? (
            <StyledNaveHint>
              <IconBuildingSkyscraper size={12} />
              {naveSummary.label}
            </StyledNaveHint>
          ) : null}
          {beautifiedCreatedAt ? (
            <StyledDate id={dateElementId}>
              <Trans>Added {beautifiedCreatedAt}</Trans>
            </StyledDate>
          ) : null}
          <StyledPipelineLink to={AppPath.ParksPipeline}>
            <Trans>Ver pipeline →</Trans>
          </StyledPipelineLink>
        </StyledFooterRow>

        {exactCreatedAt ? (
          <AppTooltip
            anchorSelect={`#${CSS.escape(dateElementId)}`}
            content={exactCreatedAt}
            clickable
            noArrow
            place="right"
          />
        ) : null}
      </StyledContentSection>
    </StyledCard>
  );
};
