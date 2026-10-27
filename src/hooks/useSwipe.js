import { useEffect, useRef } from "react";

/**
 * Свайп-жесты.
 *
 * onSwipeRight — палец движется слева направо
 * onSwipeLeft — палец движется справа налево
 * minDistance — минимальное расстояние, чтобы сработал жест (по умолчанию 60px)
 */
export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  minDistance = 60,
  enabled = true,
}) => {
  const touchStart = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e) => {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;

      // Игнорируем вертикальные свайпы (скролл)
      if (Math.abs(dy) > Math.abs(dx)) {
        touchStart.current = null;
        return;
      }

      if (dx > minDistance) {
        onSwipeRight?.();
      } else if (dx < -minDistance) {
        onSwipeLeft?.();
      }
      touchStart.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, minDistance, enabled]);
};
