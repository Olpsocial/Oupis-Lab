"use client";

import { useState, useRef, MouseEvent, useEffect } from "react";
import ProductCard from "../components/product-card";
import Header from "../components/header";
import { Search, Filter, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ShopPage() {
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State cho chế độ xem: "decor" (Showroom) hoặc "material" (Nguyên liệu/DIY)
  const [shopMode, setShopMode] = useState<"decor" | "material">("decor");
  // State tìm kiếm và lọc
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<"price_asc" | "bestseller" | "rating_desc" | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      const mapped = (data || []).map(p => ({
        ...p,
        originalPrice: p.original_price,
        isCombo: p.is_combo
      }));

      setDbProducts(mapped);
    } catch (e) {
      console.error("Lỗi fetch sản phẩm:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Utility: Xóa dấu tiếng Việt đẻ tìm kiếm thông minh hơn
  const removeAccents = (str: string) => {
    return str.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .toLowerCase();
  }

  // Categories khác nhau cho mỗi Mode
  const decorCategories = [
    { id: "all", name: "Tất cả" },
    { id: "tet", name: "Mẹt Hoa & Tết" },
    { id: "len", name: "Len & Đan Móc" },
    { id: "kem", name: "Kẽm Nhung" },
    { id: "khac", name: "Thủ Công Khác" },
  ];

  const materialCategories = [
    { id: "all", name: "Tất cả" },
    { id: "hoa", name: "Hoa Lụa/Giả" },
    { id: "nen", name: "Mẹt & Nền" },
    { id: "phukien", name: "Phụ Kiện Treo" },
    { id: "dungcu", name: "Dụng Cụ (Keo/Kéo)" },
    { id: "combo", name: "DIY KIT (Combo)" },
  ];

  const categories = shopMode === "decor" ? decorCategories : materialCategories;

  // Reset category khi chuyển mode
  const handleModeSwitch = (mode: "decor" | "material") => {
    setShopMode(mode);
    setActiveCategory("all");
    setSearchQuery("");
    setSortOption(null);
  };

  const [activeCategory, setActiveCategory] = useState("all");

  // Drag to scroll logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const filteredProducts = dbProducts.filter((product) => {
    // 0. Lọc theo Search Query (Smart Search - Bỏ dấu)
    if (searchQuery.trim() !== "") {
      const term = removeAccents(searchQuery.trim());
      const name = removeAccents(product.name);

      // Logic: Từng từ trong query phải xuất hiện trong tên (không cần đúng thứ tự)
      // Ví dụ: "met hoa" khớp "Mẹt tre hoa đào"
      const words = term.split(/\s+/);
      const isMatch = words.every(w => name.includes(w));

      if (!isMatch) return false;
    }

    // 1. Lọc theo Shop Mode (Quan trọng nhất)
    if (shopMode === "decor") {
      if (product.type !== "decor") return false;
    } else {
      if (product.type !== "material" && product.type !== "diy-kit") return false;
    }

    // 2. Lọc theo Category
    if (activeCategory === "all") return true;

    const pName = product.name.toLowerCase();

    // Logic lọc cho Decor Mode
    if (shopMode === "decor") {
      if (activeCategory === "tet") return pName.includes("mẹt") || pName.includes("hoa") || pName.includes("tết");
      if (activeCategory === "len") return pName.includes("len") || pName.includes("đan");
      if (activeCategory === "kem") return pName.includes("kẽm") || pName.includes("combo");
      if (activeCategory === "khac") return pName.includes("giấy") || pName.includes("lồng đèn");
    }
    // Logic lọc cho Material Mode
    else {
      if (activeCategory === "hoa") return pName.includes("hoa") || pName.includes("cành") || pName.includes("kẽm") || pName.includes("nhung");
      if (activeCategory === "nen") return pName.includes("mẹt") || pName.includes("giấy");
      if (activeCategory === "phukien") return pName.includes("dây") || pName.includes("treo");
      if (activeCategory === "dungcu") return pName.includes("súng") || pName.includes("kéo");
      if (activeCategory === "combo") return product.type === "diy-kit" || pName.includes("combo") || pName.includes("kit");
    }

    return true;
  }).sort((a, b) => {
    // 3. Sorting
    if (sortOption === "price_asc") return a.price - b.price;
    if (sortOption === "bestseller") return (b.sold || 0) - (a.sold || 0);
    if (sortOption === "rating_desc") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 font-body pb-24 ${shopMode === "decor" ? "bg-[#FDFBF7]" : "bg-stone-50"
      }`}>
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        {/* Shop Switcher Header */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-bold font-hand mb-2 text-center transition-colors duration-300"
            style={{ color: shopMode === "decor" ? "#B45309" : "#44403C" }}>
            {shopMode === "decor" ? "Cửa Tiệm Nhà Kim Hương" : "Góc Tự Làm & Nguyên Liệu"}
          </h1>
          <p className="text-center text-stone-500 mb-6 max-w-2xl mx-auto text-sm md:text-base">
            {shopMode === "decor"
              ? "Những món quà thủ công rực rỡ sắc màu, gói trọn phong vị Tết."
              : "Tự tay làm quà, gửi gắm yêu thương. Đầy đủ nguyên liệu cho bạn trổ tài."}
          </p>

          {/* MODE SWITCHER TOGGLE */}
          <div className="bg-white p-1 rounded-full shadow-sm border border-stone-200 flex gap-1 relative z-10">
            <button
              onClick={() => handleModeSwitch("decor")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${shopMode === "decor"
                ? "bg-orange-600 text-white shadow-md"
                : "text-stone-500 hover:bg-stone-100"
                }`}
            >
              <span>🎁</span> Mua Đồ Decor
            </button>
            <button
              onClick={() => handleModeSwitch("material")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${shopMode === "material"
                ? "bg-stone-700 text-white shadow-md"
                : "text-stone-500 hover:bg-stone-100"
                }`}
            >
              <span>✂️</span> Mua Nguyên Liệu
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER BAR - NEW ADDITION */}
        <div className="flex gap-2 max-w-md mx-auto mb-6 px-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Bạn đang tìm gì..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-colors ${showFilters || sortOption ? 'bg-orange-100 border-orange-200 text-brand-terracotta' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* EXPANDABLE FILTERS */}
        {showFilters && (
          <div className="max-w-md mx-auto mb-6 bg-white p-4 rounded-xl border border-stone-100 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-bold text-brand-brown">Bộ lọc nhanh:</p>
              {sortOption && (
                <button onClick={() => setSortOption(null)} className="text-xs text-stone-400 hover:text-red-500 hover:underline">Đặt lại</button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setSortOption(current => current === "price_asc" ? null : "price_asc")}
                className={`px-3 py-1.5 rounded-lg border transition-all ${sortOption === "price_asc" ? "bg-orange-50 border-orange-200 text-brand-terracotta font-bold" : "bg-stone-50 border-transparent text-stone-600 hover:bg-stone-100"}`}
              >
                Giá thấp đến cao
              </button>
              <button
                onClick={() => setSortOption(current => current === "bestseller" ? null : "bestseller")}
                className={`px-3 py-1.5 rounded-lg border transition-all ${sortOption === "bestseller" ? "bg-orange-50 border-orange-200 text-brand-terracotta font-bold" : "bg-stone-50 border-transparent text-stone-600 hover:bg-stone-100"}`}
              >
                Bán chạy nhất
              </button>
              <button
                onClick={() => setSortOption(current => current === "rating_desc" ? null : "rating_desc")}
                className={`px-3 py-1.5 rounded-lg border transition-all ${sortOption === "rating_desc" ? "bg-orange-50 border-orange-200 text-brand-terracotta font-bold" : "bg-stone-50 border-transparent text-stone-600 hover:bg-stone-100"}`}
              >
                Đánh giá cao
              </button>
            </div>
          </div>
        )}

        {/* Category Chips - Scrollable on mobile */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar justify-start sm:justify-center px-1 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat.id
                ? shopMode === "decor"
                  ? "bg-orange-600 text-white shadow-md shadow-orange-200"
                  : "bg-stone-700 text-white shadow-md shadow-stone-300"
                : "bg-white text-stone-500 border border-stone-200 hover:bg-stone-100"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center justify-center text-stone-400">
            <div className="text-4xl mb-2">🍃</div>
            <p>Chưa tìm thấy sản phẩm nào.</p>
            {sectionHints(shopMode, searchQuery)}
          </div>
        )}
      </main>
    </div>
  );
}



function sectionHints(mode: string, query: string) {
  if (query) return <p className="text-sm mt-1">Thử từ khóa khác xem sao nhé!</p>;
  if (mode === "material") return <p className="text-sm mt-1">Gợi ý: Thử tìm trong phần "DIY KIT" xem sao nhé!</p>;
  return null;
}
