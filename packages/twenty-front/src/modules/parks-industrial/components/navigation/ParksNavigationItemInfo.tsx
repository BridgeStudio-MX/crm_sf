import { styled } from '@linaria/react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { IconInfoCircle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  PARKS_BRAND,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';
import { parksNavigationInfoOpenIdState } from '@/parks-industrial/states/parks-navigation-info-open-id.state';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

type ParksNavigationItemInfoProps = {
  title: string;
  description: string;
};

type PopoverCoords = {
  top: number;
  left: number;
};

const StyledRoot = styled.div`
  display: inline-flex;
  position: relative;
`;

const StyledInfoButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${PARKS_VIBE.radiusSm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: inline-flex;
  height: 22px;
  justify-content: center;
  padding: 0;
  width: 22px;

  &:hover,
  &[data-open='true'] {
    background: ${PARKS_BRAND.primarySoft};
    color: ${PARKS_BRAND.primary};
  }
`;

const StyledPopover = styled.div`
  background: ${PARKS_VIBE.surface};
  border: 1px solid ${PARKS_VIBE.border};
  border-radius: ${PARKS_VIBE.radiusMd};
  box-shadow: ${PARKS_VIBE.shadowHover};
  max-width: min(280px, calc(100vw - 24px));
  min-width: 220px;
  padding: ${PARKS_VIBE.space.md};
  pointer-events: auto;
  position: fixed;
  z-index: 10000;
`;

const StyledPopoverTitle = styled.div`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${PARKS_VIBE.space.xs};
`;

const StyledPopoverBody = styled.p`
  color: ${PARKS_VIBE.textSecondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.45;
  margin: 0;
  white-space: normal;
`;

const POPOVER_GAP_PX = 10;
const POPOVER_ESTIMATED_WIDTH_PX = 260;

const resolvePopoverCoords = (anchor: DOMRect): PopoverCoords => {
  const preferredLeft = anchor.right + POPOVER_GAP_PX;
  const fitsOnRight =
    preferredLeft + POPOVER_ESTIMATED_WIDTH_PX < window.innerWidth - 12;

  return {
    top: Math.max(12, Math.min(anchor.top, window.innerHeight - 120)),
    left: fitsOnRight
      ? preferredLeft
      : Math.max(12, anchor.left - POPOVER_ESTIMATED_WIDTH_PX - POPOVER_GAP_PX),
  };
};

export const ParksNavigationItemInfo = ({
  title,
  description,
}: ParksNavigationItemInfoProps) => {
  const instanceId = useId();
  const [openId, setOpenId] = useAtomState(parksNavigationInfoOpenIdState);
  const isOpen = openId === instanceId;
  const [coords, setCoords] = useState<PopoverCoords | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = `${instanceId}-popover`;

  const updateCoords = useCallback(() => {
    const buttonRect = buttonRef.current?.getBoundingClientRect();

    if (!buttonRect) {
      return;
    }

    setCoords(resolvePopoverCoords(buttonRect));
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setCoords(null);
      return;
    }

    updateCoords();
  }, [isOpen, updateCoords]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideButton = rootRef.current?.contains(target);
      const clickedInsidePopover = popoverRef.current?.contains(target);

      if (!clickedInsideButton && !clickedInsidePopover) {
        setOpenId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenId(null);
      }
    };

    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, setOpenId, updateCoords]);

  const handleToggle = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenId((current) => (current === instanceId ? null : instanceId));
  };

  return (
    <StyledRoot ref={rootRef}>
      <StyledInfoButton
        ref={buttonRef}
        type="button"
        aria-label={`Qué hace ${title}`}
        aria-expanded={isOpen}
        aria-controls={popoverId}
        data-open={isOpen ? 'true' : undefined}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={handleToggle}
      >
        <IconInfoCircle size={14} stroke={1.75} />
      </StyledInfoButton>
      {isOpen && coords
        ? createPortal(
            <StyledPopover
              ref={popoverRef}
              id={popoverId}
              role="dialog"
              aria-label={title}
              style={{ top: coords.top, left: coords.left }}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <StyledPopoverTitle>{title}</StyledPopoverTitle>
              <StyledPopoverBody>{description}</StyledPopoverBody>
            </StyledPopover>,
            document.body,
          )
        : null}
    </StyledRoot>
  );
};
