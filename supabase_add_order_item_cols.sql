-- Add product_id and image_url to order_items
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id),
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing items via best-effort match (optional but helpful)
-- This is complex in SQL without a clear join key, so we'll skip the backfill for now 
-- and just focus on fixing future orders and enabling the UI.
