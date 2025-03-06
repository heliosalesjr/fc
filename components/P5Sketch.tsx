"use client";

import { useEffect, useRef } from "react";
import p5 from "p5";

const P5Sketch = () => {
  const sketchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // 🚀 Evita erro no SSR

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(400, 400).parent(sketchRef.current!);
      };

      p.draw = () => {
        p.background(220);
        p.fill(255, 0, 0);
        p.ellipse(p.width / 2, p.height / 2, 50, 50);
      };
    };

    const myP5 = new p5(sketch);

    return () => {
      myP5.remove();
    };
  }, []);

  return <div ref={sketchRef} />;
};

export default P5Sketch;
