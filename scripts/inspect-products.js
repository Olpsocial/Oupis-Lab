
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpnkobewutnqouqiaqch.supabase.co';
const supabaseKey = 'sb_publishable_m6jdU3lTwkt1woekmixaMg_M-4E4g0t';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Inspecting existing products...");
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching:", error);
    } else {
        console.log("Existing product keys:", data && data.length > 0 ? Object.keys(data[0]) : "No products found");
        if (data && data.length > 0) {
            console.log("Sample product:", data[0]);
        }
    }
}

inspect();
