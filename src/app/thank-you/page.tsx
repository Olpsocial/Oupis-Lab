"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Home, Copy, ArrowRight, MessageCircle } from "lucide-react";
import Header from "../components/header";
import { toast } from "sonner";
import { useState, Suspense } from "react";

// --- CONFIG YOUR BANK INFO HERE ---
const BANK_ID = "MB"; // Mã ngân hàng (VD: MB, VCB, ACB, TPB)
const BANK_ACCOUNT = "0000000000"; // Số tài khoản (Demo)
const BANK_NAME = "NGUOI NHAN DEMO"; // Tên chủ tài khoản
const ZALO_PHONE = "0000000000"; // Số Zalo nhận xác nhận (Demo)
// ---------------------------------

function ThankYouContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const method = searchParams.get("method");
    const amount = searchParams.get("amount");

    const [copied, setCopied] = useState(false);

    // Shorten Order ID for content (Last 6 chars)
    const shortOrderId = orderId ? orderId.slice(-6).toUpperCase() : "XXXXXX";
    const transferContent = `THANHTOAN NHK ${shortOrderId}`;

    // VietQR Quicklink - Dùng template chuyên nghiệp
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_NAME)}`;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Đã sao chép!");
        setTimeout(() => setCopied(false), 2000);
    };

    const zaloMessage = `Chào Nhà Kim Hương, mình vừa chuyển khoản ${new Intl.NumberFormat("vi-VN").format(Number(amount))}đ cho đơn hàng #${shortOrderId}. Nhờ shop kiểm tra và gửi hàng sớm giúp mình nhé!`;
    const zaloUrl = `https://zalo.me/${ZALO_PHONE}`;

    return (
        <main className="flex-1 flex items-center justify-center p-4 py-10">
            <div className="bg-white max-w-lg w-full rounded-[2.5rem] shadow-2xl shadow-orange-100/50 border border-orange-100 p-2 sm:p-4">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                    {/* Header Status */}
                    <div className="bg-orange-50/50 p-10 text-center border-b border-orange-100">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle size={40} className="stroke-[3]" />
                        </div>
                        <h1 className="text-3xl font-bold text-brand-brown font-hand mb-2">Đặt hàng thành công!</h1>
                        <p className="text-stone-500 text-sm">Cảm ơn bạn đã tin tưởng chọn <span className="text-brand-terracotta font-bold">Nhà Kim Hương</span></p>
                    </div>

                    <div className="p-6 sm:p-8">
                        {/* BANKING SECTION ... (no change in logic, just ensuring no clipping) */}
                        {method === "banking" && (
                            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="relative bg-white border-2 border-brand-terracotta/20 rounded-[2.5rem] p-4 sm:p-8 shadow-xl shadow-orange-50 overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100/30 rounded-full blur-3xl"></div>
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-100/30 rounded-full blur-3xl"></div>

                                    <h3 className="font-bold text-brand-brown mb-6 text-center text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                                        <span className="w-8 h-[1px] bg-stone-200"></span>
                                        Quét mã chuyển khoản
                                        <span className="w-8 h-[1px] bg-stone-200"></span>
                                    </h3>

                                    <div className="bg-white p-4 rounded-[2rem] border-2 border-orange-50 w-fit mx-auto shadow-sm mb-8 relative group">
                                        <div className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px]">
                                            <Image
                                                src={qrUrl}
                                                alt="VietQR Payment"
                                                fill
                                                className="mix-blend-multiply object-contain"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-terracotta rounded-tl-2xl"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-terracotta rounded-tr-2xl"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-terracotta rounded-bl-2xl"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-terracotta rounded-br-2xl"></div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 space-y-5">
                                            <div className="flex flex-col items-center text-center gap-1 border-b border-orange-100 pb-4">
                                                <span className="text-stone-500 text-xs font-semibold uppercase tracking-tighter">Số tiền cần thanh toán</span>
                                                <span className="font-black text-brand-terracotta text-3xl font-mono">
                                                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(amount))}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white border border-orange-50">
                                                    <span className="text-stone-400 text-[10px] font-bold uppercase ml-1">Số tài khoản</span>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-brand-brown text-lg sm:text-xl font-mono tracking-wider">{BANK_ACCOUNT}</span>
                                                        <button onClick={() => handleCopy(BANK_ACCOUNT)} className="bg-orange-100 text-brand-terracotta p-2 rounded-xl hover:bg-brand-terracotta hover:text-white transition-all">
                                                            <Copy size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white border border-brand-terracotta/30 ring-4 ring-orange-100/50">
                                                    <span className="text-brand-terracotta text-[10px] font-black uppercase ml-1">Nội dung chuyển khoản (Bắt buộc)</span>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-black text-brand-terracotta text-lg sm:text-xl font-mono uppercase tracking-tight">{transferContent}</span>
                                                        <button onClick={() => handleCopy(transferContent)} className="bg-brand-terracotta text-white p-2 rounded-xl hover:brightness-110 transition-all shadow-md shadow-orange-200">
                                                            <Copy size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-center gap-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest pt-2">
                                                <span><span className="w-1.5 h-1.5 bg-brand-terracotta rounded-full inline-block mr-1"></span> {BANK_ID} Bank</span>
                                                <span><span className="w-1.5 h-1.5 bg-brand-terracotta rounded-full inline-block mr-1"></span> {BANK_NAME}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-4">
                                    <a
                                        href={zaloUrl}
                                        target="_blank"
                                        className="w-full bg-[#0068FF] text-white font-bold py-5 rounded-[2rem] flex flex-col items-center justify-center gap-1 shadow-xl shadow-blue-200 active:scale-95 hover:brightness-110 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MessageCircle size={28} />
                                            <span className="text-lg">GỬI XÁC NHẬN QUA ZALO</span>
                                        </div>
                                        <span className="text-[10px] opacity-80 font-medium uppercase tracking-[0.2em]">Để shop chuẩn bị hàng sớm nhất</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        {method === "cod" && (
                            <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-orange-50 rounded-[2rem] p-8 mb-6 border border-orange-100">
                                    <p className="font-bold text-brand-brown text-xl mb-3 font-hand">Cảm ơn bạn nhiều!</p>
                                    <p className="text-stone-500 text-sm leading-relaxed">
                                        Đơn hàng đã được ghi nhận. Nhà Kim Hương sẽ sớm gọi điện xác nhận và gửi món quà này đến tay bạn nhé.
                                    </p>
                                </div>
                                <div className="w-32 h-32 bg-stone-100 rounded-full mx-auto flex items-center justify-center text-4xl">
                                    🎁
                                </div>
                            </div>
                        )}

                        {/* Actions - SIMPLIFIED BUTTONS TO REMOVE "HIDDEN" FEELING */}
                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-stone-100">
                            <Link
                                href="/"
                                className="bg-white border border-stone-200 text-stone-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-stone-50 active:scale-95 transition-all text-sm shadow-sm"
                            >
                                <Home size={18} /> Trang chủ
                            </Link>
                            <Link
                                href="/shop"
                                className="bg-[#2D2A26] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-stone-800 active:scale-95 transition-all text-sm shadow-md"
                            >
                                Mua thêm <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function ThankYouPage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] font-body flex flex-col">
            <Header />
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin"></div>
                </div>
            }>
                <ThankYouContent />
            </Suspense>
        </div>
    );
}
