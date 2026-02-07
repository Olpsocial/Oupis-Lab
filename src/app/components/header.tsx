"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Info, User, LogOut, MapPin, MessagesSquare } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import StoryModal from "./story-modal";
import TopBar from "./TopBar";
import ChatDrawer from "./chat-drawer";

export default function Header() {
  // Use cart logic only
  const { cartCount, user, logout } = useCart();
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<any>(null);
  const pathname = usePathname();

  // Listen for global event to open chat
  useEffect(() => {
    const handleOpenChat = (e: any) => {
      if (e.detail?.product) {
        setChatContext(e.detail.product);
      }
      setIsChatOpen(true);
    };
    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
  }, []);

  const navItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Cửa tiệm", href: "/shop" },
    { name: "Tra cứu đơn", href: "/track" },
    // { name: "Hái Lộc Tết", href: "/arcade" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-orange-100/50 flex flex-col transition-all">
      <TopBar />
      <div className="w-full max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="font-[family-name:var(--font-patrick-hand)] text-4xl font-bold transition-colors"
                style={{ color: "#B45309" }}
              >
                Nhà Kim Hương
              </Link>
              {/* Lồng đèn (Lantern) Icon for Tet Vibe */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-red-600 -mt-2 animate-bounce hover:animate-ping"
              >
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" fillOpacity="0" />
                <path d="M12.75 2a.75.75 0 00-1.5 0v2.052c-2.34.218-4.437 1.34-5.892 3.098-.458.553-.306 1.378.32 1.73l.63.353c.48.27 1.08.15 1.442-.266.974-1.119 2.37-1.84 3.92-1.947V2zM12.75 19.948v2.052a.75.75 0 01-1.5 0v-2.052c-1.55-.107-2.946-.828-3.92-1.947-.362-.416-.962-.536-1.442-.266l-.63.353c-.626.352-.778 1.177-.32 1.73 1.455 1.758 3.552 2.88 5.892 3.098z" />
                <path d="M12 4.5c-4.142 0-7.5 3.358-7.5 7.5s3.358 7.5 7.5 7.5 7.5-3.358 7.5-7.5-3.358-7.5-7.5-7.5zm0 13.5c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" fill="none" className="hidden" />
                {/* Simple Chinese Lantern shape */}
                <path d="M5.636 6.636a9 9 0 0112.728 0 9 9 0 010 12.728H5.636a9 9 0 010-12.728z" fill="#DC2626" />
                <path d="M12 2v2m0 16v2" stroke="#7F1D1D" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 4.5V19.5" stroke="#FCA5A5" strokeWidth="1" strokeDasharray="2 2" />
                <rect x="9" y="3" width="6" height="2" rx="1" fill="#7F1D1D" />
                <rect x="9" y="19" width="6" height="2" rx="1" fill="#7F1D1D" />
              </svg>
            </div>

            {/* Info Text Link - Mobile Only (Visible on small screens, hidden on md+) */}
            <div className="flex items-center gap-3 md:hidden ml-1">
              <button
                onClick={() => setIsStoryOpen(true)}
                className="flex items-center gap-1 text-[10px] text-brand-terracotta/80 hover:text-brand-terracotta transition-colors underline decoration-dotted underline-offset-2"
              >
                <Info className="w-2.5 h-2.5" />
                Giới thiệu
              </button>
              <Link
                href="/info"
                className="flex items-center gap-1 text-[10px] text-brand-terracotta/80 hover:text-brand-terracotta transition-colors underline decoration-dotted underline-offset-2"
              >
                <MapPin className="w-2.5 h-2.5" />
                Ghé tiệm
              </Link>
            </div>
          </div>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-bold transition-all relative py-1 ${isActive(item.href)
                ? "text-brand-terracotta"
                : item.href === "/arcade"
                  ? "text-red-600 hover:text-red-700 animate-pulse"
                  : "text-brand-brown hover:text-brand-terracotta"
                }`}
            >
              {item.href === "/arcade" && <span className="mr-1">🧧</span>}
              {item.name}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-terracotta rounded-full"></span>
              )}
            </Link>
          ))}
          {/* Story Button in Nav */}
          <button
            onClick={() => setIsStoryOpen(true)}
            className="text-sm font-bold text-brand-brown hover:text-brand-terracotta transition-colors"
          >
            Câu chuyện
          </button>
          <Link
            href="/info"
            className={`text-sm font-bold transition-all relative py-1 ${isActive("/info")
              ? "text-brand-terracotta"
              : "text-brand-brown hover:text-brand-terracotta"
              }`}
          >
            Ghé tiệm
            {isActive("/info") && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-terracotta rounded-full"></span>
            )}
          </Link>

          {/* AI Advisor Button */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-50 border border-orange-200 text-sm font-bold text-brand-terracotta hover:from-orange-200 hover:to-amber-100 transition-all shadow-sm group"
          >
            <MessagesSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Tư vấn Decor</span>
          </button>
        </nav>

        {/* ACTION BUTTONS (Cart & Auth) */}
        <div className="flex items-center gap-2">

          {/* AUTH BUTTON */}
          {user ? (
            <div className="relative group">
              <button className="p-2 rounded-full border border-stone-200 text-brand-brown hover:bg-orange-50 hover:border-brand-terracotta transition-all">
                <User size={18} />
              </button>
              {/* Simple Dropdown on Hover */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
                <div className="px-3 py-2 border-b border-stone-100 mb-1">
                  <p className="text-xs text-stone-500">Xin chào,</p>
                  <p className="text-sm font-bold text-brand-brown truncate">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <Link href="/auth">
              <button className="px-4 py-1.5 rounded-full border border-stone-200 text-sm font-bold text-brand-brown hover:bg-orange-50 hover:text-brand-terracotta hover:border-brand-terracotta transition-all hidden sm:block">
                Đăng nhập
              </button>
              <button className="p-2 rounded-full border border-stone-200 text-brand-brown hover:bg-orange-50 hover:border-brand-terracotta transition-all block sm:hidden">
                <User size={18} />
              </button>
            </Link>
          )}

          {/* CART BUTTON */}
          <Link href="/checkout">
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-orange-50/80 border-orange-200 transition-all text-sm font-bold shadow-sm text-brand-terracotta hover:bg-brand-terracotta hover:text-white hover:border-brand-terracotta group"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 transition-colors" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white animate-pulse shadow-md font-bold"
                    style={{
                      backgroundColor: "#EA580C",
                      boxShadow: "0 0 8px rgba(234, 88, 12, 0.4)"
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline transition-colors">Giỏ hàng</span>

            </button>
          </Link>
        </div>
      </div>
      <StoryModal isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} context={chatContext} />
    </header>
  );
}
