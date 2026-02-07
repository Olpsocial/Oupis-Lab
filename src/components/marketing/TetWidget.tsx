'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function TetWidget() {
    const [isVisible, setIsVisible] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const pathname = usePathname();

    // Hidden on Arcade page to avoid redundancy? Or keep it?
    // Better to keep it unless we are on arcade page.
    // We can use usePathname but let's keep it simple first.

    // Auto-hide on /arcade page
    if (pathname === '/arcade') return null;

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 right-4 z-[90] md:bottom-8 md:right-8 flex flex-col items-end pointer-events-none">

            {/* Tooltip / Callout */}
            <AnimatePresence>
                {(isHovered || true) && ( // Always show greeting initially or cycle it? Let's just show on hover or constant subtle hint
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="pointer-events-auto bg-white border-2 border-yellow-500 text-red-600 px-3 py-1 rounded-l-full rounded-tr-full text-xs font-bold shadow-lg mb-2 relative right-2"
                    >
                        Hái Lộc Ngay! 🧧
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Charm */}
            <motion.div
                className="pointer-events-auto relative group cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                animate={{
                    y: [0, -5, 0],
                    rotate: [0, 5, 0, -5, 0]
                }}
                transition={{
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute -top-2 -right-2 bg-black/20 hover:bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    <X size={12} />
                </button>

                <Link href="/arcade">
                    {/* Simple CSS-based Lantern/Envelope representation or simple Image */}
                    <div className="w-16 h-20 relative">
                        {/* String */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-yellow-600"></div>

                        {/* Body (Envelope) */}
                        <div className="absolute top-4 left-0 w-full h-full bg-red-600 rounded-lg border-2 border-yellow-400 shadow-[0_4px_10px_rgba(220,38,38,0.5)] flex items-center justify-center overflow-hidden">
                            {/* Decorative arcs */}
                            <div className="absolute -bottom-6 -left-6 w-28 h-28 border-4 border-yellow-500/30 rounded-full"></div>
                            <div className="text-yellow-300 font-bold text-2xl font-serif">Tết</div>
                        </div>

                        {/* Tassel (Tua rua) */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div className="flex gap-0.5">
                                <div className="w-0.5 h-6 bg-red-500"></div>
                                <div className="w-0.5 h-8 bg-red-500"></div>
                                <div className="w-0.5 h-6 bg-red-500"></div>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>

        </div>
    );
}
