"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Search, X, Save, Image as ImageIcon, Lock, Key } from "lucide-react";
import { toast } from "sonner";
import Header from "../../components/header";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    name: string;
    image: string;
    images?: string[];
    price: number;
    original_price: number;
    sold: number;
    badge: string;
    is_combo: boolean;
    type: "decor" | "material" | "diy-kit";
    unit: string;
    is_active: boolean;
    category: string;
    description?: string;
    specs?: any[];
    preservation?: string[];
    features?: string[];
    rating?: number;
    reviews_count?: number;
    variants?: any[];
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Auth & Password related state
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [passwordInput, setPasswordInput] = useState("");
    const [isCheckingPassword, setIsCheckingPassword] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    // Mật khẩu cố định bạn yêu cầu
    const ADMIN_PASSWORD = "kimhuongadmin2026";

    useEffect(() => {
        // Kiểm tra xem đã "đăng nhập" bằng mật khẩu chưa (lưu trong sessionStorage)
        const hasAccess = sessionStorage.getItem("admin_access") === "true";
        if (hasAccess) {
            setIsAuthorized(true);
            fetchProducts();
        } else {
            setIsAuthorized(false);
        }
    }, []);

    const handleVerifyPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setIsCheckingPassword(true);

        // Giả lập kiểm tra (bạn có thể đổi mật khẩu ở biến ADMIN_PASSWORD phía trên)
        if (passwordInput === ADMIN_PASSWORD) {
            sessionStorage.setItem("admin_access", "true");
            setIsAuthorized(true);
            fetchProducts();
            toast.success("Chào mừng Admin Kim Hương!");
        } else {
            toast.error("Mật khẩu không chính xác!");
            setPasswordInput("");
        }
        setIsCheckingPassword(false);
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (e: any) {
            toast.error("Lỗi lấy danh sách sản phẩm: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (product: Product) => {
        try {
            const { error } = await supabase
                .from("products")
                .update({ is_active: !product.is_active })
                .eq("id", product.id);

            if (error) throw error;

            setProducts(products.map(p => p.id === product.id ? { ...p, is_active: !product.is_active } : p));
            toast.success(`${product.is_active ? "Đã ẩn" : "Đã hiện"} sản phẩm "${product.name}"`);
        } catch (e: any) {
            toast.error("Lỗi cập nhật trạng thái");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
        try {
            const { error } = await supabase.from("products").delete().eq("id", id);
            if (error) throw error;
            setProducts(products.filter(p => p.id !== id));
            toast.success("Đã xóa sản phẩm");
        } catch (e: any) {
            toast.error("Lỗi xóa sản phẩm");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = { ...editingProduct };

            const safeParse = (val: any) => {
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch (e) { return null; }
                }
                return val;
            };

            const images = safeParse(payload.images);
            const specs = safeParse(payload.specs);
            const preservation = safeParse(payload.preservation);
            const features = safeParse(payload.features);
            const variants = safeParse(payload.variants);

            if (images === null && typeof payload.images === 'string') { toast.error("Bộ sưu tập ảnh sai định dạng JSON!"); return; }
            if (specs === null && typeof payload.specs === 'string') { toast.error("Thông số kỹ thuật sai định dạng JSON!"); return; }
            if (preservation === null && typeof payload.preservation === 'string') { toast.error("Hướng dẫn bảo quản sai định dạng JSON!"); return; }
            if (features === null && typeof payload.features === 'string') { toast.error("Đặc điểm nổi bật sai định dạng JSON!"); return; }
            if (variants === null && typeof payload.variants === 'string') { toast.error("Phân loại sai định dạng JSON!"); return; }

            payload.images = images || [];
            payload.specs = specs || [];
            payload.preservation = preservation || [];
            payload.features = features || [];
            payload.variants = variants || [];
            payload.rating = parseFloat(payload.rating) || 5.0;
            payload.reviews_count = parseInt(payload.reviews_count) || 0;

            if (editingProduct?.id) {
                const { error } = await supabase
                    .from("products")
                    .update(payload)
                    .eq("id", editingProduct.id);
                if (error) throw error;
                toast.success("Đã cập nhật sản phẩm");
            } else {
                const { error } = await supabase
                    .from("products")
                    .insert([payload]);
                if (error) throw error;
                toast.success("Đã thêm sản phẩm mới");
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (e: any) {
            toast.error("Lỗi lưu sản phẩm: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    // UI Màn hình nhập mật khẩu
    if (isAuthorized === false) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-10 border border-stone-100 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-orange-50 text-brand-terracotta rounded-full flex items-center justify-center mb-6 mx-auto">
                        <Key size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-brand-brown mb-2 font-hand">Xác thực Quyền Quản trị</h1>
                    <p className="text-stone-500 text-sm mb-8">Vui lòng nhập mật khẩu bí mật để truy cập kho hàng.</p>

                    <form onSubmit={handleVerifyPassword} className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="password"
                                required
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Nhập mật khẩu..."
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 rounded-2xl border border-stone-100 focus:outline-none focus:border-brand-terracotta transition-all font-bold text-brand-brown"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isCheckingPassword}
                            className="w-full bg-[#B45309] text-white font-bold py-4 rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {isCheckingPassword ? <Loader2 className="animate-spin" /> : "Vào quản trị"}
                        </button>
                    </form>

                    <button
                        onClick={() => router.push('/')}
                        className="mt-6 text-sm text-stone-400 hover:text-brand-terracotta transition-all"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    if (isAuthorized === null || (loading && products.length === 0)) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-brand-terracotta mb-4" size={48} />
                <p className="text-stone-500 font-bold">Gói ghém kho hàng...</p>
            </div>
        );
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-body pb-20">
            <Header />

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-brown font-hand">Quản lý kho hàng</h1>
                        <p className="text-stone-500 text-sm">Chế độ Admin tối cao.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchProducts}
                            className="bg-white text-stone-600 px-4 py-3 rounded-2xl font-bold border border-stone-100 shadow-sm hover:bg-stone-50 transition-all"
                        >
                            <Loader2 className={loading ? "animate-spin" : ""} size={20} />
                        </button>
                        <button
                            onClick={() => { setEditingProduct({ is_active: true, type: "decor", price: 0, sold: 0, specs: [], preservation: [], features: [], images: [], variants: [], rating: 5.0, reviews_count: 120 }); setIsModalOpen(true); }}
                            className="bg-[#B45309] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all"
                        >
                            <Plus size={20} /> Đăng sản phẩm mới
                        </button>
                    </div>
                </div>

                {/* SEARCH & FILTER */}
                <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tên sản phẩm, danh mục..."
                            className="w-full pl-10 pr-4 py-2 bg-stone-50 rounded-xl border border-stone-100 focus:outline-none focus:border-[#B45309] text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* PRODUCT LIST */}
                {(loading && products.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <p>Đang tải danh sách...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Sản phẩm</th>
                                        <th className="px-6 py-4">Loại / Mùa</th>
                                        <th className="px-6 py-4">Giá</th>
                                        <th className="px-6 py-4">Đã bán</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                        <th className="px-6 py-4 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className={`hover:bg-orange-50/30 transition-colors ${!product.is_active ? 'opacity-60' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-stone-100">
                                                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-brand-brown">{product.name}</p>
                                                        <p className="text-[10px] text-stone-400 font-medium uppercase">{product.badge || 'Không có nhãn'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold px-2 py-1 rounded-md bg-stone-100 text-stone-600">
                                                    {product.type}
                                                </span>
                                                <p className="text-[10px] text-stone-400 mt-1">{product.category || 'Chưa phân mùa'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-brand-terracotta">
                                                    {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                                                </p>
                                                {product.original_price && (
                                                    <p className="text-[10px] text-stone-400 line-through">
                                                        {new Intl.NumberFormat('vi-VN').format(product.original_price)}đ
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-500">
                                                {product.sold}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(product)}
                                                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition-all ${product.is_active ? 'border-green-200 text-green-600 bg-green-50' : 'border-stone-200 text-stone-400 bg-stone-50'}`}
                                                >
                                                    {product.is_active ? <><Eye size={12} /> Đang hiện</> : <><EyeOff size={12} /> Đang ẩn</>}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                                                        className="p-2 text-stone-400 hover:text-brand-terracotta hover:bg-orange-50 rounded-lg transition-all"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL EDITING (GIỮ NGUYÊN) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-6 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-brand-brown">
                                {editingProduct?.id ? "Chỉnh sửa sản phẩm" : "Đăng sản phẩm mới"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-brand-brown transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-h-[80vh] overflow-y-auto">
                            {/* CỘT 1: THÔNG TIN CƠ BẢN */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-bold text-brand-terracotta uppercase tracking-[2px] border-b pb-2">Hồ sơ sản phẩm</h3>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Tên hiển thị</label>
                                    <input
                                        required
                                        value={editingProduct?.name || ""}
                                        onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-sm"
                                        placeholder="Tên sản phẩm..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Giá bán (đ)</label>
                                        <input
                                            required
                                            type="number"
                                            value={editingProduct?.price || ""}
                                            onChange={e => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Giá gốc (đ)</label>
                                        <input
                                            type="number"
                                            value={editingProduct?.original_price || ""}
                                            onChange={e => setEditingProduct({ ...editingProduct, original_price: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-sm text-stone-400"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Xếp hạng sao</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={editingProduct?.rating || 4.9}
                                            onChange={e => setEditingProduct({ ...editingProduct, rating: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Lượt review</label>
                                        <input
                                            type="number"
                                            value={editingProduct?.reviews_count || 120}
                                            onChange={e => setEditingProduct({ ...editingProduct, reviews_count: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Nhãn dán (Badge)</label>
                                    <input
                                        value={editingProduct?.badge || ""}
                                        onChange={e => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-sm"
                                        placeholder="Ví dụ: BÁN CHẠY, MỚI NHẤT..."
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Danh mục / Mùa</label>
                                    <input
                                        value={editingProduct?.category || ""}
                                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-sm"
                                        placeholder="Tết 2026, Trung Thu..."
                                    />
                                </div>
                            </div>

                            {/* CỘT 2: HÌNH ẢNH & ĐẶC ĐIỂM */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-bold text-brand-terracotta uppercase tracking-[2px] border-b pb-2">Hình ảnh & Điểm nhấn</h3>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Ảnh đại diện (Link)</label>
                                    <input
                                        required
                                        value={editingProduct?.image || ""}
                                        onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-sm"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Bộ sưu tập ảnh (JSON Array)</label>
                                    <textarea
                                        value={typeof editingProduct?.images === 'string' ? editingProduct.images : JSON.stringify(editingProduct?.images || [], null, 2)}
                                        onChange={e => setEditingProduct({ ...editingProduct, images: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-[10px] font-mono h-32"
                                        placeholder='["link_anh_1", "link_anh_2"...]'
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Phân loại (Kích thước, Màu sắc - JSON)</label>
                                    <textarea
                                        value={typeof editingProduct?.variants === 'string' ? editingProduct.variants : JSON.stringify(editingProduct?.variants || [], null, 2)}
                                        onChange={e => setEditingProduct({ ...editingProduct, variants: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-[10px] font-mono h-32"
                                        placeholder='[{"name": "Kích thước", "options": ["30cm", "40cm"]}]'
                                    />
                                </div>
                            </div>

                            {/* CỘT 3: CHI TIẾT KỸ THUẬT */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-bold text-brand-terracotta uppercase tracking-[2px] border-b pb-2">Thông tin chi tiết</h3>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Đặc điểm nổi bật (JSON Array)</label>
                                    <textarea
                                        value={typeof editingProduct?.features === 'string' ? editingProduct.features : JSON.stringify(editingProduct?.features || [], null, 2)}
                                        onChange={e => setEditingProduct({ ...editingProduct, features: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-[10px] font-mono h-24"
                                        placeholder='["Thủ công 100%", "Bền màu"...]'
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Giai thoại sản phẩm</label>
                                    <textarea
                                        value={editingProduct?.description || ""}
                                        onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-sm h-24"
                                        placeholder="Kể một câu chuyện về sản phẩm này..."
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Thông số kỹ thuật (JSON Array)</label>
                                    <textarea
                                        value={typeof editingProduct?.specs === 'string' ? editingProduct.specs : JSON.stringify(editingProduct?.specs || [], null, 2)}
                                        onChange={e => setEditingProduct({ ...editingProduct, specs: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-[10px] font-mono h-24"
                                        placeholder='[{"label": "Chất liệu", "value": "Tre"}]'
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Hướng dẫn bảo quản (JSON Array)</label>
                                    <textarea
                                        value={typeof editingProduct?.preservation === 'string' ? editingProduct.preservation : JSON.stringify(editingProduct?.preservation || [], null, 2)}
                                        onChange={e => setEditingProduct({ ...editingProduct, preservation: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B45309] text-[10px] font-mono h-24"
                                        placeholder='["Tránh ẩm ướt"...]'
                                    />
                                </div>
                            </div>

                            {/* FOOTER ACTIONS */}
                            <div className="col-span-full pt-6 border-t border-stone-100 flex items-center justify-between gap-4">
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={editingProduct?.is_active ?? true}
                                            onChange={e => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                                            className="w-4 h-4 rounded text-brand-terracotta focus:ring-brand-terracotta"
                                        />
                                        <label htmlFor="is_active" className="text-xs font-bold text-brand-brown">Kích hoạt bán</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_combo"
                                            checked={editingProduct?.is_combo || false}
                                            onChange={e => setEditingProduct({ ...editingProduct, is_combo: e.target.checked })}
                                            className="w-4 h-4 rounded text-brand-terracotta focus:ring-brand-terracotta"
                                        />
                                        <label htmlFor="is_combo" className="text-xs font-bold text-brand-brown">Sản phẩm Combo</label>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-8 py-4 bg-stone-100 text-brand-brown font-bold rounded-2xl hover:bg-stone-200 transition-all"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-12 py-4 bg-[#B45309] text-white font-bold rounded-2xl shadow-xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
