"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook for scroll-triggered animations using Intersection Observer.
 * Respects prefers-reduced-motion media query.
 * 
 * Uses callback ref pattern to avoid accessing refs during render.
 * Derives final visibility from both intersection state and motion preference.
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;

  // State for intersection observer visibility (only for normal motion users)
  const [intersectionVisible, setIntersectionVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Use useSyncExternalStore for reduced motion preference (safe for render)
  const prefersReducedMotion = useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      mediaQuery.addEventListener("change", callback);
      return () => mediaQuery.removeEventListener("change", callback);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false // Server-side snapshot
  );

  // Callback ref - called when element mounts/unmounts
  // This is the recommended pattern for refs with side effects
  const ref = useCallback(
    (element: T | null) => {
      // Cleanup existing observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!element) return;

      // Skip observer setup if reduced motion is preferred
      // Visibility will be derived as true from prefersReducedMotion
      if (prefersReducedMotion) {
        return;
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          // setIsVisible is called in observer callback (not render phase) - safe
          setIntersectionVisible(entry.isIntersecting);
          
          if (entry.isIntersecting && triggerOnce) {
            observerRef.current?.unobserve(element);
          }
        },
        { threshold, rootMargin }
      );

      observerRef.current.observe(element);
    },
    [threshold, rootMargin, triggerOnce, prefersReducedMotion]
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  // Re-setup observer when options or preference changes
  // This handles the case when prefersReducedMotion toggles
  useEffect(() => {
    // If reduced motion is now preferred, disconnect observer
    // Visibility is derived from prefersReducedMotion, so no state update needed
    if (prefersReducedMotion && observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, [prefersReducedMotion]);

  // Derive final isVisible: always true for reduced motion, otherwise check intersection
  return { ref, isVisible: prefersReducedMotion || intersectionVisible };
}