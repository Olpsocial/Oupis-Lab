-- Add shipping_fee and shipping_method columns to orders table
-- Run this in your Supabase SQL Editor

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_fee" numeric DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_method" text;

-- Optional: Add a comment to the columns for clarity
COMMENT ON COLUMN "orders"."shipping_fee" IS 'Phí vận chuyển';
COMMENT ON COLUMN "orders"."shipping_method" IS 'Phương thức vận chuyển (INNER_CITY, OUTER_CITY)';
