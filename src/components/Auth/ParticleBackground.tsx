import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

const COLORS = ['#7c6fd4', '#a78bfa', '#818cf8', '#6366f1', '#8b5cf6', '#c4b5fd', '#ddd6fe'];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function randomSize() {
  const roll = Math.random();
  if (roll < 0.5) return Matter.Common.random(12, 28);   // 작은 것 - 50%
  if (roll < 0.8) return Matter.Common.random(35, 55);   // 중간 것 - 30%
  return Matter.Common.random(65, 95);                    // 큰 것   - 20%
}

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { Engine, Render, Runner, Bodies, Composite, Composites, Common, Mouse, MouseConstraint } = Matter;

    const engine = Engine.create();
    const world = engine.world;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const render = Render.create({
      element: containerRef.current,
      engine,
      options: {
        width: w,
        height: h,
        wireframes: false,
        background: 'transparent',
      },
    });

    // 바닥 / 좌우 벽
    Composite.add(world, [
      Bodies.rectangle(w / 2, h + 25, w, 50,  { isStatic: true, render: { fillStyle: 'transparent' } }),
      Bodies.rectangle(-25,   h / 2,  50, h,   { isStatic: true, render: { fillStyle: 'transparent' } }),
      Bodies.rectangle(w + 25, h / 2, 50, h,   { isStatic: true, render: { fillStyle: 'transparent' } }),
    ]);

    // 도형 생성 - mixed 데모처럼 원/다각형/직사각형 혼합
    const cols = 8;
    const rows = 4;
    const stack = Composites.stack(
      w / 2 - (cols * 80) / 2, // 화면 중앙에서 시작
      -rows * 120,              // 화면 위에서 떨어짐
      cols,
      rows,
      10,
      10,
      (_x: number, _y: number) => {
        const size = randomSize();
        const color = randomColor();
        const sides = Math.round(Common.random(3, 8));
        const chamfer = sides > 2 && Common.random() > 0.4
          ? { radius: size * 0.25 }
          : undefined;
        const shapeOpts = { chamfer, restitution: 0.5, friction: 0.05, frictionAir: 0.01, render: { fillStyle: color } };

        const roll = Math.random();
        if (roll < 0.35) {
          // 원
          return Bodies.circle(_x, _y, size, { restitution: 0.5, friction: 0.05, frictionAir: 0.01, render: { fillStyle: color } });
        } else if (roll < 0.65) {
          // 다각형
          return Bodies.polygon(_x, _y, sides, size, shapeOpts);
        } else {
          // 직사각형 (정사각형 or 긴 것)
          const isWide = Common.random() > 0.7;
          return Bodies.rectangle(
            _x, _y,
            isWide ? size * 2.5 : size,
            isWide ? size * 0.6 : size,
            shapeOpts
          );
        }
      }
    );

    Composite.add(world, stack);

    // 마우스 드래그
    const mouse = Mouse.create(document.body);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    // 캔버스 스타일
    render.canvas.style.position = 'fixed';
    render.canvas.style.top = '0';
    render.canvas.style.left = '0';
    render.canvas.style.zIndex = '0';
    render.canvas.style.pointerEvents = 'none';

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    const handleResize = () => {
      render.canvas.width  = window.innerWidth;
      render.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      render.canvas.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={containerRef} />;
}
