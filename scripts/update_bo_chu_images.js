
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpnkobewutnqouqiaqch.supabase.co';
const supabaseKey = 'sb_publishable_m6jdU3lTwkt1woekmixaMg_M-4E4g0t';

const supabase = createClient(supabaseUrl, supabaseKey);

const allImages = [
    "/assets/products/bo-chu-full-1.jpg",
    "/assets/products/bo-chu-full-2.jpg",
    "/assets/products/bo-chu-full-3.jpg",
    "/assets/products/bo-chu-full-4.jpg",
    "/assets/products/bo-chu-full-5.jpg",
    "/assets/products/bo-chu-full-6.jpg",
    "/assets/products/bo-chu-full-7.jpg",
    "/assets/products/bo-chu-full-8.jpg",
    "/assets/products/bo-chu-full-9.jpg",
    "/assets/products/bo-chu-full-10.jpg",
    "/assets/products/bo-chu-full-11.jpg",
    "/assets/products/bo-chu-full-12.jpg",
    "/assets/products/bo-chu-full-13.jpg",
    "/assets/products/bo-chu-full-14.jpg",
    "/assets/products/bo-chu-full-15.jpg",
    "/assets/products/bo-chu-full-16.jpg",
    "/assets/products/bo-chu-full-17.jpg",
    "/assets/products/bo-chu-full-18.jpg",
    "/assets/products/bo-chu-full-19.jpg",
    "/assets/products/bo-chu-full-20.jpg",
    "/assets/products/bo-chu-full-21.jpg",
    "/assets/products/bo-chu-full-22.jpg",
    "/assets/products/bo-chu-full-23.jpg",
    "/assets/products/bo-chu-full-24.jpg",
    "/assets/products/bo-chu-full-25.jpg"
];

async function updateProduct() {
    console.log("Updating 'Bộ Chữ Xốp Thư Pháp' with all images...");

    // Update the product with the full list of images
    const { data, error } = await supabase
        .from('products')
        .update({ images: allImages })
        .eq('name', 'Bộ Chữ Xốp Thư Pháp (Lẻ/Combo)')
        .select();

    if (error) {
        console.error("Error updating product:", error);
    } else {
        console.log("Successfully updated product images:", data);
    }
}

updateProduct();
