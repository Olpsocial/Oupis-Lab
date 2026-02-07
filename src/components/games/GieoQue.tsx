'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { getRandomReward, Reward } from '@/utils/game-economy';
import confetti from 'canvas-confetti';
import { useTurnManager } from '@/hooks/useTurnManager';
import OutOfTurnsModal from './OutOfTurnsModal';
import { Zap } from 'lucide-react';

export default function GieoQueGame() {
    const [isShaking, setIsShaking] = useState(false);
    const [reward, setReward] = useState<Reward | null>(null);
    const { turns, useTurn, addTurns, mounted } = useTurnManager();
    const [showModal, setShowModal] = useState(false);

    const handleShake = () => {
        if (isShaking || reward) return;

        // 1. Check turns
        if (!useTurn()) {
            setShowModal(true);
            return;
        }

        setIsShaking(true);

        // Giả lập lắc trong 2 giây
        setTimeout(() => {
            setIsShaking(false);
            const result = getRandomReward();
            setReward(result);
            if (result.type !== 'WISH') confetti(); // Bắn pháo giấy nếu trúng quà
        }, 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 rounded-xl p-4 border-2 border-red-200 shadow-sm relative overflow-hidden">

            {/* Turn Counter */}
            {mounted && (
                <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1 shadow-md border border-white/20">
                    <Zap size={12} className="text-yellow-400" fill="currentColor" />
                    Lượt: {turns}
                </div>
            )}

            <div className="absolute top-2 right-2 text-xs text-red-300 font-mono">GAME_01: SPIRITUAL</div>

            {!reward ? (
                <>
                    <motion.div
                        animate={isShaking ? { x: [-5, 5, -5, 5, 0], rotate: [-2, 2, -2, 2, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 0.2 }}
                        className="cursor-pointer mt-8"
                        onClick={handleShake}
                    >
                        {/* Thay bằng ảnh ống xăm thật của ông thì đẹp hơn */}
                        <div className="w-32 h-48 bg-red-800 rounded-t-lg rounded-b-xl border-4 border-yellow-500 relative flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow group">
                            <span className="text-yellow-400 font-bold text-4xl writing-vertical-lr select-none group-hover:scale-110 transition-transform">LỘC</span>
                            {/* Các thẻ xăm thò lên */}
                            <div className="absolute -top-4 w-20 h-10 bg-yellow-200/50 rounded z-[-1]" />
                        </div>
                    </motion.div>
                    <p className="mt-6 text-red-800 font-bold animate-pulse select-none">
                        {isShaking ? "Đang xin bề trên..." : "Bấm vào ống xăm để gieo quẻ!"}
                    </p>
                </>
            ) : (
                <div className="text-center animate-scale-up w-full">
                    <div className="bg-white p-6 rounded-lg shadow-xl border-2 border-red-500 max-w-xs mx-auto">
                        <h3 className="text-xl font-bold text-red-600 mb-2">QUẺ CỦA BẠN</h3>
                        <p className="text-gray-800 text-lg mb-4 italic">"{reward.name}"</p>
                        {reward.code && (
                            <div className="bg-yellow-100 p-2 rounded border border-dashed border-yellow-600 mb-4">
                                <span className="text-xs text-gray-500">Mã ưu đãi:</span>
                                <p className="font-mono font-bold text-xl text-red-700">{reward.code}</p>
                            </div>
                        )}
                        <button
                            onClick={() => setReward(null)}
                            className="mt-2 text-sm text-gray-500 underline hover:text-red-500"
                        >
                            Gieo lại quẻ khác
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <OutOfTurnsModal
                    onAddTurns={addTurns}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
