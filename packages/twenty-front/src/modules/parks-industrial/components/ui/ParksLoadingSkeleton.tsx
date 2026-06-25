import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { MOBILE_VIEWPORT, ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const StyledMapSkeleton = styled.div`
  display: grid;
  min-height: clamp(480px, calc(100dvh - 320px), 720px);

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: minmax(0, 1.65fr) minmax(300px, 380px);
  }
`;

const StyledMapSkeletonSidebar = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    border-left: 1px solid ${themeCssVariables.border.color.medium};
    border-top: none;
  }
`;

type ParksLoadingSkeletonProps = {
  variant?: 'dashboard' | 'list' | 'table' | 'map';
};

export const ParksLoadingSkeleton = ({
  variant = 'dashboard',
}: ParksLoadingSkeletonProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      {variant === 'dashboard' ? (
        <StyledBlock>
          <StyledGrid>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                height={96}
                borderRadius={theme.border.radius.md}
              />
            ))}
          </StyledGrid>
          <Skeleton height={280} borderRadius={theme.border.radius.md} />
        </StyledBlock>
      ) : null}
      {variant === 'list' ? (
        <StyledBlock>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.xl}
              borderRadius={theme.border.radius.md}
            />
          ))}
        </StyledBlock>
      ) : null}
      {variant === 'table' ? (
        <StyledBlock>
          <Skeleton
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
            width={240}
          />
          <Skeleton height={320} borderRadius={theme.border.radius.md} />
        </StyledBlock>
      ) : null}
      {variant === 'map' ? (
        <StyledBlock>
          <StyledGrid>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                height={96}
                borderRadius={theme.border.radius.md}
              />
            ))}
          </StyledGrid>
          <StyledMapSkeleton>
            <Skeleton height="100%" borderRadius={0} />
            <StyledMapSkeletonSidebar>
              <Skeleton height={20} width="60%" />
              <Skeleton height={40} borderRadius={theme.border.radius.sm} />
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  height={120}
                  borderRadius={theme.border.radius.md}
                />
              ))}
            </StyledMapSkeletonSidebar>
          </StyledMapSkeleton>
        </StyledBlock>
      ) : null}
    </SkeletonTheme>
  );
};
