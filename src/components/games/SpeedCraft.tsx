'use client';
import { useState, useEffect } from 'react';
import { useTurnManager } from '@/hooks/useTurnManager';
import OutOfTurnsModal from './OutOfTurnsModal';

const RECIPE = ['🎋 Mẹt Tre', '🌸 Hoa Đào', '🧧 Bao Lì Xì']; // Thứ tự phải bấm

export default function SpeedCraftGame() {
    const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
    const [currentStep, setCurrentStep] = useState(0);
    const [timeLeft, setTimeLeft] = useState(3);
    const { useTurn, addTurns } = useTurnManager(); // Lấy hook
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (gameState === 'PLAYING') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0.1) {
                        setGameState('LOST');
                        return 0;
                    }
                    return prev - 0.1;
                });
            }, 100);
            return () => clearInterval(timer);
        }
    }, [gameState]);

    const handleTap = (item: string) => {
        if (gameState !== 'PLAYING') return;

        if (item === RECIPE[currentStep]) {
            // Bấm đúng
            if (currentStep === RECIPE.length - 1) {
                setGameState('WON');
            } else {
                setCurrentStep(prev => prev + 1);
            }
        } else {
            // Bấm sai -> Phạt trừ giờ
            setTimeLeft(prev => Math.max(0, prev - 1));
        }
    };

    const startGame = () => {
        // >>> KIỂM TRA LƯỢT Ở ĐÂY <<<
        if (!useTurn()) {
            setShowModal(true);
            return;
        }

        setGameState('PLAYING');
        setCurrentStep(0);
        setTimeLeft(3.0);
    };

    return (
        <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-400 text-center min-h-[400px] flex flex-col justify-center relative overflow-hidden shadow-sm">
            <div className="absolute top-2 right-2 text-xs text-yellow-600/50 font-mono">GAME_03: SPEED</div>

            {gameState === 'IDLE' && (
                <>
                    <h3 className="text-xl font-bold text-yellow-800 mb-2">Thử Tài Nghệ Nhân</h3>
                    <p className="text-sm mb-6 text-yellow-700">Bấm chọn nguyên liệu theo đúng thứ tự để làm Mẹt Tre trong 3 giây!</p>
                    <div className="flex justify-center gap-2 mb-8 opacity-70">
                        {RECIPE.map((r, i) => <div key={i} className="bg-white px-3 py-1 border border-yellow-300 rounded text-xs font-bold text-gray-600">{i + 1}. {r}</div>)}
                    </div>
                    <button onClick={startGame} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-red-700 transition transform hover:scale-105 active:scale-95">
                        BẮT ĐẦU
                    </button>
                </>
            )}

            {gameState === 'PLAYING' && (
                <>
                    <div className="mb-8">
                        <div className={`text-6xl font-black transition-colors ${timeLeft < 1.5 ? 'text-red-600' : 'text-gray-800'}`}>
                            {timeLeft.toFixed(1)}s
                        </div>
                        <div className="text-sm text-gray-500 mt-2">Cần bấm: <span className="font-bold text-xl text-black block mt-1">{RECIPE[currentStep]}</span></div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {['🌸 Hoa Đào', '🧧 Bao Lì Xì', '🎋 Mẹt Tre'].map((item) => (
                            <button
                                key={item}
                                onClick={() => handleTap(item)}
                                className="h-24 bg-white border-b-4 border-gray-200 active:border-b-0 active:mt-1 rounded-lg text-3xl hover:bg-gray-50 transition-all flex items-center justify-center shadow-sm"
                            >
                                {item.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {gameState === 'WON' && (
                <div className="animate-bounce">
                    <h3 className="text-2xl font-bold text-green-600 mb-2">XUẤT SẮC!</h3>
                    <p className="text-gray-600">Bạn tay nghề quá đỉnh.</p>
                    <div className="mt-6 bg-white p-4 border border-dashed border-green-500 rounded shadow-sm">
                        Mã: <span className="font-bold text-red-600 text-lg">NGHENHANVIP</span> <br />
                        <span className="text-xs text-gray-400">(Giảm 10% đơn hàng)</span>
                    </div>
                    <button onClick={() => setGameState('IDLE')} className="mt-6 text-sm underline text-gray-500 hover:text-red-500">Chơi lại</button>
                </div>
            )}

            {gameState === 'LOST' && (
                <div>
                    <h3 className="text-3xl font-bold text-gray-400 mb-2">HẾT GIỜ!</h3>
                    <p className="text-gray-600">Làm đồ thủ công phải nhanh mà chuẩn cơ.</p>
                    <button onClick={startGame} className="mt-8 bg-gray-800 text-white px-6 py-2 rounded-full font-bold hover:bg-black transition">Thử lại</button>
                </div>
            )}

            {showModal && <OutOfTurnsModal onAddTurns={addTurns} onClose={() => setShowModal(false)} />}
        </div>
    );
}
