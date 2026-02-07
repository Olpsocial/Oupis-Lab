"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Header from "../components/header";
import Link from "next/link";
import { ChevronLeft, MapPin, Phone, User, CreditCard, Banknote, Loader2, Minus, Plus, Trash2, Truck } from "lucide-react";
import Image from "next/image";

// 1. Define Validation Schema
const checkoutSchema = z.object({
    fullName: z.string().min(2, "Vui lòng nhập họ tên đầy đủ"),
    phone: z.string().min(10, "Số điện thoại không hợp lệ").regex(/^[0-9]+$/, "Chỉ được nhập số"),
    address: z.string().min(5, "Vui lòng nhập địa chỉ chi tiết"),
    shippingMethod: z.enum(["INNER_CITY", "OUTER_CITY"]),
    paymentMethod: z.enum(["COD", "BANKING"]),
    notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
    const { cartItems, totalAmount: cartTotal, clearCart, user, updateQuantity, removeFromCart, profile, saveProfile } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize Supabase Client
    const supabase = createClient();

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            paymentMethod: "COD",
            shippingMethod: "INNER_CITY",
        },
    });

    const { register, handleSubmit, formState: { errors }, reset, control, setValue } = form;

    // Watch shipping method to calculate fee
    const shippingMethod = useWatch({ control, name: "shippingMethod" });

    // Calculate shipping fee logic
    const shippingFee = shippingMethod === "INNER_CITY" ? 30000 : 0;
    const finalTotal = cartTotal + shippingFee;

    // Tự động điền form khi có profile
    useState(() => {
        if (profile) {
            reset({
                fullName: profile.full_name,
                phone: profile.phone,
                address: profile.address,
                paymentMethod: "COD",
                shippingMethod: "INNER_CITY"
            });
        }
    });

    // Cập nhật form nếu profile thay đổi sau khi load từ DB
    useEffect(() => {
        if (profile) {
            reset({
                fullName: profile.full_name,
                phone: profile.phone,
                address: profile.address,
                paymentMethod: form.getValues().paymentMethod || "COD",
                shippingMethod: form.getValues().shippingMethod || "INNER_CITY",
                notes: form.getValues().notes
            });
        }
    }, [profile, reset]);

    const onSubmit = async (data: CheckoutFormValues) => {
        if (cartItems.length === 0) {
            toast.error("Giỏ hàng đang trống!");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Create order in 'orders' table
            // Note: Ensure your 'orders' table has 'shipping_fee' and 'shipping_method' columns if you want to save them explicitly.
            // If not, we can save them in 'notes' or just proceed with 'total_amount'.
            const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert([
                    {
                        customer_name: data.fullName,
                        phone: data.phone,
                        address: data.address,
                        payment_method: data.paymentMethod,
                        // Saving shipping info (if columns exist, otherwise safely ignored or need migration)
                        shipping_fee: shippingFee,
                        shipping_method: data.shippingMethod,
                        total_amount: finalTotal,
                        status: "pending",
                        user_id: user?.id || null
                    },
                ])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create order items in 'order_items' table
            const orderItemsData = cartItems.map((item) => ({
                order_id: order.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
                variant: null,
                product_id: item.id,      // Ensure this column exists in DB
                image_url: item.image     // Ensure this column exists in DB
            }));

            const { error: itemsError } = await supabase
                .from("order_items")
                .insert(orderItemsData);

            if (itemsError) throw itemsError;

            // 3. Save profile for future use
            await saveProfile({
                full_name: data.fullName,
                phone: data.phone,
                address: data.address
            });

            // 4. Success handling
            toast.success("Đặt hàng thành công!");
            clearCart();

            // Redirect
            if (data.paymentMethod === "BANKING") {
                window.location.href = `/thank-you?orderId=${order.id}&method=banking&amount=${finalTotal}`;
            } else {
                window.location.href = `/thank-you?orderId=${order.id}&method=cod`;
            }
        } catch (error: any) {
            setIsSubmitting(false);
            toast.error("Lỗi: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-body pb-20">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 text-sm text-stone-500">
                    <Link href="/shop" className="hover:text-brand-terracotta flex items-center gap-1 transition-colors">
                        <ChevronLeft size={16} /> Tiếp tục mua sắm
                    </Link>
                    <span>/</span>
                    <span className="text-brand-brown font-semibold">Thanh toán</span>
                </div>

                <h1 className="text-2xl font-bold text-brand-brown mb-6">Xác nhận đơn hàng</h1>

                {!user && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <p className="text-sm font-bold text-brand-brown flex items-center gap-1">
                                <User size={16} className="text-brand-terracotta" />
                                Bạn đã có tài khoản?
                            </p>
                            <p className="text-xs text-stone-500 mt-1">Đăng nhập ngay để lưu đơn hàng vào lịch sử và nhận ưu đãi thành viên.</p>
                        </div>
                        <Link href="/auth" className="whitespace-nowrap px-4 py-2 bg-white border border-orange-200 rounded-lg text-sm font-bold text-brand-terracotta hover:bg-orange-100 transition-colors shadow-sm">
                            Đăng nhập / Đăng ký
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT: Shipping Form */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                            <h2 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
                                <MapPin className="text-brand-terracotta" size={20} />
                                Thông tin giao hàng
                            </h2>

                            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Họ và tên</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-stone-400" size={18} />
                                        <input
                                            {...register("fullName")}
                                            placeholder="Nguyễn Văn A"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-terracotta transition-colors"
                                        />
                                    </div>
                                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Số điện thoại</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 text-stone-400" size={18} />
                                        <input
                                            {...register("phone")}
                                            placeholder="0912..."
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-terracotta transition-colors"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Địa chỉ nhận hàng</label>
                                    <textarea
                                        {...register("address")}
                                        placeholder="Số nhà, tên đường, phường/xã..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-terracotta transition-colors resize-none"
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                                </div>
                            </form>
                        </div>

                        {/* Shipping Method Selection */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                            <h2 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
                                <Truck className="text-brand-terracotta" size={20} />
                                Đơn vị vận chuyển
                            </h2>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-orange-50 transition-colors has-[:checked]:border-brand-terracotta has-[:checked]:bg-orange-50/50">
                                    <input
                                        type="radio"
                                        value="INNER_CITY"
                                        {...register("shippingMethod")}
                                        className="w-5 h-5 accent-brand-terracotta"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-brand-brown">Nội thành</span>
                                            <span className="text-brand-terracotta font-bold">30.000₫</span>
                                        </div>
                                        <span className="text-xs text-stone-500 block">Giao nhanh trong nội thành</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-orange-50 transition-colors has-[:checked]:border-brand-terracotta has-[:checked]:bg-orange-50/50">
                                    <input
                                        type="radio"
                                        value="OUTER_CITY"
                                        {...register("shippingMethod")}
                                        className="w-5 h-5 accent-brand-terracotta"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-brand-brown">Ngoại thành / Tỉnh</span>
                                            <span className="text-stone-500 font-bold text-sm">Liên hệ sau</span>
                                        </div>
                                        <span className="text-xs text-stone-500 block">Phí ship tính theo thực tế đơn vị vận chuyển</span>
                                    </div>
                                </label>
                            </div>
                            {errors.shippingMethod && <p className="text-red-500 text-xs mt-1">{errors.shippingMethod.message}</p>}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                            <h2 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
                                <CreditCard className="text-brand-terracotta" size={20} />
                                Phương thức thanh toán
                            </h2>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-orange-50 transition-colors has-[:checked]:border-brand-terracotta has-[:checked]:bg-orange-50/50">
                                    <input
                                        type="radio"
                                        value="COD"
                                        {...register("paymentMethod")}
                                        className="w-5 h-5 accent-brand-terracotta"
                                    />
                                    <Banknote className="text-stone-600" size={24} />
                                    <div className="flex-1">
                                        <span className="font-semibold block text-brand-brown">Thanh toán khi nhận hàng (COD)</span>
                                        <span className="text-xs text-stone-500">Kiểm tra hàng rồi mới thanh toán</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-orange-50 transition-colors has-[:checked]:border-brand-terracotta has-[:checked]:bg-orange-50/50">
                                    <input
                                        type="radio"
                                        value="BANKING"
                                        {...register("paymentMethod")}
                                        className="w-5 h-5 accent-brand-terracotta"
                                    />
                                    <div className="w-6 h-6 relative opacity-80">
                                        {/* Placeholder for QR icon */}
                                        <Image src="/assets/qr-icon.png" alt="QR" width={24} height={24} className="object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                        {/* Fallback Icon if image missing */}
                                    </div>
                                    <span className="font-semibold block flex-1 text-brand-brown">Chuyển khoản (Mã QR)</span>
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded">Khuyên dùng</span>
                                </label>
                            </div>
                            {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod.message}</p>}
                        </div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="h-fit space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                            <h2 className="text-lg font-bold text-brand-brown mb-4">Đơn hàng của bạn</h2>

                            <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.length === 0 ? (
                                    <p className="text-stone-500 text-center italic py-4">Giỏ hàng trống</p>
                                ) : (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3 bg-stone-50/50 p-2 rounded-xl border border-stone-100/50 group">
                                            <div className="w-20 h-20 relative bg-stone-100 rounded-lg overflow-hidden shrink-0">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-0.5">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="text-sm font-bold text-brand-brown line-clamp-1 flex-1">{item.name}</h4>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-stone-400 hover:text-red-500 transition-colors p-1"
                                                            title="Xóa sản phẩm"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm font-black text-brand-terracotta mt-0.5">
                                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden shadow-sm">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="p-1 px-2 hover:bg-stone-50 text-stone-500 transition-colors border-r border-stone-100"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-bold text-brand-brown">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="p-1 px-2 hover:bg-stone-50 text-stone-500 transition-colors border-l border-stone-100"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs font-bold text-stone-400">
                                                        Tổng: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t border-dashed border-stone-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-stone-600">
                                    <span>Tạm tính</span>
                                    <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-stone-600">
                                    <span>Phí vận chuyển</span>
                                    <span className={shippingFee > 0 ? "text-brand-brown font-medium" : "text-stone-400 italic"}>
                                        {shippingMethod === "OUTER_CITY"
                                            ? "Liên hệ sau"
                                            : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(shippingFee)
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-brand-brown pt-2 border-t border-stone-100 mt-2">
                                    <span>Tổng cộng</span>
                                    <span className="text-brand-terracotta">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(finalTotal)}
                                    </span>
                                </div>
                                {shippingMethod === "OUTER_CITY" && (
                                    <p className="text-xs text-stone-500 italic text-right">* Chưa bao gồm phí ship ngoại tỉnh</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={isSubmitting || cartItems.length === 0}
                                className="w-full mt-6 bg-brand-terracotta text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 "
                                style={{ background: "linear-gradient(135deg, #B45309 0%, #D97706 100%)" }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "HOÀN TẤT ĐƠN HÀNG"
                                )}
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-3 text-xs text-stone-500 text-center">
                            <div className="bg-orange-50 p-2 rounded-lg flex flex-col items-center">
                                <span className="font-bold text-brand-terracotta mb-1">Bảo mật tuyệt đối</span>
                                Thông tin được mã hóa
                            </div>
                            <div className="bg-orange-50 p-2 rounded-lg flex flex-col items-center">
                                <span className="font-bold text-brand-terracotta mb-1">Đổi trả dễ dàng</span>
                                Trong vòng 3 ngày
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
