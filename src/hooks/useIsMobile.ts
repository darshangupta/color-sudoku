import { useState, useEffect } from 'react';

interface UseIsMobileReturn {
  isMobile: boolean;
  isTablet: boolean; // True for iPad and similar tablets
  isTouch: boolean; // True for any touch device
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Custom hook to detect device type (mobile, tablet, desktop)
 * Uses a combination of screen width and pointer type for accurate detection
 *
 * Detection strategy:
 * - Mobile: screen width <= 768px (phones)
 * - Tablet: touch device with screen width > 768px (iPad, Android tablets)
 * - Desktop: non-touch device with screen width > 768px
 *
 * Device characteristics:
 * - Mobile: Small screen, touch, vertical layout, drawing mode
 * - Tablet: Large screen, touch, can use desktop layout but with drawing mode
 * - Desktop: Large screen, mouse/trackpad, horizontal layout, keyboard controls
 *
 * Handles:
 * - SSR safety (checks for window existence)
 * - Orientation changes
 * - Window resize events
 * - Component cleanup
 */
export function useIsMobile(): UseIsMobileReturn {
  const getDeviceState = () => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isTablet: false, isTouch: false, deviceType: 'desktop' as const };
    }

    const hasSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    // Mobile: small screen (regardless of touch)
    const isMobile = hasSmallScreen;

    // Tablet: large screen + touch (iPad, Android tablets)
    const isTablet = !hasSmallScreen && hasCoarsePointer;

    // Touch: any touch device (mobile or tablet)
    const isTouch = hasCoarsePointer;

    // Device type classification
    let deviceType: 'mobile' | 'tablet' | 'desktop';
    if (hasSmallScreen) {
      deviceType = 'mobile';
    } else if (hasCoarsePointer) {
      deviceType = 'tablet';
    } else {
      deviceType = 'desktop';
    }

    return { isMobile, isTablet, isTouch, deviceType };
  };

  const [state, setState] = useState<UseIsMobileReturn>(getDeviceState);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const screenQuery = window.matchMedia('(max-width: 768px)');
    const pointerQuery = window.matchMedia('(pointer: coarse)');

    const updateState = () => {
      setState(getDeviceState());
    };

    screenQuery.addEventListener('change', updateState);
    pointerQuery.addEventListener('change', updateState);

    return () => {
      screenQuery.removeEventListener('change', updateState);
      pointerQuery.removeEventListener('change', updateState);
    };
  }, []);

  return state;
}
