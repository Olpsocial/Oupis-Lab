"use client";

import { getCurrentSeason } from "@/config/themes";
import { useMemo } from "react";

export default function HeroNote() {
  const theme = useMemo(() => getCurrentSeason(), []);

  return (
    <section className="relative py-10 px-4">
      {/* Nền bảng bần */}
      <div className="absolute inset-0 bg-cork-pattern opacity-70 z-0" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="bg-brand-beige p-7 shadow-2xl -rotate-2 rounded-md relative transform transition-transform hover:rotate-0 duration-300">
          {/* Pin tròn giả */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
            <div
              className="w-4 h-4 rounded-full shadow-md border-2 border-brand-brown"
              style={{ backgroundColor: "var(--primary-theme)" }}
            />
            <div className="w-1 h-3 bg-stone-400 mx-auto -mt-1 opacity-60" />
          </div>

          <div className="font-hand text-xl leading-relaxed text-brand-brown space-y-3">
            <h2 className="text-2xl font-bold" style={{ color: "var(--primary-theme)" }}>
              {theme.texts.heroTitle}
            </h2>
            <p>
              {theme.texts.heroSubtitle}
            </p>
            <p>Mời bạn ngó nghiêng nhé!</p>
          </div>

          <div className="absolute bottom-4 right-4 opacity-70 -rotate-12 pb-2 transform transition-transform hover:scale-110">
            <div
              className="w-20 h-20 border-4 rounded-full flex items-center justify-center border-double"
              style={{ borderColor: "var(--primary-theme)" }}
            >
              <span
                className="font-bold text-sm tracking-widest -rotate-6"
                style={{ color: "var(--primary-theme)" }}
              >
                HANDMADE
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
