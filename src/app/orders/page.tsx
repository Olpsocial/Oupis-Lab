"use client";

import Header from "../components/header";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ArrowRight, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const { cartItems, removeFromCart, totalAmount, updateQuantity } = useCart();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-brand-brown font-body pb-24">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 w-full">
        <h1 className="text-2xl font-bold font-hand text-brand-brown mb-6">
          Giỏ hàng của bạn
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-orange-100 shadow-sm">
            <div className="mb-4 text-6xl">🍂</div>
            <p className="text-stone-500 mb-6">Giỏ hàng đang trống trơn nè...</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-brand-terracotta text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#9a4205] transition-colors"
            >
              Dạo cửa tiệm ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm">
              <ul className="divide-y divide-orange-50">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-4 flex gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-orange-50">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-brand-brown line-clamp-2 text-sm sm:text-base">
                          {item.name}
                        </h3>
                        <p className="text-xs text-stone-400 mt-1">
                          Đơn giá: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-stone-200 rounded-lg bg-orange-50/30 overflow-hidden h-8">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 h-full hover:bg-white text-stone-500 transition-colors border-r border-stone-100"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-brand-brown">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 h-full hover:bg-white text-stone-500 transition-colors border-l border-stone-100"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-500 hover:text-red-500 transition-colors p-1.5"
                          aria-label="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tổng cộng */}
            {cartItems.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500">Tạm tính</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-brand-brown">
                  <span>Tổng cộng</span>
                  <span className="text-brand-terracotta">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                  </span>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-brand-terracotta text-white py-3.5 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-orange-200"
                  style={{ background: "linear-gradient(135deg, #B45309 0%, #D97706 100%)" }}
                >
                  TIẾN HÀNH ĐẶT HÀNG
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
