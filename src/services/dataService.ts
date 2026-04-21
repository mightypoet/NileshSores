import { supabase } from '../lib/supabase';
import { Product, Category, Banner, Order, UserProfile } from '../types';
import { products as mockProducts, categories as mockCategories } from '../data/mockData';
import { toast } from 'sonner';

export const dataService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      if (data && data.length > 0) return data as Product[];
      return mockProducts;
    } catch (error) {
      console.error("Error fetching products from Supabase:", error);
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
      console.error("Error creating product in Supabase:", error);
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
      console.error("Error updating product in Supabase:", error);
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
      console.error("Error deleting product from Supabase:", error);
      return false;
    }
  },

  // CATEGORIES
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
      console.error("Error fetching categories from Supabase:", error);
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
      console.error("Error creating category in Supabase:", error);
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
      console.error("Error updating category in Supabase:", error);
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
      console.error("Error deleting category from Supabase:", error);
      return false;
    }
  },

  // BANNERS
  async getBanners(): Promise<Banner[]> {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order');
      
      if (error) throw error;
      return data as Banner[];
    } catch (error) {
      console.error("Error fetching banners from Supabase:", error);
      return [];
    }
  },

  // UPLOADS (Vercel Blob via Proxy)
  async uploadImage(file: File, _bucket: string): Promise<string | null> {
    console.log(`Starting image upload to Vercel Blob, file: ${file.name}`);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const { url } = await response.json();
      console.log("Vercel Blob upload successful:", url);
      return url;
    } catch (error: any) {
      console.error("Error uploading image to Vercel Blob:", error);
      toast.error(`Upload Error: ${error.message || 'Unknown error'}`);
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
      
      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error("Error fetching product by slug from Supabase:", error);
      const mockProduct = mockProducts.find(p => p.slug === slug);
      return mockProduct || null;
    }
  },

  // Order Management
  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    } catch (error) {
      console.error("Error fetching orders from Supabase:", error);
      return [];
    }
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating order status in Supabase:", error);
      return false;
    }
  },

  // User Management
  async getUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    } catch (error) {
      console.error("Error fetching users from Supabase:", error);
      return [];
    }
  },

  async updateUserRole(id: string, role: 'customer' | 'admin'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating user role in Supabase:", error);
      return false;
    }
  }
};
