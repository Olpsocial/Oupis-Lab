export interface ThemeConfig {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        gradient: string; // New gradient for buttons
    };
    texts: {
        heroTitle: string;
        heroSubtitle: string;
    };
    overlay: string;
}

export const themes: Record<string, ThemeConfig> = {
    TET: {
        id: "TET",
        name: "Tết Nguyên Đán",
        colors: {
            primary: "#B45309", // Đỏ đất/Cam cháy đậm (User requested #B45309 for Tet, though typically Red)
            // User prompt said "Tết Nguyên Đán: Đỏ đô (#B45309)". Note: #B45309 is actually an amber/brown.
            // I will stick to the User's explicit Hex code.
            secondary: "#FFFBEB", // Amber 50
            accent: "#D97706", // Amber 600
            gradient: "linear-gradient(to right, #ea580c, #dc2626)", // Deep Orange-Red
        },
        texts: {
            heroTitle: "Tết Sum Vầy - Gói trọn yêu thương",
            heroSubtitle: "Cùng làm những món quà Tết ý nghĩa tặng người thân yêu nhé.",
        },
        overlay: "https://images.unsplash.com/photo-1613446734689-381368005015?q=80&w=2000",
    },
    VALENTINE: {
        id: "VALENTINE",
        name: "Lễ Tình Nhân",
        colors: {
            primary: "#D87093",
            secondary: "#FFF0F5",
            accent: "rgba(216, 112, 147, 0.1)",
            gradient: "linear-gradient(to right, #ec4899, #be185d)", // Pink gradient
        },
        texts: {
            heroTitle: "Gửi trao tâm tình",
            heroSubtitle: "Làm quà Valentine ngọt ngào tặng người ấy.",
        },
        overlay: "none",
    },
    SUMMER: {
        id: "SUMMER",
        name: "Mùa Hè Rực Rỡ",
        colors: {
            primary: "#65A30D",
            secondary: "#F7FEE7",
            accent: "rgba(101, 163, 13, 0.1)",
            gradient: "linear-gradient(to right, #84cc16, #4d7c0f)", // Green gradient
        },
        texts: {
            heroTitle: "Hè về rực rỡ",
            heroSubtitle: "Giải nhiệt mùa hè với những món đồ thủ công tươi mát.",
        },
        overlay: "none",
    },
    MID_AUTUMN: {
        id: "MID_AUTUMN",
        name: "Trung Thu",
        colors: {
            primary: "#EA580C",
            secondary: "#FFF7ED",
            accent: "rgba(234, 88, 12, 0.1)",
            gradient: "linear-gradient(to right, #f97316, #c2410c)", // Orange gradient
        },
        texts: {
            heroTitle: "Trung Thu đoàn viên",
            heroSubtitle: "Tự tay làm lồng đèn, bánh nướng tặng gia đình.",
        },
        overlay: "none",
    },
    CHRISTMAS: {
        id: "CHRISTMAS",
        name: "Giáng Sinh",
        colors: {
            primary: "#166534",
            secondary: "#F0FDF4",
            accent: "rgba(22, 101, 52, 0.1)",
            gradient: "linear-gradient(to right, #15803d, #14532d)", // Green gradient
        },
        texts: {
            heroTitle: "Giáng Sinh An Lành",
            heroSubtitle: "Tự tay làm quà, gửi trao hơi ấm mùa đông.",
        },
        overlay: "none",
    },
    DEFAULT: {
        id: "DEFAULT",
        name: "Nhà Kim Hương",
        colors: {
            primary: "#78350f",
            secondary: "#FDFBF7",
            accent: "#B45309",
            gradient: "linear-gradient(to right, #b45309, #78350f)", // Brand Brown gradient
        },
        texts: {
            heroTitle: "Góc nhỏ tự tay làm quà",
            heroSubtitle: "Cửa hàng đồ thủ công, nguyên liệu DIY và quà tặng handmade ấm áp.",
        },
        overlay: "none",
    },
};

export function getCurrentSeason(): ThemeConfig {
    const date = new Date();
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // Simple Logic for Demo
    // Tet: Jan - Feb (Approx)
    if (month === 1 || month === 2) return themes.TET;

    // Valentine: Feb 10 - Feb 20
    if (month === 2 && day >= 10 && day <= 20) return themes.VALENTINE; // Overlap handled by order, but let's keep simple

    // Summer: May - July
    if (month >= 5 && month <= 7) return themes.SUMMER;

    // Mid-Autumn: Sept - Oct
    if (month === 9 || month === 10) return themes.MID_AUTUMN;

    // Christmas: Dec
    if (month === 12) return themes.CHRISTMAS;

    return themes.TET; // Defaulting to TET now as per request context
}
