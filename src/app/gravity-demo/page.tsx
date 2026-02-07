'use client';

import React, { useState, useEffect } from 'react';
import { GravityZone } from '@/components/gravity/gravity-zone';
import { GravityItem } from '@/components/gravity/gravity-item';

const GravityDemo = () => {
    const [mounted, setMounted] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setMounted(true);
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    if (!mounted) return <div className="w-full h-screen bg-neutral-950 text-white flex items-center justify-center">Initializing Gravity...</div>;

    return (
        <div className="w-full h-screen bg-neutral-950 text-white overflow-hidden font-sans">
            <GravityZone debug={false} className="relative z-10">

                {/* Background Text that shouldn't fall (just UI) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <h1 className="text-[10vw] font-bold tracking-tighter">GRAVITY</h1>
                </div>

                {/* Falling Items */}
                {/* Logo / Badge */}
                <GravityItem x={100} y={-100} className="bg-red-500 w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg border border-red-400/30">
                    <span className="font-bold text-2xl">N</span>
                </GravityItem>

                <GravityItem x={250} y={-300} className="bg-blue-500 w-32 h-32 rounded-full flex items-center justify-center shadow-lg border border-blue-400/30">
                    <span className="font-bold text-lg">Next.js</span>
                </GravityItem>

                <GravityItem x={500} y={-50} className="bg-amber-500 w-64 h-20 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="font-mono text-black font-semibold">Matter.js Physics</span>
                </GravityItem>

                {/* Generate some random scattered items */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <GravityItem
                        key={i}
                        x={Math.random() * (windowSize.width - 200) + 100}
                        y={-Math.random() * 1000 - 100}
                        className={`flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/10 ${i % 2 === 0 ? 'bg-white/10 w-20 h-20 rounded-xl' : 'bg-purple-500/80 w-24 h-24 rounded-full'
                            }`}
                    >
                        <div className="text-xs opacity-50">#{i + 1}</div>
                    </GravityItem>
                ))}

                <GravityItem x={windowSize.width / 2 - 150} y={-800} className="bg-gradient-to-r from-emerald-500 to-green-600 w-[300px] h-32 rounded-2xl flex flex-col items-center justify-center shadow-2xl p-4">
                    <h2 className="text-2xl font-bold">Try Dragging Me!</h2>
                    <p className="text-sm opacity-80 mt-1">Physics Enabled</p>
                </GravityItem>

            </GravityZone>

            <div className="absolute bottom-10 left-10 text-neutral-500 text-sm z-0">
                Status: MVP | Resize Window to Test Bounds
            </div>
        </div>
    );
};

export default GravityDemo;
