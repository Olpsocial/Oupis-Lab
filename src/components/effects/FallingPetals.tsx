"use client";

import React, { useEffect, useState } from "react";

// Số lượng cánh hoa muốn rơi (Đừng nhiều quá kẻo lag máy)
const PETAL_COUNT = 12;

interface PetalStyle extends React.CSSProperties {
  "--left": string;
  "--delay": string;
  "--duration": string;
  "--sway-duration": string;
  "--scale": string;
  "--rotation-start": string;
  "--rotation-end": string;
}

const FallingPetals = () => {
  const [petals, setPetals] = useState<PetalStyle[]>([]);

  useEffect(() => {
    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    const newPetals: PetalStyle[] = Array.from({ length: PETAL_COUNT }).map(
      (_, i) => {
        const duration = random(20, 30);
        const delay = random(-duration, 0);

        const colorPool = [
          { main: "#fbbf24", accent: "#d97706" },
          { main: "#ef4444", accent: "#b91c1c" },
          { main: "#fde047", accent: "#eab308" },
          { main: "#10b981", accent: "#059669" },
        ];
        const selectedColor = colorPool[Math.floor(Math.random() * colorPool.length)];

        return {
          "--left": `${random(0, 100)}vw`,
          "--delay": `${delay}s`,
          "--duration": `${duration}s`,
          "--sway-duration": `${random(6, 10)}s`,
          "--scale": `${random(0.4, 0.9)}`,
          "--rotation-start": `${random(0, 360)}deg`,
          "--rotation-end": `${random(360, 720)}deg`,

          position: "fixed",
          top: "-10%",
          left: "var(--left)",
          width: "16px",
          height: "16px",
          borderRadius: "100% 0% 100% 50%",
          background: `radial-gradient(circle at 30% 30%, ${selectedColor.main}, ${selectedColor.accent})`,
          transform: "rotate(-45deg)",
          pointerEvents: "none",
          zIndex: 1,
          opacity: 0.6,
          willChange: "transform, top",

          animation:
            `fall-advanced var(--duration) cubic-bezier(0.25, 0.1, 0.25, 1) infinite var(--delay),
             sway-advanced var(--sway-duration) ease-in-out infinite alternate var(--delay)`,
        } as PetalStyle;
      }
    );
    setPetals(newPetals);
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes fall-advanced {
          0% {
            top: -10%;
            transform: scale(var(--scale)) rotate(var(--rotation-start));
          }
          100% {
            top: 110%;
            transform: scale(var(--scale)) rotate(var(--rotation-end));
          }
        }

        @keyframes sway-advanced {
          0% {
            margin-left: -30px;
          }
          100% {
            margin-left: 30px;
          }
        }
      `}</style>

      {/* Render các cánh hoa */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
        {petals.map((style, index) => (
          <div key={index} style={style} className="petal-fall" />
        ))}
      </div>
    </>
  );
};

export default FallingPetals;
