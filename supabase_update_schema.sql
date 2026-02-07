-- Nâng cấp bảng products để hỗ trợ nhiều ảnh và thông tin chi tiết
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS specs jsonb DEFAULT '[]'::jsonb;

-- (Tùy chọn) Chuyển dữ liệu cột image cũ sang cột images mới nếu images trống
UPDATE products 
SET images = ARRAY[image] 
WHERE (images IS NULL OR array_length(images, 1) IS NULL) AND image IS NOT NULL;
