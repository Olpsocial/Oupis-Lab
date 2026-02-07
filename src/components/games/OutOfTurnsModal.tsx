'use client';
import { Copy, Facebook, ShoppingBag, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    onAddTurns: (amount: number) => void;
    onClose: () => void;
}

export default function OutOfTurnsModal({ onAddTurns, onClose }: Props) {

    // Xử lý Share (Fake logic: Bấm share là được cộng, vì không check API Facebook được)
    const handleShare = () => {
        const url = "https://nha-kim-huong.vercel.app";

        // Nếu trên mobile thì gọi Native Share
        if (navigator.share) {
            navigator.share({
                title: 'Săn Lì Xì tại Nhà Kim Hương',
                text: 'Vào chơi game nhận voucher mua đồ Tết nè mọi người ơi!',
                url: url,
            }).then(() => {
                onAddTurns(2); // Thưởng 2 lượt
                onClose();
            }).catch(console.error);
        } else {
            // Trên PC thì copy link
            navigator.clipboard.writeText(url);
            toast.success("Đã copy link! Gửi cho bạn bè để nhận lượt nhé.");
            // Giả lập delay 3s để người dùng đi paste link
            setTimeout(() => {
                onAddTurns(2);
                onClose();
            }, 3000);
        }
    };

    const handleOrderInput = () => {
        const orderId = prompt("Nhập mã đơn hàng bạn đã mua (Ví dụ: DH001):");
        if (orderId && orderId.length > 3) {
            // Ở đây nên gọi API check đơn hàng thật
            // Demo: Cứ nhập là được
            onAddTurns(5);
            onClose();
        } else {
            toast.error("Mã đơn không hợp lệ");
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-4 border-red-600 animate-bounce-in relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-black">
                    <X size={20} />
                </button>

                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-4xl">😱</span>
                </div>

                <h2 className="text-2xl font-bold text-center text-red-700 mt-8 mb-2">HẾT LƯỢT RỒI!</h2>
                <p className="text-center text-gray-600 mb-6 text-sm">
                    Đừng buồn, làm nhiệm vụ nhỏ để kiếm thêm lượt săn quà nhé.
                </p>

                <div className="space-y-3">
                    {/* NHIỆM VỤ 1: CHIA SẺ */}
                    <button
                        onClick={handleShare}
                        className="w-full flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-200 hover:bg-blue-100 transition group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500 text-white p-2 rounded-lg">
                                <Facebook size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-blue-900">Chia sẻ với bạn bè</p>
                                <p className="text-xs text-blue-600">Nhận ngay +2 lượt</p>
                            </div>
                        </div>
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full group-hover:scale-110 transition">+2</span>
                    </button>

                    {/* NHIỆM VỤ 2: NHẬP ĐƠN HÀNG */}
                    <button
                        onClick={handleOrderInput}
                        className="w-full flex items-center justify-between bg-yellow-50 p-4 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-500 text-white p-2 rounded-lg">
                                <ShoppingBag size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-yellow-900">Đã mua hàng?</p>
                                <p className="text-xs text-yellow-600">Nhập mã đơn nhận +5 lượt</p>
                            </div>
                        </div>
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full group-hover:scale-110 transition">+5</span>
                    </button>
                </div>

                <button onClick={onClose} className="mt-6 text-xs text-gray-400 underline w-full hover:text-gray-600">
                    Thôi, mai tôi quay lại
                </button>
            </div>
        </div>
    );
}
