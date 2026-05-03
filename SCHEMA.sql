-- SQL schema for Nilesh Store Supabase configuration
-- Run this in the Supabase SQL Editor

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT,
  "parentId" TEXT,
  "sortOrder" INTEGER DEFAULT 0
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2) NOT NULL,
  discount DECIMAL(5,2),
  rating DECIMAL(3,2) DEFAULT 0,
  "reviewsCount" INTEGER DEFAULT 0,
  "gstRate" INTEGER DEFAULT 18,
  sku TEXT UNIQUE,
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  "categoryId" TEXT REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  "isBestSeller" BOOLEAN DEFAULT false,
  collection TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Profiles Table (Users)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Usually matches Firebase/Supabase Auth UID
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  link TEXT,
  active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0
);

-- 5. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderNumber" TEXT UNIQUE NOT NULL,
  "userId" TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10,2) NOT NULL,
  "gstAmount" DECIMAL(10,2) NOT NULL,
  "shippingCharge" DECIMAL(10,2) NOT NULL,
  "grandTotal" DECIMAL(10,2) NOT NULL,
  "paymentStatus" TEXT DEFAULT 'pending' CHECK (paymentStatus IN ('pending', 'paid', 'failed', 'refunded')),
  "paymentMethod" TEXT NOT NULL,
  "shippingAddress" JSONB NOT NULL,
  items JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - Optional but recommended for production
-- For now, we allow all access to make it work immediately, but you should harden this later.
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (READ)
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Banners" ON banners FOR SELECT USING (true);

-- Allow all for now (DEVELOPMENT ONLY) - Disable this in production!
CREATE POLICY "Allow All Categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow All Products" ON products FOR ALL USING (true);
CREATE POLICY "Allow All Profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow All Banners" ON banners FOR ALL USING (true);
CREATE POLICY "Allow All Orders" ON orders FOR ALL USING (true);
