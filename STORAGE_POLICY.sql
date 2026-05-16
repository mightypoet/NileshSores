-- 1. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies if they exist (to avoid conflicts when running multiple times)
DROP POLICY IF EXISTS "Give public read access" ON storage.objects;
DROP POLICY IF EXISTS "Give public insert access" ON storage.objects;
DROP POLICY IF EXISTS "Give public update access" ON storage.objects;
DROP POLICY IF EXISTS "Give public delete access" ON storage.objects;

-- 3. Create policies to allow public access to the bucket
-- Note: In a production app, you should restrict INSERT/UPDATE/DELETE to authenticated admin users. 
-- For development purposes with the ANON key, we are allowing public access.

CREATE POLICY "Give public read access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Give public insert access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Give public update access" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images');

CREATE POLICY "Give public delete access" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images');
