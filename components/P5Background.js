"use client";

import { useEffect, useRef } from "react";
import p5 from "p5";

const P5Background = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<p5 | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // Evita rodar no servidor

    // Se já houver uma instância de p5, não cria outra
    if (p5Instance.current || !sketchRef.current) return;

    const sketch = (p) => {
      let buff0;
      let buff1;
      let palette;
      let n_x, n_y, x_increment, y_increment;
      let start_x, start_y, end_x, end_y;

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        buff0 = p.createGraphics(p.width, p.height, p.WEBGL);
        buff1 = p.createGraphics(p.width, p.height, p.WEBGL);
        p.imageMode(p.CENTER);
        p.colorMode(p.HSB);
        p.rectMode(p.CENTER);

        start_y = p.height * 0.1;
        end_y = p.height * 0.9;
        start_x = p.width / 4.0;
        end_x = 3.0 * start_x;
        n_x = 36;
        n_y = (n_x * p.height) / p.width;
        x_increment = (end_x - start_x) / n_x;
        y_increment = (end_y - start_y) / n_y;

        palette = [
          p.color("#D81159"),
          p.color("#8F2D56"),
          p.color("#218380"),
          p.color("#FBB13C"),
          p.color("#73D2DE"),
        ];
      };

      p.draw = () => {
        [buff0, buff1] = [buff1, buff0];

        let t = p.frameCount / 14;

        buff1.beginDraw();
        buff1.clear();

        buff1.push();
        buff1.rotate(0.25 * wobbly(2.3 * t, p.createVector(0, 0)));
        buff1.scale(0.85 + 0.1 * wobbly(1.7 * t, p.createVector(0, 0)));
        buff1.image(buff0, 0, 0);
        buff1.pop();

        for (let j = 0; j < n_y; j++) {
          for (let i = 0; i < n_x; i++) {
            let point = p.createVector(i * x_increment, j * y_increment);
            let c = palette[j % palette.length];
            c.setAlpha(j / n_y);
            buff1.fill(c);
            buff1.square(
              1.45 * start_x * wobbly(t, point),
              start_y * 4.2 * wobbly(t + 9999, point),
              2 + (p.width / 100) * (1 + (i * j) % 3)
            );
          }
        }

        buff1.endDraw();
        p.background(5);
        p.image(buff1, 0, 0);
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      function wobbly(t, point) {
        return p.sin(
          t / 11.0 +
            point.x * 2.3 -
            p.sin(t / 4.2 - point.y * 32.4) +
            p.sin(t / 23.14 + 13.2 * p.sin(t / 51.2))
        );
      }

      if (sketchRef.current) {
        p5Instance.current = new p5(sketch, sketchRef.current);
      }
    };

    sketch();

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
    };
  }, []);

  return <div ref={sketchRef} className="absolute inset-0 -z-10" />;
};

export default P5Background;
