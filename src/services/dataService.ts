import { supabase } from '../lib/supabase';
import { Product, Category, Banner, Order, UserProfile } from '../types';
import { products as mockProducts, categories as mockCategories } from '../data/mockData';
import { toast } from 'sonner';

export const dataService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    if (!supabase) return mockProducts as any;
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .order('id', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error fetching products from Supabase:", error);
      return mockProducts as any;
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!supabase) {
      const mockProduct = mockProducts.find(p => p.slug === slug);
      return (mockProduct as any) || null;
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .single();
      
      if (error) {
        console.error("Supabase Error [getProductBySlug]:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching product by slug from Supabase:", error);
      const mockProduct = mockProducts.find(p => p.slug === slug);
      return (mockProduct as any) || null;
    }
  },

  async createProduct(product: Partial<Product>): Promise<Product | null> {
    if (!supabase) return null;
    try {
      const { id, ...payload } = product as any;
      
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();
      
      if (error) {
        console.error("Supabase Error [createProduct]:", error.message, error.details, error.hint);
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error("Error creating product in Supabase:", error);
      toast.error(`Create Error: ${error.message || 'Unknown error'}`);
      return null;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    if (!supabase) return null;
    try {
      const { id: _, created_at: __, categories: ___, ...payload } = updates as any;
      
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Supabase Error [updateProduct]:", error.message, error.details, error.hint);
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error("Error updating product in Supabase:", error);
      toast.error(`Update Error: ${error.message || 'Unknown error'}`);
      return null;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Supabase Error [deleteProduct]:", error.message, error.details, error.hint);
        throw error;
      }
      return true;
    } catch (error: any) {
      console.error("Error deleting product from Supabase:", error);
      toast.error(`Delete Error: ${error.message || 'Unknown error'}`);
      return false;
    }
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    if (!supabase) return mockCategories as any;
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching categories from Supabase:", error);
      return mockCategories as any;
    }
  },

  async createCategory(category: Partial<Category>): Promise<Category | null> {
    if (!supabase) return null;
    try {
      const { id, ...payload } = category as any;
      
      const { data, error } = await supabase
        .from('categories')
        .insert([payload])
        .select()
        .single();
      
      if (error) {
        console.error("Supabase Error [createCategory]:", error.message, error.details, error.hint);
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error("Error creating category in Supabase:", error);
      toast.error(`Create Error: ${error.message || 'Unknown error'}`);
      return null;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    if (!supabase) return null;
    try {
      const { id: _, ...payload } = updates as any;
      
      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Supabase Error [updateCategory]:", error.message, error.details, error.hint);
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error("Error updating category in Supabase:", error);
      toast.error(`Update Error: ${error.message || 'Unknown error'}`);
      return null;
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (!supabase) return false;
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
    if (!supabase) return [];
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

  async createBanner(banner: Partial<Banner>): Promise<Banner | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert([banner])
        .select()
        .single();
      
      if (error) throw error;
      return data as Banner;
    } catch (error) {
      console.error("Error creating banner in Supabase:", error);
      return null;
    }
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
    if (!supabase) return null;
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
      console.error("Error updating banner in Supabase:", error);
      return null;
    }
  },

  async deleteBanner(id: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting banner from Supabase:", error);
      return false;
    }
  },

  // UPLOADS (Vercel Blob via Proxy)
  async uploadImage(file: File, _bucket: string): Promise<string | null> {
    const uploadUrl = '/api/upload';
    
    console.log(`[DATA SERVICE] Starting image upload: ${file.name}`);
    
    // Add a controller to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      console.log(`[DATA SERVICE] Response: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[DATA SERVICE] Upload failed with text: ${responseText.substring(0, 500)}`);
        let errorMessage = `Upload failed (${response.status})`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          if (responseText.includes('<!DOCTYPE html>')) {
            errorMessage = "Server returned HTML instead of JSON. Ensure the server is running and the route exists.";
          } else {
            errorMessage = responseText.substring(0, 100);
          }
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      if (!data.url) throw new Error("No URL returned from server");
      
      console.log("[DATA SERVICE] Upload success:", data.url);
      return data.url;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("[DATA SERVICE] Exception during upload:", error);
      toast.error(`Upload Error: ${error.message}`);
      return null;
    }
  },

  // Order Management
  async getOrders(): Promise<Order[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching orders from Supabase:", error);
      return [];
    }
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
    if (!supabase) return false;
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
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching users from Supabase:", error);
      return [];
    }
  },

  async updateUserRole(id: string, role: 'customer' | 'admin'): Promise<boolean> {
    if (!supabase) return false;
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
