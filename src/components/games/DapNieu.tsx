'use client';
import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { getRandomReward } from '@/utils/game-economy';
import { useTurnManager } from '@/hooks/useTurnManager';
import OutOfTurnsModal from './OutOfTurnsModal';

export default function DapNieuGame() {
    const sceneRef = useRef<HTMLDivElement>(null);
    const [prize, setPrize] = useState<string | null>(null);
    const { useTurn, addTurns } = useTurnManager();
    const [showModal, setShowModal] = useState(false);

    // Refs to maintain state inside closures
    const isPlayingRef = useRef(false);
    const checkTurnRef = useRef<() => boolean>(() => false);

    // Update ref when hook changes
    useEffect(() => {
        checkTurnRef.current = useTurn;
    }, [useTurn]);

    useEffect(() => {
        if (!sceneRef.current) return;

        // 1. Setup Engine & Runner
        const engine = Matter.Engine.create();
        const runner = Matter.Runner.create();
        const render = Matter.Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: 350,
                height: 400,
                wireframes: false,
                background: 'transparent'
            }
        });

        // 2. Setup Objects
        const ceilingAnchor = Matter.Bodies.circle(175, 50, 5, { isStatic: true, render: { fillStyle: '#aaa' } });
        const pot = Matter.Bodies.circle(175, 200, 40, {
            restitution: 0.5,
            label: 'POT',
            render: { fillStyle: '#8B4513', strokeStyle: '#5D2906', lineWidth: 3 }
        });
        const string = Matter.Constraint.create({
            bodyA: ceilingAnchor,
            bodyB: pot,
            length: 150,
            stiffness: 0.1,
            render: { strokeStyle: '#aaa', lineWidth: 2 }
        });
        const floor = Matter.Bodies.rectangle(175, 410, 350, 20, { isStatic: true, render: { opacity: 0 } });
        const mouse = Matter.Mouse.create(render.canvas);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });

        Matter.World.add(engine.world, [ceilingAnchor, pot, string, floor, mouseConstraint]);

        // 3. Run
        Matter.Runner.run(runner, engine);
        Matter.Render.run(render);

        // 4. Handle Interaction (Click on Pot)
        Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
            if (isPlayingRef.current || prize) return;

            const mousePos = event.mouse.position;

            if (Matter.Bounds.contains(pot.bounds, mousePos)) {
                // CALL THE REF to check turns
                if (!checkTurnRef.current()) {
                    setShowModal(true);
                    return;
                }

                // Action!
                isPlayingRef.current = true;
                Matter.World.remove(engine.world, string); // Cut the rope

                // Wait for drop
                setTimeout(() => {
                    const reward = getRandomReward();
                    setPrize(reward.name);
                    Matter.Runner.stop(runner); // Fixed: Pass runner, not engine
                    isPlayingRef.current = false;
                }, 1000);
            }
        });

        // Cleanup
        return () => {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner); // Fixed
            Matter.Engine.clear(engine);
            if (render.canvas) render.canvas.remove();
        };
    }, []); // Run once on mount

    return (
        <div className="relative flex flex-col items-center justify-center bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-300 shadow-sm min-h-[400px]">
            <div className="absolute top-2 right-2 text-xs text-gray-400 font-mono z-10">GAME_02: PHYSICS</div>
            <div className="absolute top-2 z-10 text-sm text-gray-500 font-medium">Gạt để đung đưa, Bấm vào niêu để đập!</div>

            <div ref={sceneRef} className="cursor-pointer" />

            {prize && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4 z-20 animate-fade-in backdrop-blur-sm">
                    <h3 className="text-3xl font-black text-red-600 mb-2">VỠ RỒI!</h3>
                    <p className="text-center font-bold mb-6 text-gray-800 text-lg">{prize}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 text-white rounded-full font-bold shadow-lg hover:bg-red-700 transition"
                    >
                        Chơi lại
                    </button>
                </div>
            )}

            {showModal && <OutOfTurnsModal onAddTurns={addTurns} onClose={() => setShowModal(false)} />}
        </div>
    );
}
