"use client";

import { useState, useEffect } from "react";
import MaterialUnitSelector from "../../components/material-unit-selector";
import Image from "next/image";
import Link from "next/link";
import {
    Star,
    Check,
    ShieldCheck,
    Truck,
    Clock,
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Minus,
    Plus,
    Share2,
    MapPin,
    Loader2,
    ZoomIn,
    X as CloseIcon,
    MessagesSquare
} from "lucide-react";
import Header from "../../components/header";
import { products as mockProducts } from "@/data/mock-products";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const id = params.id as string;

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    // Quản lý phân loại động
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    // Swipe logic state
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const supabase = createClient();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (data) {
                    const mapped = {
                        ...data,
                        originalPrice: data.original_price,
                        isCombo: data.is_combo
                    };
                    setProduct(mapped);

                    // Khởi tạo lựa chọn mặc định
                    if (data.variants && Array.isArray(data.variants)) {
                        const initial: Record<string, string> = {};
                        data.variants.forEach((v: any) => {
                            if (v.options && v.options.length > 0) initial[v.name] = v.options[0];
                        });
                        setSelectedOptions(initial);
                    } else if (data.type !== 'material') {
                        // Mặc định cho sản phẩm cũ
                        setSelectedOptions({ "Kích thước": "30cm", "Mẫu chữ": "Phát Tài - Phát Lộc" });
                    }
                } else {
                    const mock = mockProducts.find(p => String(p.id) === id);
                    if (mock) {
                        setProduct(mock);
                        setSelectedOptions({ "Kích thước": "30cm", "Mẫu chữ": "Phát Tài - Phát Lộc" });
                    } else {
                        setProduct(mockProducts[0]);
                    }
                }
            } catch (e) {
                console.error("Lỗi fetch sản phẩm:", e);
                setProduct(mockProducts[0]);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-brand-terracotta mb-4" size={48} />
                <p className="text-stone-500 font-bold">Gói ghém hương thơm...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mb-6">
                    <Share2 size={40} />
                </div>
                <h1 className="text-2xl font-bold text-brand-brown mb-2">Sản phẩm không tồn tại</h1>
                <p className="text-stone-500 mb-8">Xin lỗi, chúng mình không tìm thấy sản phẩm này trong kho.</p>
                <Link href="/shop" className="px-8 py-3 bg-[#B45309] text-white font-bold rounded-xl shadow-lg">Quay về cửa tiệm</Link>
            </div>
        );
    }

    const baseProduct = product;
    const isMaterial = baseProduct?.type === 'material';

    // Đảm bảo các mảng luôn tồn tại để tránh lỗi .map()
    const safeImages = Array.isArray(baseProduct.images) ? baseProduct.images : [];
    const safeFeatures = Array.isArray(baseProduct.features) ? baseProduct.features : [];
    const safeSpecs = Array.isArray(baseProduct.specs) ? baseProduct.specs : [];
    const safePreservation = Array.isArray(baseProduct.preservation) ? baseProduct.preservation : [];
    const safeVariants = Array.isArray(baseProduct.variants) ? baseProduct.variants : [];

    const productDetails = {
        ...baseProduct,
        images: (safeImages.length > 0)
            ? safeImages
            : (baseProduct.image ? [baseProduct.image] : ["/assets/products/tet-1.jpg"]),
        discount: baseProduct.originalPrice ? Math.round(((baseProduct.originalPrice - baseProduct.price) / baseProduct.originalPrice) * 100) : 0,
        rating: baseProduct.rating || 4.9,
        reviews: baseProduct.reviews_count || 128,
        features: (safeFeatures.length > 0)
            ? safeFeatures
            : (isMaterial
                ? ["Màu sắc tươi sáng", "Chất liệu bền đẹp", "Dễ dàng tạo hình"]
                : [
                    "Thủ công 100%: Được kết tỉ mỉ từng chi tiết hoa và phụ kiện.",
                    "Chất liệu bền màu: Hoa lụa cao cấp, mẹt tre đã xử lý chống mối mọt.",
                    "Phong thủy: Màu đỏ - vàng kích hoạt vận may đầu năm."
                ]),
        specs: (safeSpecs.length > 0)
            ? safeSpecs
            : (isMaterial
                ? [
                    { label: "Đơn vị tính", value: baseProduct.unit || "Cái" },
                    { label: "Xuất xứ", value: "Nhà Kim Hương" }
                ]
                : [
                    { label: "Chất liệu nền", value: "Mẹt tre hun khói tự nhiên" },
                    { label: "Chất liệu hoa", value: "Hoa lụa, quả đỏ nhựa cao cấp" },
                    { label: "Phụ kiện", value: "Chữ xốp kim tuyến/gỗ cắt laser, dây treo tua rua" },
                    { label: "Kích thước", value: "30cm / 40cm" },
                    { label: "Trọng lượng", value: "~300g (Dễ dàng treo bằng móc dán)" },
                ]),
        preservation: (safePreservation.length > 0)
            ? safePreservation
            : [
                "Tránh treo trực tiếp dưới mưa lớn (treo hiên nhà có mái che là tốt nhất).",
                "Vệ sinh nhẹ nhàng bằng chổi lông gà hoặc máy sấy chế độ mát."
            ]
    };

    const galleryImages = productDetails.images.map((src: string, idx: number) => ({
        src,
        alt: `Ảnh ${idx + 1}`
    }));

    const handleMinus = () => { if (quantity > 1) setQuantity(quantity - 1); };
    const handlePlus = () => { setQuantity(quantity + 1); };

    const handleNextImage = () => {
        setActiveImage((prev) => (prev + 1) % galleryImages.length);
    };

    const handlePrevImage = () => {
        setActiveImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) handleNextImage();
        if (isRightSwipe) handlePrevImage();
    };

    // Tạm thời cố định logic giá cho Kích thước 40cm (+40k) nếu ko định nghĩa trong JSON
    const sizeExtraPrice = selectedOptions["Kích thước"] === "40cm" ? 40000 : 0;
    const totalPrice = (Number(productDetails.price || 0) + sizeExtraPrice) * quantity;

    const handleAddDecorToCart = () => {
        const variantSuffix = Object.values(selectedOptions).filter(Boolean).join(" - ");
        const variantId = `${productDetails.id}-${variantSuffix}`;
        addToCart({
            ...productDetails,
            id: variantId,
            price: Number(productDetails.price || 0) + sizeExtraPrice,
            name: `${productDetails.name} ${variantSuffix ? `(${variantSuffix})` : ''}`,
            isCombo: false,
        }, quantity);
        toast.success(`Đã thêm ${quantity} x "${productDetails.name}" vào giỏ!`);
    };

    const handleBuyNowDecor = () => {
        handleAddDecorToCart();
        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-brand-brown font-body pb-32">
            <Header />

            <main className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex items-center gap-2 mb-6 text-sm text-stone-500">
                    <Link href="/shop" className="hover:text-brand-terracotta flex items-center gap-1 transition-colors">
                        <ChevronLeft size={16} /> Quay lại cửa tiệm
                    </Link>
                    <span>/</span>
                    <span className="text-brand-brown font-semibold truncate">{productDetails.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="flex flex-col gap-4">
                        <div
                            className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-orange-100 shadow-sm group cursor-zoom-in touch-pan-y"
                            onClick={() => setIsZoomOpen(true)}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            <Image
                                src={galleryImages[activeImage]?.src || productDetails.image || "/assets/products/tet-1.jpg"}
                                alt={productDetails.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                                unoptimized={true}
                            />
                            {galleryImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/40 text-brand-brown/50 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white/80 hover:text-brand-brown z-10 backdrop-blur-sm"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/40 text-brand-brown/50 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white/80 hover:text-brand-brown z-10 backdrop-blur-sm"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none"></div>
                            {productDetails.discount > 0 && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md border-2 border-white animate-pulse">
                                    -{productDetails.discount}%
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-5 gap-2 sm:gap-4">
                            {galleryImages.map((img: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? "border-brand-terracotta ring-2 ring-brand-terracotta/20" : "border-transparent hover:border-orange-200"}`}
                                >
                                    <Image src={img.src} alt="" fill className="object-cover" unoptimized={true} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <h1 className="text-2xl md:text-3xl font-bold text-brand-brown mb-2 leading-tight">{productDetails.name}</h1>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center text-brand-amber gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < Math.floor(productDetails.rating) ? "currentColor" : "none"} className={i < Math.floor(productDetails.rating) ? "" : "text-stone-300"} />
                                ))}
                            </div>
                            <span className="text-stone-400 text-sm">({productDetails.reviews} đánh giá)</span>
                        </div>

                        {!isMaterial && (
                            <div className="bg-orange-50 p-4 rounded-xl mb-6 flex items-end gap-3 border border-orange-100/50">
                                <span className="text-3xl font-bold text-brand-terracotta">
                                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice / quantity)}
                                </span>
                                {productDetails.originalPrice > productDetails.price && (
                                    <span className="text-lg text-stone-400 line-through mb-1">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(productDetails.originalPrice || 0) + sizeExtraPrice)}
                                    </span>
                                )}
                            </div>
                        )}

                        {isMaterial ? (
                            <MaterialUnitSelector product={{ ...baseProduct, id: baseProduct.id }} />
                        ) : (
                            <div className="space-y-6 mb-8">
                                {/* RENDERING DYNAMIC VARIANTS */}
                                {safeVariants.length > 0 ? (
                                    safeVariants.map((v: any, vIdx: number) => (
                                        <div key={vIdx}>
                                            <span className="block text-sm font-bold text-brand-brown mb-2">{v.name}:</span>
                                            <div className="flex flex-wrap gap-3">
                                                {Array.isArray(v.options) && v.options.map((opt: string) => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => setSelectedOptions({ ...selectedOptions, [v.name]: opt })}
                                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedOptions[v.name] === opt ? "border-brand-terracotta bg-orange-50 text-brand-terracotta shadow-sm" : "border-stone-200 text-stone-600 hover:border-brand-terracotta/50"}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // Fallback UI cho sp cũ
                                    <>
                                        <div>
                                            <span className="block text-sm font-bold text-brand-brown mb-2">Kích thước:</span>
                                            <div className="flex gap-3">
                                                {["30cm", "40cm"].map(s => (
                                                    <button key={s} onClick={() => setSelectedOptions({ ...selectedOptions, "Kích thước": s })} className={`px-4 py-2 rounded-lg border text-sm font-medium ${selectedOptions["Kích thước"] === s ? "border-brand-terracotta bg-orange-50 text-brand-terracotta" : "border-stone-200"}`}>{s}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <span className="block text-sm font-bold text-brand-brown mb-2">Số lượng:</span>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-stone-200 rounded-lg bg-white">
                                            <button onClick={handleMinus} className="p-2 text-stone-500"><Minus size={16} /></button>
                                            <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                                            <button onClick={handlePlus} className="p-2 text-stone-500"><Plus size={16} /></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button onClick={handleBuyNowDecor} className="flex-1 text-white font-bold py-3.5 rounded-xl shadow-lg bg-[#B45309] hover:brightness-110 active:scale-95 transition-all">MUA NGAY</button>
                                    <button onClick={handleAddDecorToCart} className="flex-1 bg-white border-2 border-brand-terracotta text-brand-terracotta font-bold py-3.5 rounded-xl hover:bg-orange-50 transition-all">THÊM GIỎ</button>
                                </div>

                                {/* AI Chat Trigger */}
                                <div className="mt-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const event = new CustomEvent("open-ai-chat", {
                                                detail: {
                                                    product: {
                                                        name: productDetails.name,
                                                        price: Number(productDetails.price || 0) + sizeExtraPrice
                                                    }
                                                }
                                            });
                                            window.dispatchEvent(event);
                                        }}
                                        className="text-sm font-medium text-brand-terracotta/80 hover:text-brand-terracotta underline decoration-dotted decoration-brand-terracotta/50 underline-offset-4 flex items-center justify-center gap-2 mx-auto transition-colors"
                                    >
                                        <MessagesSquare size={16} />
                                        Cần tư vấn thêm về sản phẩm này?
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Stories, Specs & Care - ONLY SHOW HERE IF MANY IMAGES */}
                        {galleryImages.length >= 15 && (
                            <div className="border-t border-orange-100 pt-8 space-y-10">
                                {/* Giai thoại */}
                                <div>
                                    <h3 className="text-xl font-bold text-brand-brown mb-4 flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-brand-terracotta rounded-full"></span>
                                        Giai Thoại Sản Phẩm
                                    </h3>
                                    <div className="text-stone-600 leading-relaxed text-sm italic bg-white p-6 rounded-2xl border border-stone-100 shadow-sm whitespace-pre-wrap relative overflow-hidden">
                                        <div className="absolute -top-2 -left-2 text-orange-50 opacity-50 select-none text-8xl font-serif">&quot;</div>
                                        <span className="relative z-10">&quot;{productDetails.description || "Mỗi sản phẩm tại Nhà Kim Hương đều mang trong mình một câu chuyện riêng về sự tỉ mỉ và tâm huyết của người thợ thủ công."}&quot;</span>
                                    </div>
                                </div>

                                {/* Đặc điểm & Thông số */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Đặc điểm nổi bật */}
                                    {productDetails.features && productDetails.features.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-bold text-brand-brown mb-4">Đặc điểm nổi bật</h3>
                                            <ul className="space-y-3">
                                                {productDetails.features.map((f: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-stone-600">
                                                        <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0 mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                                        <span>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Thông số kỹ thuật */}
                                    {productDetails.specs && productDetails.specs.length > 0 && (
                                        <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-100 h-full">
                                            <h3 className="text-sm font-bold text-brand-terracotta uppercase tracking-[2px] mb-5">Chi tiết kỹ thuật</h3>
                                            <div className="divide-y divide-stone-100">
                                                {productDetails.specs.map((s: any, i: number) => (
                                                    <div key={i} className="grid grid-cols-[100px_1fr] gap-4 py-3 first:pt-0 last:pb-0 text-sm">
                                                        <span className="text-stone-400 font-medium leading-tight">{s.label}</span>
                                                        <span className="text-brand-brown font-bold leading-tight">{s.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Hướng dẫn bảo quản */}
                                {productDetails.preservation && productDetails.preservation.length > 0 && (
                                    <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-100/50">
                                        <h3 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
                                            <ShieldCheck size={20} className="text-brand-terracotta" />
                                            Hướng dẫn bảo quản
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {productDetails.preservation.map((p: string, i: number) => (
                                                <div key={i} className="flex gap-3 text-sm text-stone-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-terracotta shrink-0 mt-2"></div>
                                                    {p}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cam kết */}
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-100 text-xs text-stone-500 font-medium">
                                        <Truck size={14} className="text-brand-terracotta" /> Giao hàng toàn quốc
                                    </div>
                                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-100 text-xs text-stone-500 font-medium">
                                        <Clock size={14} className="text-brand-terracotta" /> Đổi trả trong 7 ngày
                                    </div>
                                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-100 text-xs text-stone-500 font-medium">
                                        <ShieldCheck size={14} className="text-brand-terracotta" /> Bảo hành chất lượng
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stories, Specs & Care - SHOW HERE IF FEW IMAGES (Default Layout) */}
                {galleryImages.length < 15 && (
                    <div className="mt-16 max-w-4xl mx-auto">
                        <div className="border-t border-orange-100 pt-8 space-y-10">
                            {/* Giai thoại */}
                            <div>
                                <h3 className="text-xl font-bold text-brand-brown mb-4 flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-brand-terracotta rounded-full"></span>
                                    Giai Thoại Sản Phẩm
                                </h3>
                                <div className="text-stone-600 leading-relaxed text-sm italic bg-white p-6 rounded-2xl border border-stone-100 shadow-sm whitespace-pre-wrap relative overflow-hidden">
                                    <div className="absolute -top-2 -left-2 text-orange-50 opacity-50 select-none text-8xl font-serif">&quot;</div>
                                    <span className="relative z-10">&quot;{productDetails.description || "Mỗi sản phẩm tại Nhà Kim Hương đều mang trong mình một câu chuyện riêng về sự tỉ mỉ và tâm huyết của người thợ thủ công."}&quot;</span>
                                </div>
                            </div>

                            {/* Đặc điểm & Thông số */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Đặc điểm nổi bật */}
                                {productDetails.features && productDetails.features.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-brand-brown mb-4">Đặc điểm nổi bật</h3>
                                        <ul className="space-y-3">
                                            {productDetails.features.map((f: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-stone-600">
                                                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0 mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Thông số kỹ thuật */}
                                {productDetails.specs && productDetails.specs.length > 0 && (
                                    <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-100 h-full">
                                        <h3 className="text-sm font-bold text-brand-terracotta uppercase tracking-[2px] mb-5">Chi tiết kỹ thuật</h3>
                                        <div className="divide-y divide-stone-100">
                                            {productDetails.specs.map((s: any, i: number) => (
                                                <div key={i} className="grid grid-cols-[100px_1fr] gap-4 py-3 first:pt-0 last:pb-0 text-sm">
                                                    <span className="text-stone-400 font-medium leading-tight">{s.label}</span>
                                                    <span className="text-brand-brown font-bold leading-tight">{s.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Hướng dẫn bảo quản */}
                            {productDetails.preservation && productDetails.preservation.length > 0 && (
                                <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-100/50">
                                    <h3 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
                                        <ShieldCheck size={20} className="text-brand-terracotta" />
                                        Hướng dẫn bảo quản
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {productDetails.preservation.map((p: string, i: number) => (
                                            <div key={i} className="flex gap-3 text-sm text-stone-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-terracotta shrink-0 mt-2"></div>
                                                {p}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cam kết */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-100 text-xs text-stone-500 font-medium">
                                    <Truck size={14} className="text-brand-terracotta" /> Giao hàng toàn quốc
                                </div>
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-100 text-xs text-stone-500 font-medium">
                                    <Clock size={14} className="text-brand-terracotta" /> Đổi trả trong 7 ngày
                                </div>
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-100 text-xs text-stone-500 font-medium">
                                    <ShieldCheck size={14} className="text-brand-terracotta" /> Bảo hành chất lượng
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* LIGHTBOX / ZOOM MODAL */}
            {isZoomOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setIsZoomOpen(false)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
                        onClick={() => setIsZoomOpen(false)}
                    >
                        <CloseIcon size={32} />
                    </button>

                    <div
                        className="relative w-full max-w-4xl aspect-square md:aspect-auto md:h-[85vh] animate-in zoom-in-95 duration-300 flex items-center justify-center touch-pan-y"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {galleryImages.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-20"
                                >
                                    <ChevronLeft size={48} />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-20"
                                >
                                    <ChevronRight size={48} />
                                </button>
                            </>
                        )}
                        <div className="relative w-full h-full">
                            <Image
                                src={galleryImages[activeImage]?.src || productDetails.image || "/assets/products/tet-1.jpg"}
                                alt={productDetails.name}
                                fill
                                className="object-contain"
                                unoptimized={true}
                            />
                        </div>
                        <p className="absolute bottom-[-40px] left-0 w-full text-center text-white/60 text-sm font-medium">
                            {productDetails.name} - Ảnh {activeImage + 1}/{galleryImages.length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
