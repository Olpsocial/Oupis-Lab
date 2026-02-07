export interface SeasonConfig {
    id: 'default' | 'tet' | 'valentine' | 'christmas';
    name: string;
    colors: {
        primary: string;   // Main brand color (usually text)
        secondary: string; // Backgrounds
        accent: string;    // Buttons, Highlights
        muted: string;     // Subtitles
    };
    texts: {
        heroTitle: string;
        heroSubtitle: string;
    };
    effects: {
        falling: 'none' | 'blossom' | 'heart' | 'snow';
        decoration: 'none' | 'lantern' | 'santa' | 'cupid';
    }
}

export const seasons: Record<string, SeasonConfig> = {
    default: {
        id: "default",
        name: "Bình yên",
        colors: {
            primary: "#78350f", // Brand Brown
            secondary: "#FDFBF7", // Brand Beige
            accent: "#B45309", // Brand Terracotta
            muted: "#78716c", // Stone 500
        },
        texts: {
            heroTitle: "Góc nhỏ tự tay làm quà",
            heroSubtitle: "Cửa hàng đồ thủ công, nguyên liệu DIY và quà tặng handmade ấm áp.",
        },
        effects: {
            falling: "none",
            decoration: "none",
        },
    },
    tet: {
        id: "tet",
        name: "Tết Sum Vầy",
        colors: {
            primary: "#991b1b", // Red 800
            secondary: "#fffbeb", // Amber 50 (Warmer)
            accent: "#dc2626", // Red 600
            muted: "#92400e", // Amber 800
        },
        texts: {
            heroTitle: "Tết Sum Vầy - Gói trọn yêu thương",
            heroSubtitle: "Cùng làm những món quà Tết ý nghĩa tặng người thân yêu nhé.",
        },
        effects: {
            falling: "blossom",
            decoration: "lantern",
        },
    },
    valentine: {
        id: "valentine",
        name: "Mùa Yêu",
        colors: {
            primary: "#9d174d", // Pink 800
            secondary: "#fff1f2", // Pink 50
            accent: "#ec4899", // Pink 500
            muted: "#be185d", // Pink 700
        },
        texts: {
            heroTitle: "Gửi trao tâm tình",
            heroSubtitle: "Làm quà Valentine ngọt ngào tặng người ấy.",
        },
        effects: {
            falling: "heart",
            decoration: "cupid",
        },
    },
    christmas: {
        id: "christmas",
        name: "Giáng Sinh An Lành",
        colors: {
            primary: "#14532d", // Green 900
            secondary: "#f0fdf4", // Green 50
            accent: "#15803d", // Green 700
            muted: "#166534", // Green 800
        },
        texts: {
            heroTitle: "Giáng Sinh An Lành",
            heroSubtitle: "Tự tay làm quà, gửi trao hơi ấm mùa đông.",
        },
        effects: {
            falling: "snow",
            decoration: "santa",
        },
    },
};

// Set default season here
export const currentSeason = seasons.tet; 
