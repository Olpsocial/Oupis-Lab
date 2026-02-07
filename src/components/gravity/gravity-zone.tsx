'use client';

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { GravityContext } from './gravity-context';
// import { debounce } from 'lodash'; // Removed to avoid dependency

// Note: If lodash is not installed, I will use a custom debounce, but let's assume standard utils or write a simple one. 
// I'll write a simple debounce to avoid dependency issues for now.

const simpleDebounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

interface GravityZoneProps {
    children: React.ReactNode;
    className?: string;
    debug?: boolean; // If true, show the canvas renderer for debugging overlay
}

export const GravityZone = ({ children, className = '', debug = false }: GravityZoneProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [engineState, setEngineState] = useState<{ engine: Matter.Engine; runner: Matter.Runner } | null>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);
    const renderRef = useRef<Matter.Render | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // 1. Init Engine
        const engine = Matter.Engine.create();
        const runner = Matter.Runner.create();

        // Config
        engine.world.gravity.y = 1;

        engineRef.current = engine;
        runnerRef.current = runner;

        // 2. Initial Wall Setup
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const wallOptions = { isStatic: true, render: { visible: debug } };
        const walls = [
            Matter.Bodies.rectangle(width / 2, height + 50, width, 100, { ...wallOptions, label: 'floor' }),
            Matter.Bodies.rectangle(width / 2, -50, width, 100, { ...wallOptions, label: 'ceiling' }),
            Matter.Bodies.rectangle(-50, height / 2, 100, height, { ...wallOptions, label: 'left' }),
            Matter.Bodies.rectangle(width + 50, height / 2, 100, height, { ...wallOptions, label: 'right' }),
        ];

        Matter.World.add(engine.world, walls);

        // 3. Mouse Control (Global for the Zone)
        const mouse = Matter.Mouse.create(containerRef.current);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        Matter.World.add(engine.world, mouseConstraint);

        // Fix: Allow scrolling on mobile by not capturing mouse events when not dragging
        // However, Matter.Mouse captures events. We might need conditional handling. 
        // For now, MVP: Enable mouse interaction.

        // 4. Debug Renderer (Optional)
        if (debug) {
            const render = Matter.Render.create({
                element: containerRef.current,
                engine: engine,
                options: {
                    width,
                    height,
                    wireframes: true,
                    background: 'transparent'
                }
            });
            Matter.Render.run(render);
            renderRef.current = render;
        }

        // 5. Start Physics Runner
        Matter.Runner.run(runner, engine);

        // 6. Start Sync Loop (The Heartbeat)
        let animationFrameId: number;
        const renderLoop = () => {
            const bodies = Matter.Composite.allBodies(engine.world);
            bodies.forEach(body => {
                if (body.isStatic) return; // Walls don't move visibly (except logic)

                const element = document.getElementById(body.label);
                if (element) {
                    const { x, y } = body.position;
                    const rotation = body.angle;

                    // Centroid adjustment happens here:
                    // Matter.js transforms are from Center of Mass. 
                    // DOM translate is usually from Top-Left, but if we set transform-origin: center (default usually for rotation), 
                    // we still need to align the position.
                    // Wait, transform: translate(x,y) moves the element's top-left corner by x,y? 
                    // No, translate moves the element relative to its start position.
                    // IF the element is absolute positioned at 0,0.

                    // CRITICAL: The GravityItem must be absolute positioned at 0,0 for this to work perfectly 
                    // as a "projection" of the physics body.

                    element.style.transform = `translate3d(${x - element.offsetWidth / 2}px, ${y - element.offsetHeight / 2}px, 0) rotate(${rotation}rad)`;

                    // Visibility check (optional optimization)
                    if (element.style.opacity !== '1') element.style.opacity = '1';
                }
            });
            animationFrameId = requestAnimationFrame(renderLoop);
        };
        renderLoop();

        setEngineState({ engine, runner });

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            Matter.Runner.stop(runner);
            Matter.Engine.clear(engine);
            if (renderRef.current) {
                Matter.Render.stop(renderRef.current);
                renderRef.current.canvas.remove();
            }
        };
    }, [debug]);

    // Resize Handler
    useEffect(() => {
        if (!engineRef.current || !containerRef.current) return;

        const handleResize = () => {
            const engine = engineRef.current!;
            const container = containerRef.current!;
            const width = container.clientWidth;
            const height = container.clientHeight;

            // 1. Update Walls
            // We find walls by label and update them.
            const bodies = Matter.Composite.allBodies(engine.world);
            const floor = bodies.find(b => b.label === 'floor');
            const ceiling = bodies.find(b => b.label === 'ceiling');
            const left = bodies.find(b => b.label === 'left');
            const right = bodies.find(b => b.label === 'right');

            if (floor) {
                Matter.Body.setPosition(floor, { x: width / 2, y: height + 50 });
                // Scale if needed (Matter.Body.scale is cumulative, so better to set vertices or just use big walls)
                // Simpler: Just make walls very wide initially or recreate them. 
                // For MVP: Let's assume walls are VERY wide (4000px) so horizontal resize doesn't break them immediately,
                // or just reposition x/y for now.
                Matter.Body.setVertices(floor, Matter.Bodies.rectangle(width / 2, height + 50, width, 100).vertices);
            }
            if (ceiling) {
                Matter.Body.setPosition(ceiling, { x: width / 2, y: -50 });
                Matter.Body.setVertices(ceiling, Matter.Bodies.rectangle(width / 2, -50, width, 100).vertices);
            }
            if (right) {
                Matter.Body.setPosition(right, { x: width + 50, y: height / 2 });
                Matter.Body.setVertices(right, Matter.Bodies.rectangle(width + 50, height / 2, 100, height).vertices);
            }
            if (left) {
                Matter.Body.setPosition(left, { x: -50, y: height / 2 });
                Matter.Body.setVertices(left, Matter.Bodies.rectangle(-50, height / 2, 100, height).vertices);
            }

            // 2. Safety: Push elements back in bounds (Anti-Explosion)
            bodies.forEach(body => {
                if (body.isStatic) return;

                let newX = body.position.x;
                let newY = body.position.y;
                let velocities = { x: body.velocity.x, y: body.velocity.y };
                let changed = false;

                if (body.position.x > width - 20) {
                    newX = width - 50;
                    velocities.x = 0; // Kill velocity to stop explosion energy
                    changed = true;
                }
                if (body.position.y > height - 20) {
                    newY = height - 50;
                    velocities.y = 0;
                    changed = true;
                }

                if (changed) {
                    Matter.Body.setPosition(body, { x: newX, y: newY });
                    Matter.Body.setVelocity(body, velocities);
                }
            });

            // Update Debug Render size if active
            if (renderRef.current) {
                renderRef.current.bounds.max.x = width;
                renderRef.current.bounds.max.y = height;
                renderRef.current.options.width = width;
                renderRef.current.options.height = height;
                renderRef.current.canvas.width = width;
                renderRef.current.canvas.height = height;
            }
        };

        const debouncedResize = simpleDebounce(handleResize, 200);
        window.addEventListener('resize', debouncedResize);
        return () => window.removeEventListener('resize', debouncedResize);
    }, [engineState]); // Re-bind if engine resets (though it shouldn't)

    return (
        <GravityContext.Provider value={engineState || { engine: null, runner: null }}>
            <div
                ref={containerRef}
                className={`relative w-full h-full overflow-hidden ${className}`}
                style={{ touchAction: 'none' }} // Needed for smooth drag
            >
                {children}
            </div>
        </GravityContext.Provider>
    );
};
