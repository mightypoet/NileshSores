import { supabase } from '../lib/supabase';
import { Product, Category, Banner } from '../types';
import { products as mockProducts, categories as mockCategories } from '../data/mockData';

export const dataService = {
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      if (data && data.length > 0) return data as Product[];
      return mockProducts;
    } catch (error) {
      console.error("Error fetching products:", error);
      return mockProducts;
    }
  },

  async createProduct(product: Partial<Product>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error("Error creating product:", error);
      return null;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error("Error updating product:", error);
      return null;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      if (data && data.length > 0) return data as Category[];
      return mockCategories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return mockCategories;
    }
  },

  async createCategory(category: Partial<Category>): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    } catch (error) {
      console.error("Error creating category:", error);
      return null;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    } catch (error) {
      console.error("Error updating category:", error);
      return null;
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      return false;
    }
  },

  async getBanners(): Promise<Banner[]> {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order');
      if (error) throw error;
      return data as Banner[];
    } catch (error) {
      console.error("Error fetching banners:", error);
      return [];
    }
  },

  async createBanner(banner: Partial<Banner>): Promise<Banner | null> {
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert([banner])
        .select()
        .single();
      if (error) throw error;
      return data as Banner;
    } catch (error) {
      console.error("Error creating banner:", error);
      return null;
    }
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
    try {
      const { data, error } = await supabase
        .from('banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Banner;
    } catch (error) {
      console.error("Error updating banner:", error);
      return null;
    }
  },

  async deleteBanner(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting banner:", error);
      return false;
    }
  },

  async uploadImage(file: File, bucket: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        // Fallback to mock data if not found in DB
        const mockProduct = mockProducts.find(p => p.slug === slug);
        return mockProduct || null;
      }
      return data as Product;
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      const mockProduct = mockProducts.find(p => p.slug === slug);
      return mockProduct || null;
    }
  }
};
