// Mobile touch utilities for better mobile interaction

export const addMobileTouchHandlers = (onClick: () => void, disabled?: boolean) => {
  return {
    onClick: onClick,
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      if (!disabled) onClick();
    },
    style: {
      touchAction: 'manipulation' as const,
      WebkitTapHighlightColor: 'transparent',
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
      pointerEvents: 'auto' as const,
      cursor: 'pointer' as const,
    },
    className: 'mobile-button touch-target'
  };
};

export const mobileTouchStyle = {
  touchAction: 'manipulation' as const,
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none' as const,
  WebkitUserSelect: 'none' as const,
  pointerEvents: 'auto' as const,
  cursor: 'pointer' as const,
};

// Apply mobile-safe event handling
export const createMobileClickHandler = (handler: () => void, disabled?: boolean) => {
  return {
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      if (!disabled) handler();
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      if (!disabled) handler();
    }
  };
};