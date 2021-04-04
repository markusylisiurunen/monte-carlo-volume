import React, { useEffect } from "react";
import styles from "../../styles/Shape.module.css";

export type Point = {
  x: number;
  y: number;
};

export type Polygon = {
  points: Point[];
};

type ShapeProps = {
  polygons: Polygon[];
  registerListener: (listener: (h: number) => void) => void;
};

const Shape: React.FC<ShapeProps> = ({ polygons, registerListener }) => {
  const PADDING = 0.1;

  const xs = polygons.flatMap((polygon) =>
    polygon.points.map((point) => point.x)
  );

  const ys = polygons.flatMap((polygon) =>
    polygon.points.map((point) => -1 * point.y)
  );

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const containerRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    if (!containerRef.current || typeof registerListener !== "function") {
      return;
    }

    function animate(h: number) {
      const heightInPixels = containerRef.current.clientHeight;
      const heightInMeters = maxY - minY;

      // compute the px/m metric
      const paddingRelativeHeight =
        (2 * PADDING) / (heightInMeters + 2 * PADDING);

      const pixelsPerMeter =
        (heightInPixels - paddingRelativeHeight * heightInPixels) /
        heightInMeters;

      // the offset (px) to be h = 0
      const offsetNeutral = heightInPixels / 2 - pixelsPerMeter * PADDING;

      // the offset (px) from `h`
      const offsetH = -1 * pixelsPerMeter * h;

      // the total offset (px)
      const offset = -1 * (offsetNeutral + offsetH);

      containerRef.current.style.transform = `translateX(-50%) translateY(calc(-50% + ${offset}px)`;
    }

    animate(-0.2);

    registerListener(animate);
  }, [containerRef.current, registerListener]);

  return (
    <div className={styles.shapeContainer} ref={containerRef}>
      <svg
        viewBox={[
          minX - PADDING,
          minY - PADDING,
          maxX - minX + 2 * PADDING,
          maxY - minY + 2 * PADDING,
        ]
          .map((val) => 100 * val)
          .join(" ")}
      >
        {polygons.map((polygon) => (
          <polygon
            key={polygon.points.map((p) => `${p.x}-${p.y}`).join(" ")}
            points={polygon.points
              .map((point) => `${point.x * 100},${-1 * point.y * 100}`)
              .join(" ")}
          />
        ))}
      </svg>
    </div>
  );
};

export default Shape;
