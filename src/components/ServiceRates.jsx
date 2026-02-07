import React from 'react';
import { useSFX } from '../hooks/useSFX';

const SERVICES = [
    {
        id: '01',
        title: 'LAYOUT_STRUCT',
        subtitle: 'POSTER // TYPOGRAPHY',
        price: '30',
        details: ['Grid Systems', 'Hierarchy Arch', 'Color Theory']
    },
    {
        id: '02',
        title: 'SYMBOL_CORE',
        subtitle: 'LOGO // GEOMETRY',
        price: '50',
        details: ['Logo Construction', 'Shape Psychology', 'Vector Precision']
    },
    {
        id: '03',
        title: 'BRAND_STAGING',
        subtitle: 'SYSTEM // IDENTITY',
        price: '100',
        details: ['Basic Identity', 'Brand Guidelines', 'Pro Mockups']
    }
];

const ServiceRates = () => {
    const { playSound } = useSFX();

    return (
        <div className="py-24 bg-black border-t border-white/5 relative z-10">
            <div className="max-w-6xl mx-auto px-6 md:px-10">
                <h2 className="text-[10px] md:text-xs font-mono tracking-[0.5em] text-white/30 mb-16 uppercase text-center md:text-left">
          // SERVICE_QUOTA_v0.1_STAGING
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                    {SERVICES.map((s) => (
                        <div
                            key={s.id}
                            className="group relative bg-black p-8 border border-white/10 hover:border-red-600 transition-all duration-300 overflow-hidden hover:shadow-[0_0_30px_rgba(220,38,38,0.2)]"
                            onMouseEnter={() => playSound('LOGIC')}
                            onTouchStart={() => playSound('LOGIC')}
                        >
                            {/* Header Section */}
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-8">
                                        <span className="font-mono text-[10px] text-red-600 tracking-widest opacity-80 group-hover:opacity-100">[ MODULE_{s.id} ]</span>
                                    </div>

                                    <h3 className="text-2xl md:text-3xl font-black text-white group-hover:text-red-600 transition-colors tracking-tighter mb-2">
                                        {s.title}
                                    </h3>
                                    <p className="text-[10px] font-mono text-white/40 mb-8 tracking-[0.2em] uppercase">{s.subtitle}</p>

                                    {/* Bullet Points */}
                                    <ul className="space-y-3 mb-12 border-t border-white/10 pt-6">
                                        {s.details.map((detail, i) => (
                                            <li key={i} className="flex items-center gap-3 text-[11px] font-mono text-white/50 group-hover:text-white transition-colors">
                                                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="text-4xl font-mono text-white group-hover:drop-shadow-[0_0_10px_rgba(220,38,38,0.5)] mt-auto">
                                    ${s.price}<span className="text-[12px] text-white/20">.00+</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* APEX BUTTON */}
                <button
                    onMouseEnter={() => playSound('LOGIC')}
                    onTouchStart={() => playSound('LOGIC')}
                    onClick={() => playSound('STEEL')}
                    className="group relative w-full py-10 md:py-12 border border-red-600/30 bg-red-950/10 overflow-hidden transition-all duration-500 hover:bg-red-600 hover:border-red-600 active:scale-[0.99]"
                >
                    <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                        <span className="text-white font-black text-4xl md:text-6xl tracking-tighter uppercase italic group-hover:text-black transition-colors duration-300">
                            ESTABLISH_CONNECTION
                        </span>
                        <span className="text-[10px] font-mono text-red-500 tracking-[0.3em] group-hover:text-black/70 transition-colors">
                            [ CLICK_TO_INITIATE_PROTOCOL ]
                        </span>
                    </div>

                    {/* Scan Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-scan mix-blend-overlay"></div>
                </button>

            </div>
        </div>
    );
};

export default ServiceRates;
