import React, { useState } from 'react';
import { ShoppingCart, Check, Tag, Minus, Plus, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface Unit {
    id: string;
    label: string;
    price: number;
    oldPrice?: number;
    description: string;
    isBestSeller?: boolean;
}

interface MaterialUnitSelectorProps {
    product?: {
        id: string | number;
        name: string;
        image?: string;
        units?: Unit[]; // Make optional
        price?: number;
        originalPrice?: number;
        [key: string]: any; // Allow other props
    };
}

// DỮ LIỆU MẪU DEFAULT (Fallback nếu không có props truyền vào)
const defaultProductData = {
    id: 'kem-nhung-loai-1',
    name: "Set Kẽm Nhung (Pipe Cleaners) Làm Hoa Handmade - Lông Dày Mịn",
    image: "/assets/products/material-pipe.jpg",
    units: [
        {
            id: 'retail',
            label: 'Bó Nhỏ (20 cây)',
            price: 15000,
            oldPrice: undefined,
            description: 'Phù hợp làm thử 1-2 bông hoa.',
            isBestSeller: false
        },
        {
            id: 'bundle',
            label: 'Bó Lớn (100 cây)',
            price: 65000,
            oldPrice: 75000,
            description: 'Đủ làm một bình hoa lớn. Tiết kiệm 15%.',
            isBestSeller: true
        }
    ]
};

export default function MaterialUnitSelector({ product = defaultProductData }: MaterialUnitSelectorProps) {
    const { addToCart } = useCart();

    // An toàn hoá dữ liệu: Nếu không có mảng units, tự tạo mảng unit từ giá sản phẩm chính
    const safeUnits: Unit[] = (product.units && Array.isArray(product.units)) ? product.units : [
        {
            id: 'standard',
            label: (product as any).unit || 'Gói/Cái',
            price: Number(product.price) || 0,
            oldPrice: (product as any).originalPrice ? Number((product as any).originalPrice) : undefined,
            description: (product as any).description || 'Quy cách tiêu chuẩn',
            isBestSeller: false
        }
    ];

    const [selectedUnit, setSelectedUnit] = useState<Unit>(safeUnits.find(u => u.isBestSeller) || safeUnits[0]);
    const [quantity, setQuantity] = useState(1);

    // Tính tổng tiền
    const totalPrice = selectedUnit.price * quantity;

    const handleAddToCart = () => {
        const variantId = `${product.id}-${selectedUnit.id}`;
        addToCart({
            ...product, // Giữ các thông tin gốc
            id: variantId,
            name: `${product.name} (${selectedUnit.label})`,
            price: selectedUnit.price,
            originalPrice: selectedUnit.oldPrice || selectedUnit.price * 1.2,
            image: product.image || "/assets/products/material-pipe.jpg",
            sold: 0,
            isCombo: false
        }, quantity);
        toast.success(`Đã thêm ${quantity} x ${selectedUnit.label} vào giỏ!`);
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm max-w-md">
            {/* HEADER TÊN SẢN PHẨM (Chỉ hiện nếu chưa có trong trang chi tiết chính, nhưng ở đây có thể ẩn đi nếu trang chính đã có H1) */}
            {/* <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
      <p className="text-sm text-gray-500 mb-4">Mã SP: {product.id}</p> */}

            {/* KHU VỰC CHỌN ĐƠN VỊ (UNIT SELECTION) */}
            <h4 className="text-sm font-bold text-gray-700 mb-2">Chọn quy cách:</h4>
            <div className="grid grid-cols-2 gap-3 mb-5">
                {safeUnits.map((unit) => (
                    <div
                        key={unit.id}
                        onClick={() => { setSelectedUnit(unit); setQuantity(1); }}
                        className={`relative cursor-pointer p-3 border-2 rounded-lg transition-all duration-200 
              ${selectedUnit.id === unit.id
                                ? 'border-brand-terracotta bg-orange-50'
                                : 'border-gray-200 hover:border-brand-terracotta/50 bg-white'}`}
                    >
                        {/* Badge Best Seller */}
                        {unit.isBestSeller && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-red-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10 whitespace-nowrap">
                                <Tag size={10} /> TIẾT KIỆM NHẤT
                            </span>
                        )}

                        <div className="text-center">
                            <p className={`font-bold text-sm leading-tight mb-1 ${selectedUnit.id === unit.id ? 'text-brand-terracotta' : 'text-gray-700'}`}>
                                {unit.label}
                            </p>
                            <p className="text-xs text-stone-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(unit.price)}</p>
                        </div>

                        {/* Icon check khi active */}
                        {selectedUnit.id === unit.id && (
                            <div className="absolute top-1 right-1 text-brand-terracotta">
                                <Check size={14} strokeWidth={3} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* CHI TIẾT LỰA CHỌN */}
            <div className="bg-orange-50/50 p-3 rounded-lg mb-4 text-xs text-stone-600 flex items-start gap-2 border border-orange-100">
                <span className="text-sm">💡</span>
                <p>{selectedUnit.description}</p>
            </div>

            {/* THANH ĐIỀU KHIỂN SỐ LƯỢNG & GIÁ */}
            <div className="flex items-end justify-between mb-4">
                {/* Bộ đếm */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Số lượng:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white w-fit">
                        <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition"
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        ><Minus size={16} /></button>
                        <span className="w-8 text-center font-bold text-gray-800 text-sm">{quantity}</span>
                        <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition"
                            onClick={() => setQuantity(q => q + 1)}
                        ><Plus size={16} /></button>
                    </div>
                </div>

                {/* Giá tiền */}
                <div className="text-right">
                    {selectedUnit.oldPrice && (
                        <p className="text-xs text-gray-400 line-through">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedUnit.oldPrice * quantity)}
                        </p>
                    )}
                    <p className="text-2xl font-bold text-brand-terracotta leading-none">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                    </p>
                </div>
            </div>

            {/* BUTTON ACTIONS */}
            <div className="flex flex-col gap-3">
                <button
                    onClick={() => {
                        handleAddToCart();
                        // Dùng window.location vì useRouter ko có sẵn trong component nhỏ nếu ko truyền vào
                        window.location.href = '/checkout';
                    }}
                    className="w-full text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-2 group"
                    style={{ background: "linear-gradient(135deg, #B45309 0%, #D97706 100%)" }}
                >
                    <Truck size={20} className="group-hover:translate-x-1 transition-transform" />
                    MUA NGAY
                </button>
                <button
                    onClick={handleAddToCart}
                    className="w-full bg-white border-2 border-brand-terracotta text-brand-terracotta font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-orange-50 active:scale-95"
                >
                    <ShoppingCart size={20} />
                    Thêm vào giỏ
                </button>
            </div>

            {/* Lưu ý nhỏ */}
            <p className="text-[10px] text-center text-stone-400 mt-2 italic">
                *Mua nguyên liệu chưa bao gồm hướng dẫn 1:1, vui lòng xem video trên kênh.
            </p>
        </div>
    );
}
