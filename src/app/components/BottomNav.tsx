"use client";

import { Home, ShoppingBag, ShoppingCart, Truck, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import ChatDrawer from "./chat-drawer";

export default function BottomNav() {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const navItems = [
        {
            icon: Home,
            label: "Trang chủ",
            href: "/",
            active: pathname === "/",
        },
        {
            icon: ShoppingBag,
            label: "Cửa hàng",
            href: "/shop",
            active: pathname === "/shop",
        },
        {
            icon: ShoppingCart,
            label: "Giỏ hàng",
            href: "/checkout",
            active: pathname === "/checkout",
            badge: cartCount > 0 ? cartCount : undefined,
        },
        {
            icon: Truck,
            label: "Vận chuyển",
            href: "/track",
            active: pathname === "/track",
        },
        // We will handle the last item manually as a button
    ];

    return (
        <>
            <style jsx global>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s infinite ease-in-out;
                }
            `}</style>
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FDFBF7] border-t border-orange-100 shadow-[0_-4px_20px_rgba(180,83,9,0.08)] md:hidden pb-safe">
                <div className="flex items-center justify-between px-2 py-2">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = item.active;

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex flex-col items-center justify-center w-full py-1 relative transition-colors duration-200`}
                                style={{ color: isActive ? "var(--primary-theme)" : undefined }}
                            >
                                <div className="relative">
                                    <Icon
                                        className={`w-6 h-6 mb-1 transition-transform duration-300 ${isActive ? "stroke-[2.5px] scale-110" : "text-gray-400 stroke-2"} 
                                        ${item.label === "Đơn hàng" && item.badge && "animate-bounce-slow text-orange-600"}`}
                                    />
                                    {item.badge !== undefined && (
                                        <span
                                            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 animate-pulse shadow-lg"
                                            style={{
                                                backgroundColor: "#EA580C",
                                                borderColor: "#FFF7ED",
                                                boxShadow: "0 0 10px rgba(234, 88, 12, 0.5)"
                                            }}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold leading-none ${item.label === "Giỏ hàng" && item.badge ? "text-orange-700" : ""}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Chat Button (Replaces Về Tiệm) */}
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className={`flex flex-col items-center justify-center w-full py-1 relative transition-colors duration-200`}
                    >
                        <div className="relative">
                            <MessagesSquare
                                className={`w-6 h-6 mb-1 text-brand-terracotta stroke-2`}
                            />
                        </div>
                        <span className="text-[10px] font-bold leading-none text-brand-terracotta">
                            Tư vấn Decor
                        </span>
                    </button>
                </div>
            </div>

            <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
    );
}
