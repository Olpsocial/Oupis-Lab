'use client';
import GieoQueGame from '@/components/games/GieoQue';
import DapNieuGame from '@/components/games/DapNieu';
import SpeedCraftGame from '@/components/games/SpeedCraft';
import { useTurnManager } from '@/hooks/useTurnManager';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

// Component trang trí góc (Làm một lần dùng nhiều chỗ)
// Placeholder for images until user provides them
const CornerDecor = () => (
    <>
        {/* Góc trái trên: Đèn lồng + Cành đào */}
        <div className="absolute top-0 left-0 w-40 h-40 pointer-events-none z-0">
            {/* <img src="/images/lantern-corner.png" alt="decor" className="w-full animate-swing-slow" /> */}
            <div className="w-full h-full bg-gradient-to-br from-red-600/20 to-transparent rounded-br-3xl"></div>
        </div>
        <div className="absolute -top-10 -left-10 w-64 h-64 pointer-events-none z-0 opacity-80">
            {/* <img src="/images/peach-blossom-branch.png" alt="decor" className="w-full rotate-45" /> */}
        </div>

        {/* Góc phải trên: Đối xứng */}
        <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none z-0 scale-x-[-1]">
            {/* <img src="/images/lantern-corner.png" alt="decor" className="w-full animate-swing-slow-delay" /> */}
        </div>
    </>
);

export default function ArcadePage() {
    const { turns, mounted } = useTurnManager(); // Ensure we use mounted check for SSR

    return (
        // NỀN ĐỎ CHỦ ĐẠO + HOA VĂN CHÌM
        <main className="min-h-screen bg-[#9b1c1c] bg-[url('/images/bg-pattern-tet.png')] bg-blend-overlay bg-repeat relative overflow-hidden px-4 py-8">
            <CornerDecor />

            {/* NUT THOÁT GAME */}
            <Link href="/" className="absolute top-4 left-4 z-50 group">
                <button className="flex items-center gap-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white/80 hover:text-white px-4 py-2 rounded-full border border-white/20 transition-all font-bold text-sm shadow-lg group-hover:-translate-x-1">
                    <ArrowLeft size={16} />
                    <span>Về Tiệm</span>
                </button>
            </Link>

            {/* HEADER HOÀNH TRÁNG */}
            <div className="relative z-10 text-center mb-10 mt-8">
                <h1 className="text-4xl md:text-5xl font-black text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] uppercase mb-2 font-serif loading-text">
                    Hội Chợ Hái Lộc Đầu Xuân
                </h1>
                <p className="text-red-100 text-lg">Vui chơi có thưởng - Rinh mã du xuân</p>

                {/* THANH HIỂN THỊ LƯỢT CHƠI ĐẸP MẮT */}
                {mounted && (
                    <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md text-yellow-300 px-6 py-2 rounded-full text-xl font-bold mt-6 border-2 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        <Sparkles className="animate-spin-slow text-yellow-400" />
                        <span>⚡ Lượt chơi còn lại:</span>
                        <span className="text-3xl text-white animate-pulse">{turns}</span>
                    </div>
                )}
            </div>

            {/* LƯỚI GAME (Được bọc trong các thẻ bài đẹp mắt) */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">

                {/* GAME CARD 1 */}
                <GameCard title="Gieo Quẻ Xin Lộc" desc="Lắc ống xăm, nhận lời tiên tri và voucher may mắn.">
                    <GieoQueGame />
                </GameCard>

                {/* GAME CARD 2 */}
                <GameCard title="Đập Niêu Tìm Mã" desc="Dùng chuột cắt dây, đập vỡ niêu đất tìm kho báu.">
                    <DapNieuGame />
                </GameCard>

                {/* GAME CARD 3 */}
                <GameCard title="Thợ Thủ Công Tốc Độ" desc="Thử thách nhanh tay lẹ mắt làm Mẹt Tre trong 3s.">
                    <SpeedCraftGame />
                </GameCard>

            </div>

            <footer className="mt-16 text-center text-red-200/50 text-sm relative z-10">
                © 2024 Nha Kim Huong Arcade System. Use code at checkout.
            </footer>
        </main>
    );
}

// Component bọc ngoài mỗi game để tạo khung viền đồng bộ
const GameCard = ({ title, desc, children }: { title: string, desc: string, children: React.ReactNode }) => (
    <div className="bg-[#fffce0] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-4 border-[#d4af37] overflow-hidden transform hover:-translate-y-2 transition-all duration-300 relative group h-full flex flex-col">
        {/* Dải ruy băng trang trí */}
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-red-700 rotate-45 -z-10 group-hover:rotate-180 transition-all"></div>

        <div className="p-6 pb-2 text-center relative z-10">
            <h3 className="text-2xl font-bold text-red-800 mb-1 uppercase drop-shadow-sm">{title}</h3>
            <p className="text-sm text-red-600/70 mb-4 font-medium">{desc}</p>
        </div>
        <div className="p-4 pt-0 relative z-10 flex-grow">
            {children}
        </div>
    </div>
);
