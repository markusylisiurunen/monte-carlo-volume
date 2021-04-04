import fs from "fs";
import { GetServerSideProps } from "next";
import path from "path";
import React, { useEffect, useMemo } from "react";
import { promisify } from "util";
import Display from "../src/components/Display";
import type { Point, Polygon } from "../src/components/Shape";
import Shape from "../src/components/Shape";
import useShapeAnimation from "../src/hooks/useShapeAnimation";
import styles from "../styles/Home.module.css";

type HomeProps = {
  shape: { polygons: Polygon[] };
  area: Record<string, number>;
  weight: number;
};

const Home: React.FC<HomeProps> = ({ shape, area, weight }) => {
  const { onPositionChanged } = useShapeAnimation(weight, -0.2, area);

  const _listeners = useMemo<{
    positionChangedListeners: ((h: number) => void)[];
  }>(() => ({ positionChangedListeners: [] }), []);

  useEffect(() => {
    onPositionChanged((h) => {
      _listeners.positionChangedListeners.forEach((listener) => {
        listener(h);
      });
    });
  }, [_listeners.positionChangedListeners.length]);

  return (
    <div className={styles.container}>
      <Display
        registerListener={(listener: (h: number) => void) => {
          _listeners.positionChangedListeners.push(listener);
        }}
      />
      <Shape
        polygons={shape.polygons}
        registerListener={(listener: (h: number) => void) => {
          _listeners.positionChangedListeners.push(listener);
        }}
      />
      <div className={styles.waterContainer}></div>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const readFile = promisify(fs.readFile);

  const FILE_NAME = "circle_0-2";

  const shapeFile = await readFile(
    path.resolve(".", "..", "data", `${FILE_NAME}.csv`),
    { encoding: "utf-8" }
  );

  const areaFile = await readFile(
    path.resolve(".", "..", "data", `${FILE_NAME}_out.json`),
    { encoding: "utf-8" }
  );

  return {
    props: {
      area: JSON.parse(areaFile),
      shape: {
        polygons: shapeFile
          .split("\n")
          .slice(1)
          .map((row) => {
            const coords = row.split(",");
            const points: Point[] = [];

            for (let i = 0; i < coords.length - 1; i += 2) {
              points.push({
                x: parseFloat(coords[i]),
                y: parseFloat(coords[i + 1]),
              });
            }

            return { points };
          }),
      },
      weight: 7.5,
    },
  };
};
