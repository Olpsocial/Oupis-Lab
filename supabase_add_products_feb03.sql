-- Thêm sản phẩm Quạt Tre
INSERT INTO products (name, price, original_price, image, images, type, category, description, specs, is_active, sold, rating, reviews_count)
VALUES (
    'Quạt Tre Trang Trí Tết Cao Cấp',
    185000,
    250000,
    '/assets/products/quat-tre-1.jpg',
    '["/assets/products/quat-tre-1.jpg", "/assets/products/quat-tre-2.jpg", "/assets/products/quat-tre-3.jpg"]',
    'decor',
    'Mẹt Hoa & Tết',
    'Quạt tre trang trí thủ công, kết hợp hoa lan, mộc lan và các phụ kiện may mắn. Thích hợp treo tường, cửa ra vào đón Tết.',
    '[{"label": "Chất liệu", "value": "Tre, Hoa lụa"}, {"label": "Kích thước", "value": "50x30cm"}]',
    true,
    68,
    4.9,
    24
);

-- Thêm sản phẩm Bộ Chữ
INSERT INTO products (name, price, original_price, image, images, type, category, description, specs, is_active, sold, rating, reviews_count)
VALUES (
    'Bộ Chữ Xốp Thư Pháp (Lẻ/Combo)',
    25000,
    35000,
    '/assets/products/bo-chu-1.jpg',
    '["/assets/products/bo-chu-1.jpg", "/assets/products/bo-chu-2.jpg", "/assets/products/bo-chu-3.jpg", "/assets/products/bo-chu-4.jpg", "/assets/products/bo-chu-5.jpg"]',
    'material',
    'Phụ Kiện Treo',
    'Bộ chữ xốp kim tuyến thư pháp (Chúc Mừng Năm Mới, Vạn Sự Như Ý...). Dùng để dán lên mẹt, dưa hấu, hoặc trang trí tường.',
    '[{"label": "Chất liệu", "value": "Xốp kim tuyến"}, {"label": "Màu sắc", "value": "Đỏ, Vàng"}]',
    true,
    145,
    5.0,
    56
);
