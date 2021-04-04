import React, { useEffect, useState } from "react";
import styles from "../../styles/Display.module.css";

type DisplayProps = {
  registerListener: (listener: (h: number) => void) => void;
};

const Display: React.FC<DisplayProps> = ({ registerListener }) => {
  const [height, setHeight] = useState(-0.2);

  useEffect(() => {
    registerListener((h: number) => {
      setHeight(h);
    });
  }, []);

  return (
    <div className={styles.displayContainer}>
      <span>{(height * 100).toFixed(1)} cm</span>
    </div>
  );
};

export default Display;
