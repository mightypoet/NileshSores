import { supabase } from '../lib/supabase';
import { Product, Category, Banner, Order, UserProfile } from '../types';
import { products as mockProducts, categories as mockCategories } from '../data/mockData';
import { toast } from 'sonner';

export const dataService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    if (!supabase) return mockProducts;
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
    if (!supabase) return null;
    try {
      // Remove id if it exists to let Supabase generate it
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
      return data as Product;
    } catch (error: any) {
      console.error("Error creating product in Supabase:", error);
      toast.error(`Create Error: ${error.message || 'Unknown error'}`);
      return null;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    if (!supabase) return null;
    try {
      // Remove id from updates to prevent primary key modification error
      const { id: _, ...payload } = updates as any;
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
      return data as Product;
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
    if (!supabase) return mockCategories;
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
    if (!supabase) return null;
    try {
      // Remove id if it exists to let Supabase generate it
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
      return data as Category;
    } catch (error: any) {
      console.error("Error creating category in Supabase:", error);
      toast.error(`Create Error: ${error.message || 'Unknown error'}`);
      return null;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    if (!supabase) return null;
    try {
      // Remove id from updates to prevent primary key modification error
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
      return data as Category;
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
    console.log(`Starting image upload: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    
    // Add a controller to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log(`Sending upload request to: /api/product-images/upload`);
      const response = await fetch('/api/product-images/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      console.log(`Response Status: ${response.status}`);
      console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()));

      clearTimeout(timeoutId);

      let responseText = '';
      try {
        responseText = await response.text();
      } catch (e) {
        console.error("Could not read response text:", e);
      }

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = 'Failed to upload image';
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = `Status ${response.status}: ${responseText.substring(0, 100)}`;
          }
        } else {
          errorMessage = responseText || `Status ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      try {
        const { url } = JSON.parse(responseText);
        
        if (!url) {
          throw new Error("Server responded successfully but returned no image URL");
        }
        
        console.log("Image upload successful, URL:", url);
        return url;
      } catch (error: any) {
        throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}`);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error("Upload Error: Request timed out after 60 seconds");
        toast.error("Upload timed out. The file might be too large or the connection is slow.");
      } else {
        console.error("Error uploading image to Vercel Blob:", error);
        toast.error(`Upload Error: ${error.message || 'Unknown error'}`);
      }
      return null;
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!supabase) {
      const mockProduct = mockProducts.find(p => p.slug === slug);
      return mockProduct || null;
    }
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
    if (!supabase) return [];
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
      return data as UserProfile[];
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
