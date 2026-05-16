-- DANGER: This will DROP and RECREATE your tables so they perfectly match the frontend!
-- ONLY run this if you don't mind losing the existing test data, OR you haven't launched yet.
-- The issue was that your current tables have incorrect column names (e.g., camelCase like "categoryId" instead of "category_id")

-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS banners CASCADE;

-- 1. Create Categories Table
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT,
  parent_id TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 2. Create Products Table
CREATE TABLE products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2) NOT NULL,
  discount DECIMAL(5,2),
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  gst_rate INTEGER DEFAULT 18,
  sku TEXT UNIQUE,
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  is_best_seller BOOLEAN DEFAULT false,
  collection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Profiles Table
CREATE TABLE profiles (
  id TEXT PRIMARY KEY, 
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Banners Table
CREATE TABLE banners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  link TEXT,
  active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0
);

-- 5. Create Orders Table
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10,2) NOT NULL,
  gst_amount DECIMAL(10,2) NOT NULL,
  shipping_charge DECIMAL(10,2) NOT NULL,
  grand_total DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and setup permissive policies for immediate development
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All Categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Banners" ON banners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Orders" ON orders FOR ALL USING (true) WITH CHECK (true);
