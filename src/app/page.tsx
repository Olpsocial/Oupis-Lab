"use client";

import Header from "./components/header";
import HeroNote from "./components/hero-note";
import ProductCard from "./components/product-card";
import Footer from "./components/footer";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { getCurrentSeason } from "@/config/themes";
import { useMemo, useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Memoize theme to avoid recalculation on every render, though cheap.
  const theme = useMemo(() => getCurrentSeason(), []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true) // CHỈ LẤY SẢN PHẨM ĐANG HIỆN
        .limit(8); // Chỉ lấy 8 sản phẩm tiêu biểu cho trang chủ

      if (error) throw error;

      const mapped = (data || []).map(p => ({
        ...p,
        originalPrice: p.original_price,
        isCombo: p.is_combo
      }));

      setDbProducts(mapped);
    } catch (e) {
      console.error("Lỗi fetch sản phẩm trang chủ:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col font-body transition-colors duration-500"
      style={{
        color: "#78350f",
      }}
    >
      <Header />

      <main className="flex-1 relative">
        {/* Hero / Bảng tin */}
        <div className="relative z-10">
          <HeroNote />
        </div>

        {/* Product Section */}
        <section className="px-4 py-10 max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles
              className="w-5 h-5"
              style={{ color: "var(--primary-theme)" }} // Dynamic color
            />
            <h2
              className="text-xl sm:text-2xl font-bold text-brand-brown"
            >
              {theme.id === "TET" ? "Góc quà Tết xinh xinh" : "Góc quà xinh xắn"}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-sm font-medium">Đang bầy hàng lên kệ...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {dbProducts.map((product) => (
                  <div key={product.id} className="h-full">
                    <ProductCard
                      product={product}
                      onBuyNow={(p) => {
                        addToCart(p);
                        router.push('/checkout');
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => router.push('/shop')}
                  className="px-8 py-3 rounded-full border-2 border-brand-terracotta text-brand-terracotta font-bold text-sm bg-white hover:bg-orange-50 transition-all shadow-md flex items-center gap-2 group active:scale-95"
                >
                  Ghé cửa tiệm xem tất cả
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

