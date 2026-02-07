import React from 'react';
import { Phone } from 'lucide-react';

export default function TopBar() {
    return (
        <div className="w-full bg-[#78350F] text-white text-xs md:text-sm py-2 text-center transition-colors relative">
            <div className="flex items-center justify-center gap-4 tracking-wide opacity-95 hover:opacity-100 transition-opacity cursor-default">
                <span className="hidden sm:inline font-normal opacity-90">Tư vấn quà tặng & Decor:</span>
                <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="font-bold hover:text-[#fb923c] transition-colors flex items-center gap-2 group cursor-default"
                >
                    <Phone className="w-4 h-4 fill-current text-white group-hover:text-[#fb923c] transition-colors" />
                    <span className="tracking-wider text-sm">Liên hệ</span>
                </a>
                <span className="w-1 h-1 rounded-full bg-white/40 hidden sm:block"></span>
                <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="hover:text-[#fb923c] transition-colors text-[11px] uppercase font-bold tracking-wider opacity-90 hover:opacity-100 border-b border-transparent hover:border-[#fb923c] cursor-default"
                >
                    Chat Zalo
                </a>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-yellow-300 font-bold tracking-wider">BETA</span>
            </div>
            {/* Warning Message for Beta/Dev Environment */}
            <div className="text-[10px] text-white/50 bg-black/20 w-full py-0.5 mt-1 font-light tracking-wide px-2">
                ⚠️ Phiên bản thử nghiệm (Demo). Dữ liệu & Số điện thoại là giả lập.
            </div>
        </div>
    );
}
