import { useEffect, useRef } from "react";

// representation of the area function
type Area = Record<string, number>;

// callback for when position is changed
type OnPositionChanged = (h: number) => void;

function useShapeAnimation(
  weight: number,
  fromHeight: number,
  area: Area
): { onPositionChanged: (handler: OnPositionChanged) => void } {
  const _handler = useRef<OnPositionChanged>();

  const _state = useRef<{
    // current height (m)
    h: number;

    // current velocity (m/s)
    v: number;
  }>({
    h: fromHeight,
    v: 0,
  });

  useEffect(() => {
    let animate = true;

    let _prev = null;

    function tick() {
      const now = Date.now();

      if (_prev === null) {
        _prev = now - 20;
      }

      // compute the volume of the shape (constant depth of 20 cm)
      const volume = 0.2 * getAreaAt(_state.current.h, area);

      // compute the forces to both directions
      const waterDensity = 997; // kg/m^3

      const forceDown = weight * 9.81;
      const forceUp = waterDensity * volume * 9.81;

      // compute the sum of forces (up is positive)
      let force = forceUp - forceDown;

      // simulate a drag force
      const forceDrag = Math.abs(_state.current.v) ** 2 * 1.12 * forceDown;
      force += _state.current.v >= 0 ? -forceDrag : forceDrag;

      // compute the effect the force has on the shape
      const tDelta = (now - _prev) / 1000;

      const vDelta = tDelta * (force / weight);
      const hDelta = tDelta * (_state.current.v + vDelta);

      _state.current.v += vDelta;
      _state.current.h -= hDelta;

      _prev = now;

      if (_handler.current) {
        _handler.current(_state.current.h);
      }

      if (animate) {
        requestAnimationFrame(tick);
      }
    }

    const startTimeout = setTimeout(() => {
      tick();
    }, 500);

    return () => {
      if (startTimeout) {
        clearTimeout(startTimeout);
      }

      animate = false;
    };
  }, []);

  return {
    onPositionChanged: (handler) => {
      _handler.current = handler;
    },
  };
}

function getAreaAt(h: number, area: Area): number {
  if (Number.isNaN(h)) {
    return 0;
  }

  const A = Object.entries(area)
    .map(([key, value]) => ({ h: parseFloat(key), A: value }))
    .sort((a, b) => {
      if (a.h < b.h) return -1;
      if (a.h > b.h) return 1;
      return 0;
    });

  if (h <= 0) {
    return 0;
  }

  if (h >= A[A.length - 1].h) {
    return A[A.length - 1].A;
  }

  // TODO: binary search
  for (let i = 0; i < A.length - 1; i += 1) {
    const current = A[i];
    const next = A[i + 1];

    // interpolate within the segment
    if (current.h <= h && next.h >= h) {
      const relativeH = (h - current.h) / (next.h - current.h);
      return current.A + relativeH * (next.A - current.A);
    }
  }

  throw new Error(`Could not get area for h = ${h}`);
}

export default useShapeAnimation;
