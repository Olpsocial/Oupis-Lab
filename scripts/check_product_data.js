
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpnkobewutnqouqiaqch.supabase.co';
const supabaseKey = 'sb_publishable_m6jdU3lTwkt1woekmixaMg_M-4E4g0t';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProduct() {
    console.log("Checking product data...");
    const { data, error } = await supabase
        .from('products')
        .select('name, images, image')
        .eq('name', 'Bộ Chữ Xốp Thư Pháp (Lẻ/Combo)')
        .single();

    if (error) {
        console.error("Error fetching:", error);
    } else {
        console.log("Product Data:", JSON.stringify(data, null, 2));
    }
}

inspectProduct();
