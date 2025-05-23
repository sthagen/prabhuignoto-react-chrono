import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  createMediaQuery,
  addMediaListeners,
  removeMediaListeners,
} from '../../utils/mediaQueryUtils';

/**
 * Configuration options for the useMatchMedia hook
 */
interface MatchMediaOptions {
  /** Callback function to execute when media query matches */
  onMatch?: () => void;
  /** Whether the hook is enabled */
  enabled?: boolean;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
}

/**
 * Custom hook that tracks if a media query matches and executes a callback on matches
 *
 * @param query - The media query string to match against
 * @param options - Configuration options
 * @returns Boolean indicating if the media query currently matches
 *
 * @example
 * ```tsx
 * const isMobile = useMatchMedia('(max-width: 768px)', {
 *   onMatch: () => console.log('Mobile view detected'),
 *   debounceDelay: 200
 * });
 * ```
 */
export const useMatchMedia = (
  query: string,
  { onMatch, enabled = true, debounceDelay = 100 }: MatchMediaOptions = {},
): boolean => {
  const [matches, setMatches] = useState<boolean>(false);
  const mediaQuery = useRef<MediaQueryList | null>(null);
  const isCleanedUp = useRef<boolean>(false);

  // Stable callback references to prevent unnecessary effect re-runs
  const handleMediaChange = useCallback(
    (event: MediaQueryListEvent | MediaQueryList) => {
      if (isCleanedUp.current) return;
      setMatches(event.matches);
    },
    [],
  );

  const handleResize = useDebouncedCallback(
    () => {
      if (!mediaQuery.current || isCleanedUp.current) return;

      const currentMatches = mediaQuery.current.matches;
      setMatches(currentMatches);
    },
    debounceDelay,
    { maxWait: 1000 },
  );

  // Setup media query listener
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    isCleanedUp.current = false;

    // Cleanup previous mediaQuery if it exists
    if (mediaQuery.current) {
      removeMediaListeners(mediaQuery.current, handleMediaChange, handleResize);
    }

    mediaQuery.current = createMediaQuery(query);
    const currentMedia = mediaQuery.current;

    if (!currentMedia) {
      return;
    }

    // Initial check
    handleMediaChange(currentMedia);

    // Add event listeners
    addMediaListeners(currentMedia, handleMediaChange, handleResize);

    // Cleanup
    return () => {
      isCleanedUp.current = true;
      if (currentMedia) {
        removeMediaListeners(currentMedia, handleMediaChange, handleResize);
      }
      handleResize.cancel(); // Cancel any pending debounced calls
      mediaQuery.current = null; // Clear the ref
    };
  }, [query, enabled, handleMediaChange, handleResize]); // Removed createMediaQuery dependency to avoid infinite loops

  // Execute callback when matches changes - use ref to avoid stale closure
  const onMatchRef = useRef(onMatch);
  onMatchRef.current = onMatch;

  useEffect(() => {
    if (matches && onMatchRef.current) {
      onMatchRef.current();
    }
  }, [matches]);

  return matches;
};
