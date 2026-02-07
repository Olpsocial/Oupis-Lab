"use client";

// Footer doesn't really need useCart anymore if using variables.
export default function Footer() {
    return (
        <footer className="bg-stone-100 pt-12 pb-10 px-4 border-t border-orange-100">
            <div className="max-w-md mx-auto text-center space-y-6">
                <div
                    className="font-hand text-2xl font-bold"
                    style={{ color: "var(--primary-theme)" }}
                >
                    Nhà Kim Hương.
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative">
                    <p className="text-amber-950/80 leading-relaxed font-[family-name:var(--font-quicksand)]">
                        "Nhà Kim Hương - Góc nhỏ tỉ mẩn cho những món quà tự tay làm. Cam kết đồng hành cùng bạn trong mọi dự án DIY."
                    </p>
                </div>

                <div className="text-xs text-stone-400">
                    © {new Date().getFullYear()} Nhà Kim Hương. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
