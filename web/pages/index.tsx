import React, { useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";

type AreaFunction = Record<string, number>;
type OnPositionChanged = (h: number) => void;

function useShapeAnimation(
  weight: number,
  initialHeight: number,
  areaFunction: AreaFunction
): { onPositionChanged: (handler: OnPositionChanged) => void } {
  const _handler = useRef<OnPositionChanged>();
  const _state = useRef<{ h: number; v: number }>({ h: initialHeight, v: 0 });

  useEffect(() => {
    let animate = true;
    let prevAt = Date.now();

    (function tick() {
      const now = Date.now();

      const volume = 20 * interpolateArea(_state.current.h);

      const forceUp = 9.81 * (volume / 1000);
      const forceDown = 9.81 * weight;

      const forceNet = forceDown - forceUp;

      const acc = forceNet / weight;
      const vel = ((now - prevAt) / 1000) * acc;

      _state.current.v += vel;

      _state.current.h -= (now - prevAt) * vel;

      if (_handler.current) {
        _handler.current(_state.current.h);
      }

      if (animate) {
        requestAnimationFrame(tick);
      }
    })();

    return () => {
      animate = false;
    };
  }, []);

  function interpolateArea(h: number) {
    const A = Object.entries(areaFunction)
      .map(([key, value]) => ({ h: parseFloat(key), area: value }))
      .sort((a, b) => {
        if (a.h < b.h) return -1;
        if (a.h > b.h) return 1;
        return 0;
      });

    if (h <= 0) {
      return 0;
    }

    if (h >= A[A.length - 1].h) {
      return A[A.length - 1].area;
    }

    // TODO: binary search
    for (let i = 0; i < A.length - 1; i += 1) {
      const current = A[i];
      const next = A[i + 1];

      if (current.h <= h && next.h >= h) {
        return (
          current.area +
          ((h - current.h) / (next.h - current.h)) * (next.area - current.area)
        );
      }
    }
  }

  return {
    onPositionChanged: (handler) => {
      _handler.current = handler;
    },
  };
}

const Stats: React.FC = () => {
  return (
    <div className={styles.statsContainer}>
      <span>12.6 cm</span>
    </div>
  );
};

const Shape: React.FC = () => {
  const { onPositionChanged } = useShapeAnimation(0.1, 10, {
    "0": 0,
    "10": 100,
  });

  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    onPositionChanged((h) => {
      if (containerRef.current) {
        containerRef.current.style.transform = `translateX(-50%) translateY(calc(-50% + ${
          h / 10000
        }px))`;
      }
    });
  }, []);

  return <div className={styles.shapeContainer} ref={containerRef}></div>;
};

export default function Home() {
  return (
    <div className={styles.container}>
      <Stats />
      <Shape />
      <div className={styles.waterContainer}></div>
    </div>
  );
}
