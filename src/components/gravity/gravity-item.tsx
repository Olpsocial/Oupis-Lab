'use client';

import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { useGravityContext } from './gravity-context';

interface GravityItemProps {
    children: React.ReactNode;
    className?: string;
    options?: Matter.IBodyDefinition; // To pass friction, restitution, etc.
    x?: number; // Initial spawn X
    y?: number; // Initial spawn Y
}

export const GravityItem = ({
    children,
    className = '',
    options = {},
    x,
    y
}: GravityItemProps) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const { engine } = useGravityContext();
    const bodyRef = useRef<Matter.Body | null>(null);

    useEffect(() => {
        if (!elementRef.current || !engine) return;

        const width = elementRef.current.offsetWidth || 100; // Fallback if not measured yet
        const height = elementRef.current.offsetHeight || 100;

        // Default spawn: Random spot if not provided
        // Ensure we spawn within window roughly if not specified
        const spawnX = x ?? Math.random() * (window.innerWidth - width);
        const spawnY = y ?? -Math.random() * 500 - 100; // Start above screen

        // 1. Create the Physics Body
        const body = Matter.Bodies.rectangle(
            spawnX + width / 2, // Adjust for center-of-mass (Matter.js uses center)
            spawnY + height / 2,
            width,
            height,
            {
                restitution: 0.7, // Bouncy
                frictionAir: 0.01,
                ...(options as any),
                // CRITICAL: Link Body to DOM ID
                label: `gravity-item-${Math.random().toString(36).substr(2, 9)}`
            }
        );

        // 2. Assign the ID to the DOM element so the Loop can find it
        elementRef.current.id = body.label;
        bodyRef.current = body;

        // 3. Add to World
        Matter.World.add(engine.world, body);

        // Cleanup
        return () => {
            if (bodyRef.current) {
                Matter.World.remove(engine.world, bodyRef.current);
            }
        };
    }, [engine, JSON.stringify(options), x, y]); // Use JSON.stringify for options deep check or just basic deps

    return (
        <div
            ref={elementRef}
            className={`absolute top-0 left-0 will-change-transform select-none ${className}`}
            // Start hidden or positioned off-screen to prevent flash before physics kicks in?
            // Actually standard position is top-0 left-0, then transform moves it. 
            // If we don't transform immediately, it sits at 0,0.
            style={{ opacity: 0 }} // Loop will set opacity to 1
        >
            {children}
        </div>
    );
};
