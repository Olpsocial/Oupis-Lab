
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpnkobewutnqouqiaqch.supabase.co';
const supabaseKey = 'sb_publishable_m6jdU3lTwkt1woekmixaMg_M-4E4g0t';

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
    {
        name: 'Quạt Tre Trang Trí Tết Cao Cấp',
        price: 185000,
        original_price: 250000,
        image: '/assets/products/quat-tre-1.jpg',
        // images: ["/assets/products/quat-tre-1.jpg", "/assets/products/quat-tre-2.jpg", "/assets/products/quat-tre-3.jpg"], // Omit missing column
        type: 'decor',
        category: 'Mẹt Hoa & Tết',
        // description: 'Quạt tre trang trí thủ công...', // Omit missing column
        // specs: ..., // Omit missing column
        is_active: true,
        sold: 68,
        // rating: 4.9, // Omit missing column
        // reviews_count: 24, // Omit missing column
        is_combo: false,
        variants: []
    },
    {
        name: 'Bộ Chữ Xốp Thư Pháp (Lẻ/Combo)',
        price: 25000,
        original_price: 35000,
        image: '/assets/products/bo-chu-1.jpg',
        // images: ..., // Omit missing column
        type: 'material',
        category: 'Phụ Kiện Treo',
        // description: ..., // Omit missing column
        // specs: ..., // Omit missing column
        is_active: true,
        sold: 145,
        // rating: 5.0, // Omit missing column
        // reviews_count: 56, // Omit missing column
        is_combo: false,
        variants: []
    }
];

async function insertProducts() {
    console.log("Starting insert (compatible fields only)...");
    for (const product of products) {
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select();

        if (error) {
            console.error(`Error inserting ${product.name}:`, error.message);
        } else {
            console.log(`Successfully inserted: ${product.name}`);
        }
    }
    console.log("Done.");
}

insertProducts();
