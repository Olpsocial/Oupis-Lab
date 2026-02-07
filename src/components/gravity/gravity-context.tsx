'use client';

import { createContext, useContext } from 'react';
import Matter from 'matter-js';

interface GravityContextValue {
    engine: Matter.Engine | null;
    runner: Matter.Runner | null;
}

export const GravityContext = createContext<GravityContextValue>({
    engine: null,
    runner: null,
});

export const useGravityContext = () => useContext(GravityContext);
