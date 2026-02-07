import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          beige: "#FDFBF7", // Màu nền giấy cũ (ấm áp)
          amber: "#F59E0B", // Màu vàng gỗ
          terracotta: "#B45309", // Màu đất nung (Dùng cho nút bấm chính)
          brown: "#78350F", // Màu chữ chính
          green: "#15803D", // Màu xanh lá (Trạng thái còn hàng)
        }
      },
      fontFamily: {
        hand: ["var(--font-patrick-hand)", "cursive"], // Font viết tay
        body: ["var(--font-quicksand)", "sans-serif"], // Font chữ thường
        // Giữ lại alias `sans` nếu đã được dùng ở nơi khác
        sans: ["var(--font-quicksand)", "sans-serif"],
      },
      backgroundImage: {
        // Nền bảng bần nhẹ
        "cork-pattern":
          "url('https://www.transparenttextures.com/patterns/cork-board.png')",
      }
    },
  },
  plugins: [],
};
export default config;
