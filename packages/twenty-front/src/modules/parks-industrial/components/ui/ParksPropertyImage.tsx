import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconBuildingSkyscraper } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  getParksImageFallbackInitials,
  getParksImageUrl,
} from '@/parks-industrial/utils/parks-image.util';

const StyledImageFrame = styled.div<{
  accentColor?: string;
  frameHeight: number;
}>`
  align-items: center;
  background: ${({ accentColor }) =>
    accentColor ?? themeCssVariables.background.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm}
    ${themeCssVariables.border.radius.sm} 0 0;
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  height: ${({ frameHeight }) => frameHeight}px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledFallbackLabel = styled.span`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
`;

const StyledFallbackIcon = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

type ParksPropertyImageProps = {
  imageUrl?: string | null;
  alt: string;
  fallbackLabel: string;
  accentColor?: string;
  height?: number;
  showBorderRadius?: boolean;
};

export const ParksPropertyImage = ({
  imageUrl,
  alt,
  fallbackLabel,
  accentColor,
  height = 140,
  showBorderRadius = true,
}: ParksPropertyImageProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const resolvedImageUrl = getParksImageUrl(imageUrl);
  const shouldShowImage =
    resolvedImageUrl !== null && hasImageError === false;

  return (
    <StyledImageFrame
      accentColor={shouldShowImage ? undefined : accentColor}
      frameHeight={height}
      style={
        showBorderRadius
          ? undefined
          : { borderRadius: 0 }
      }
    >
      {shouldShowImage ? (
        <StyledImage
          src={resolvedImageUrl}
          alt={alt}
          loading="lazy"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <>
          {fallbackLabel.trim().length > 0 ? (
            <StyledFallbackLabel>
              {getParksImageFallbackInitials(fallbackLabel)}
            </StyledFallbackLabel>
          ) : (
            <StyledFallbackIcon>
              <IconBuildingSkyscraper size={28} />
            </StyledFallbackIcon>
          )}
        </>
      )}
    </StyledImageFrame>
  );
};
