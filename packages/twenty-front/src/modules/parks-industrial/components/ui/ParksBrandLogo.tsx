import { styled } from '@linaria/react';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  PARKS_LOGO_COLOR,
  PARKS_LOGO_ON_DARK,
} from '@/parks-industrial/constants/parks-industrial-image.constants';

export type ParksBrandLogoVariant = 'color' | 'onDark' | 'auto';

type ParksBrandLogoProps = {
  variant?: ParksBrandLogoVariant;
  height?: number;
  alt?: string;
};

const StyledLogo = styled.img<{ heightPx: number }>`
  display: block;
  height: ${({ heightPx }) => `${heightPx}px`};
  object-fit: contain;
  object-position: left center;
  user-select: none;
  width: auto;
`;

export const ParksBrandLogo = ({
  variant = 'auto',
  height = 28,
  alt = 'Parks Industrial',
}: ParksBrandLogoProps) => {
  const { theme } = useContext(ThemeContext);
  const useOnDark =
    variant === 'onDark' ||
    (variant === 'auto' && theme.name === 'dark');

  return (
    <StyledLogo
      src={useOnDark ? PARKS_LOGO_ON_DARK : PARKS_LOGO_COLOR}
      alt={alt}
      heightPx={height}
      height={height}
      decoding="async"
    />
  );
};

export const ParksBrandLogoMark = styled.div`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  max-width: 100%;
  padding: ${themeCssVariables.spacing[1]} 0;
`;
