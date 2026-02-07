"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/data/mock-products";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  onBuyNow?: (product: Product) => void;
}

export default function ProductCard({ product, onBuyNow }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const isBestSeller =
    typeof product.badge === "string" && product.badge.includes("Bán chạy");

  const handleAction = () => {
    if (onBuyNow) {
      onBuyNow(product);
    } else {
      addToCart(product);
      toast.success(`Đã thêm "${product.name}" vào giỏ!`, {
        action: {
          label: "Thanh toán",
          onClick: () => router.push('/checkout')
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-orange-100 flex flex-col h-full group">
      <Link href={`/shop/${product.id}`} className="block relative aspect-square overflow-hidden bg-orange-50 cursor-pointer">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badge giảm giá */}
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-white animate-pulse">
          -{discount}%
        </div>

        {/* Badge Bán chạy */}
        {isBestSeller && (
          <div className="absolute top-2 right-2 bg-brand-amber text-brand-brown text-[11px] font-semibold px-2 py-1 rounded-full shadow-sm">
            Bán chạy
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Add to wishlist logic if needed
          }}
          className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-brand-terracotta shadow-sm hover:bg-brand-beige transition-colors z-10"
        >
          <Heart className="w-4 h-4" />
        </button>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/shop/${product.id}`} className="font-bold text-brand-brown text-lg leading-tight mb-2 line-clamp-2 min-h-[3rem] hover:text-brand-terracotta transition-colors">
          {product.name}
        </Link>

        <p className="text-xs text-stone-500 mb-3">
          Đã có{" "}
          <span className="font-semibold text-brand-brown">
            {product.sold}
          </span>{" "}
          bạn đặt
        </p>

        <div className="mt-auto pt-3 border-t border-orange-50">
          <div className="flex items-baseline justify-between mb-3 gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-stone-400 line-through decoration-stone-300">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(product.originalPrice)}
              </span>
              <span
                className="text-lg font-bold"
                style={{ color: "var(--primary-theme)" }}
              >
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(product.price)}
              </span>
            </div>
          </div>

          <button
            onClick={handleAction}
            className="w-full text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shadow-orange-200 hover:brightness-110 active:brightness-90 active:scale-95"
            style={{ background: "var(--btn-gradient)" }}
          >
            <ShoppingCart className="w-4 h-4" />
            {onBuyNow ? "Mua Ngay" : "Rinh về ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}
