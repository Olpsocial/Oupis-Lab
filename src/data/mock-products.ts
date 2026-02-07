export interface Product {
  id: number | string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  sold: number;
  badge?: string;
  isCombo: boolean;
  type?: "decor" | "material" | "diy-kit"; // Phân loại: Decor (Showroom) vs Material (Kho) vs DIY Kit
  unit?: string; // Đơn vị tính cho nguyên liệu (cành, mét, cuộn)
}

export const products: Product[] = [
  // --- DECOR PRODUCTS (Showroom) ---
  {
    id: 1,
    name: "Mẹt Trang Trí Tết Tài Lộc",
    image: "/assets/products/tet-1.jpg",
    price: 189000,
    originalPrice: 250000,
    sold: 128,
    badge: "Bán chạy nhất",
    isCombo: true,
    type: "decor",
  },
  {
    id: 2,
    name: "Liễn Treo Tết An Khang",
    image: "/assets/products/tet-2.jpg",
    price: 135000,
    originalPrice: 180000,
    sold: 86,
    badge: "Mới về",
    isCombo: false,
    type: "decor",
  },
  {
    id: 3,
    name: "Mẹt Hoa, Quạt Tết Thịnh Vượng (Size Lớn)",
    image: "/assets/products/tet-3.jpg",
    price: 220000,
    originalPrice: 290000,
    sold: 45,
    badge: "Cao cấp",
    isCombo: true,
    type: "decor",
  },
  {
    id: 4,
    name: "Set Quà Tết Như Ý (Mix Hoa Lụa)",
    image: "/assets/products/tet-4.jpg",
    price: 155000,
    originalPrice: 210000,
    sold: 62,
    badge: "Yêu thích",
    isCombo: true,
    type: "decor",
  },

  // --- DIY KITS (Góc Tự Làm - Combo) ---
  {
    id: 101,
    name: "DIY KIT: Combo Tự Làm Mẹt Tài Lộc (30cm)",
    image: "/assets/products/tet-1.jpg", // Dùng lại ảnh mẹt 1
    price: 99000,
    originalPrice: 150000,
    sold: 215,
    badge: "Gói Tự Làm",
    isCombo: true,
    type: "diy-kit",
  },

  // --- MATERIALS (Góc Tự Làm - Nguyên Liệu) ---
  {
    id: 201,
    name: "Hoa Đào Lụa Cao Cấp (Cành 5 bông)",
    image: "/assets/products/tet-3.jpg", // Placeholder
    price: 15000,
    originalPrice: 20000,
    sold: 1000,
    badge: "Kho sẵn 70",
    isCombo: false,
    type: "material",
    unit: "cành",
  },
  {
    id: 202,
    name: "Dây Kẽm Nhung Đỏ (Loại 1)",
    image: "/assets/products/tet-2.jpg", // Placeholder
    price: 25000,
    originalPrice: 35000,
    sold: 540,
    badge: "Đang hot",
    isCombo: false,
    type: "material",
    unit: "bó",
  },
  {
    id: 203,
    name: "Mẹt Tre Hun Khói (30cm)",
    image: "/assets/products/tet-4.jpg", // Placeholder
    price: 25000,
    originalPrice: 30000,
    sold: 320,
    isCombo: false,
    type: "material",
    unit: "cái",
  },
  {
    id: 204,
    name: "Dây Treo Nút Thắt Đồng Tâm (May Mắn)",
    image: "/assets/products/material-knot.jpg",
    price: 12000,
    originalPrice: 15000,
    sold: 850,
    badge: "Best Seller",
    isCombo: false,
    type: "material",
    unit: "dây",
  },
  {
    id: 205,
    name: "Dây Treo Đồng Xu Ngũ Đế (Tài Lộc)",
    image: "/assets/products/material-coins.jpg",
    price: 15000,
    originalPrice: 20000,
    sold: 620,
    isCombo: false,
    type: "material",
    unit: "dây",
  },
  {
    id: 206,
    name: "Set Kẽm Nhung Màu Pastel (100 cây)",
    image: "/assets/products/material-pipe.jpg",
    price: 35000,
    originalPrice: 45000,
    sold: 1200,
    badge: "Hot Trend",
    isCombo: false,
    type: "material",
    unit: "bó",
  },
  {
    id: 207,
    name: "Đầu Hoa Mẫu Đơn Lụa Cao Cấp (Size 10cm)",
    image: "/assets/products/material-peony.jpg",
    price: 12000,
    originalPrice: 18000,
    sold: 430,
    isCombo: false,
    type: "material",
    unit: "bông",
  },
  // --- NEW PRODUCTS ADDED IN STEP 205 ---
  {
    id: 5,
    name: "Mẹt Tre Thần Tài Đón Lộc (Mix Hoa Quả)",
    image: "/assets/products/decor-wreath-god.jpg",
    price: 165000,
    originalPrice: 220000,
    sold: 42,
    badge: "Mới về",
    isCombo: true,
    type: "decor",
  },
  {
    id: 6,
    name: "Khánh Treo Chữ Phúc Cắt Giấy Nghệ Thuật",
    image: "/assets/products/decor-hanger-phuc.jpg",
    price: 85000,
    originalPrice: 120000,
    sold: 110,
    isCombo: false,
    type: "decor",
  },
  {
    id: 7,
    name: "Khánh Treo Hình Lân Sư Rồng (May Mắn)",
    image: "/assets/products/decor-hanger-lion.jpg",
    price: 89000,
    originalPrice: 125000,
    sold: 95,
    badge: "Trẻ em thích",
    isCombo: false,
    type: "decor",
  },
  {
    id: 208,
    name: "Hoa Mộc Lan Đỏ Đại Đóa (Cành Dài 80cm)",
    image: "/assets/products/material-magnolia-red.jpg",
    price: 45000,
    originalPrice: 60000,
    sold: 210,
    badge: "Hàng Tuyển",
    isCombo: false,
    type: "material",
    unit: "cành",
  },
  {
    id: 209,
    name: "Combo 3 Dây Treo Ngũ Đế (May Mắn)",
    image: "/assets/products/material-tassel-combo.jpg",
    price: 39000,
    originalPrice: 55000,
    sold: 150,
    isCombo: true,
    type: "material",
    unit: "set",
  },
];