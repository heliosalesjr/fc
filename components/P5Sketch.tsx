/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import p5 from "p5";
import chroma from "chroma-js";

const P5Sketch = () => {
  const sketchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let p5Instance: p5 | null = null;

    const sketch = (p: p5) => {
      let linesShader: p5.Shader;
      let shapeAnimator: LinesShapeAnimator;

      const NUM_LINE_RECTS = 16;
      const TIME_MOD = 0.00005;
      const TIME_COLOR_MOD = 0.00015;
      const RECT_ROT_RADIUS = 0.3;
      const TIME_SCALE = 0.5;

      const FRAME_OFFSET = Math.random() * 10000;
      const colorScheme = chroma.scale([
        "#da3843", "#e4bb33", "#16d951", "#34beec",
        "#2635d9", "#020208", "#9846df", "#e9ec42", "#da3843"
      ]);

      class LinesShape {
        position: unknown;
        angle: any;
        radius!: never;
        constructor(parameters: any) {
          Object.assign(this, parameters);
        }
        draw() {
          if (!this.position || !this.angle || !this.radius || !linesShader) return;
        }
      }

      class LinesRect extends LinesShape {
        timeOffset: number;
        constructor(parameters: any) {
          super(parameters);
          this.timeOffset = 1000 * Math.random();
        }
        draw() {
          super.draw();
          linesShader.setUniform("uAngle", this.angle);
          linesShader.setUniform("uLineWidth", this.linesWidth);
          linesShader.setUniform("uLineScale", this.linesScale ?? 1);
          linesShader.setUniform("uRgb0", this.rgb0);
          linesShader.setUniform("uRgb1", this.rgb1);
          linesShader.setUniform("uCenter", this.center);
          linesShader.setUniform("uTime", p.frameCount * 0.02 * TIME_SCALE + this.timeOffset);
          p.shader(linesShader);
          p.rect(0, 0, p.width, p.height);
        }
          linesWidth!: number;
          linesScale: number | undefined;
          rgb0!: number[];
          rgb1!: number[];
          center!: number[];
      }

      class LinesShapeAnimator {
        linesRects: LinesRect[] = [];
        constructor() {
          this.init();
        }
        init() {
          this.linesRects = [];
          const dim = Math.max(p.width, p.height);
          const linesScale = Math.floor(p.map(dim, 300, 2500, 4, 20));
          for (let i = 0; i < NUM_LINE_RECTS; i++) {
            this.linesRects.push(new LinesRect({
              linesWidth: -0.9,
              linesScale: linesScale,
            }));
          }
        }
        animate() {
          for (let i = 0; i < this.linesRects.length; i++) {
            const linesRect = this.linesRects[i];
            let angleOffset = Math.floor(i - this.linesRects.length * 0.5 + 1);
            angleOffset -= angleOffset <= 0 ? 1 : 0;
            const a = i * 2 * Math.PI / this.linesRects.length;
            linesRect.angle = a + (p.frameCount * TIME_SCALE + p.mouseX + FRAME_OFFSET) * TIME_MOD * angleOffset;
            const t = (i / this.linesRects.length + (p.frameCount * TIME_SCALE + p.mouseY - p.mouseX) * TIME_COLOR_MOD + FRAME_OFFSET) % 1;
            const color0 = colorScheme(t).saturate().darken(2).rgb();
            linesRect.rgb0 = [color0[0] / 255, color0[1] / 255, color0[2] / 255];
            linesRect.rgb1 = [0, 0, 0];
            const x = 0.4 + RECT_ROT_RADIUS * Math.cos(t * 2 * Math.PI);
            const y = 0.3 + RECT_ROT_RADIUS * Math.sin(t * 2 * Math.PI);
            linesRect.center = [x, y];
          }
        }
        draw() {
          for (const linesRect of this.linesRects) {
            linesRect.draw();
          }
        }
      }

      p.preload = () => {
        linesShader = p.loadShader("/shaders/lines.vert", "/shaders/lines.frag");
      };

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        p.blendMode(p.ADD);
        shapeAnimator = new LinesShapeAnimator();
        p.noCursor();
      };

      p.draw = () => {
        p.background(0);
        linesShader.setUniform("uAspectRatio", p.windowHeight / p.windowWidth);
        shapeAnimator.animate();
        shapeAnimator.draw();
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        shapeAnimator.init();
      };
    };

    if (sketchRef.current) {
      p5Instance = new p5(sketch, sketchRef.current);
    }

    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, []);

  return <div ref={sketchRef} className="absolute inset-0 z-[-1]" />;
};

export default P5Sketch;
