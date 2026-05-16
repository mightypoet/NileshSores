import { supabase } from '../lib/supabase';
import { Product, Category, Banner, Order, UserProfile } from '../types';
import { products as mockProducts, categories as mockCategories } from '../data/mockData';
import { toast } from 'sonner';

// Helper to map DB to UI
const mapProductFromDb = (p: any): Product => ({
  ...p,
  reviewsCount: p.reviewscount !== undefined ? p.reviewscount : (p.reviewsCount || 0),
  gstRate: p.gstrate !== undefined ? p.gstrate : (p.gstRate || 0),
});

// Helper to map UI to DB
const mapProductToDb = (p: any): any => {
  const { reviewsCount, gstRate, categoryName, ...rest } = p;
  const mapped: any = { ...rest };
  if (reviewsCount !== undefined) mapped.reviewscount = reviewsCount;
  if (gstRate !== undefined) mapped.gstrate = gstRate;
  return mapped;
};

const mapCategoryFromDb = (c: any): Category => ({
  ...c,
});

const mapCategoryToDb = (c: any): any => {
  const { parentId, sortOrder, ...rest } = c;
  return rest; // parentId and sortOrder don't exist in DB
};

const mapOrderFromDb = (o: any): Order => ({
  id: o.id,
  orderNumber: o.orderNumber || '000',
  userId: o.user_id || '',
  status: o.status || 'pending',
  total: o.totalAmount || 0,
  gstAmount: 0,
  shippingCharge: 0,
  grandTotal: o.totalAmount || 0,
  paymentStatus: o.paymentStatus || 'pending',
  paymentMethod: 'cod', // not in db
  shippingAddress: o.shippingAddress || {} as any,
  items: o.items || [],
  createdAt: o.createdAt
});

const mapUserFromDb = (u: any): UserProfile => ({
  id: u.id,
  name: u.fullName || u.name || '',
  email: u.email || '',
  role: u.role || 'customer',
  createdAt: u.createdAt
});

const mapOrderToDb = (o: any): any => {
  return {
    orderNumber: o.orderNumber,
    user_id: o.userId,
    customerName: o.shippingAddress?.fullName || '',
    customerEmail: '', // Usually derived elsewhere
    totalAmount: o.grandTotal || o.total || 0,
    items: o.items || [],
    status: o.status,
    paymentStatus: o.paymentStatus,
    shippingAddress: o.shippingAddress
  };
};

export const dataService = {
  async createOrder(order: Partial<Order>): Promise<Order | null> {
    if (!supabase) return null;
    try {
      const payload = mapOrderToDb(order);
      const { data, error } = await supabase
        .from('orders')
        .insert([payload])
        .select()
        .single();
      
      if (error) throw error;
      return mapOrderFromDb(data);
    } catch (error) {
      console.error("Error creating order in Supabase:", error);
      return null;
    }
  },
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
      
      if (data && data.length > 0) {
        console.log("[DATA SERVICE] Raw product data snippet:", Object.keys(data[0]));
        return data.map(mapProductFromDb);
      }
      return [];
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
      
      return data ? mapProductFromDb(data) : null;
    } catch (error) {
      console.error("Error fetching product by slug from Supabase:", error);
      const mockProduct = mockProducts.find(p => p.slug === slug);
      return (mockProduct as any) || null;
    }
  },

  async createProduct(product: Partial<Product>): Promise<Product | null> {
    if (!supabase) return null;
    try {
      const { id, categories, categoryName, ...rest } = product as any;
      
      // Fallback ID generation to prevent null constraint errors
      const newId = id || crypto.randomUUID();
      const payload = { 
        ...mapProductToDb(rest),
        id: newId
      };
      
      console.log("[DATA SERVICE] Creating product with payload:", payload);
      
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();
      
      if (error) {
        console.error("Supabase Error [createProduct]:", error.message, error.details, error.hint);
        throw error;
      }
      return mapProductFromDb(data);
    } catch (error: any) {
      console.error("Error creating product in Supabase:", error);
      toast.error(`Create Error: ${error.message || 'Unknown error'}`);
      return null;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    if (!supabase) return null;
    try {
      const { id: _, created_at: __, createdAt: ___, updatedAt: ____, categories: _____, categoryName: ______, ...rest } = updates as any;
      const payload = mapProductToDb(rest);
      
      console.log("[DATA SERVICE] Updating product with payload:", payload);
      
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
      return mapProductFromDb(data);
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
      if (data) return data.map(mapCategoryFromDb);
      return [];
    } catch (error) {
      console.error("Error fetching categories from Supabase:", error);
      return mockCategories as any;
    }
  },

  async createCategory(category: Partial<Category>): Promise<Category | null> {
    if (!supabase) return null;
    try {
      const { id, ...rest } = category as any;
      
      // Fallback ID generation to prevent null constraint errors
      const newId = id || crypto.randomUUID();
      const payload = {
        ...mapCategoryToDb(rest),
        id: newId
      };
      
      console.log("[DATA SERVICE] Creating category with payload:", payload);
      
      const { data, error } = await supabase
        .from('categories')
        .insert([payload])
        .select()
        .single();
      
      if (error) {
        console.error("Supabase Error [createCategory]:", error.message, error.details, error.hint);
        throw error;
      }
      return mapCategoryFromDb(data);
    } catch (error: any) {
      console.error("Error creating category in Supabase:", error);
      toast.error(`Create Error: ${error.message || 'Unknown error'}`);
      return null;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    if (!supabase) return null;
    try {
      const { id: _, ...rest } = updates as any;
      const payload = mapCategoryToDb(rest);
      
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
      return mapCategoryFromDb(data);
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
      return (data as any[]).map(b => ({ ...b, active: true }));
    } catch (error) {
      console.error("Error fetching banners from Supabase:", error);
      return [];
    }
  },

  async createBanner(banner: Partial<Banner>): Promise<Banner | null> {
    if (!supabase) return null;
    try {
      const { active, ...dbBanner } = banner;
      const { data, error } = await supabase
        .from('banners')
        .insert([{ ...dbBanner, id: dbBanner.id || crypto.randomUUID() }])
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, active: true } as Banner;
    } catch (error) {
      console.error("Error creating banner in Supabase:", error);
      return null;
    }
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
    if (!supabase) return null;
    try {
      const { active, ...dbBanner } = updates;
      const { data, error } = await supabase
        .from('banners')
        .update(dbBanner)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, active: true } as Banner;
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

  // UPLOADS (Local Proxy)
  async uploadImage(file: File, _bucket: string): Promise<string | null> {
    const uploadUrl = '/api/service/storage/upload';
    
    console.log(`[DATA SERVICE] [V2.2] Starting image upload: ${file.name} to ${uploadUrl}`);
    
    // Add a controller to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log(`[DATA SERVICE] Payload: FormData with file: ${file.name}, size: ${file.size} bytes`);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      console.log(`[DATA SERVICE] Response: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[DATA SERVICE] Upload failed with status ${response.status}. Response body:`, responseText);
        let errorMessage = `Upload failed (${response.status})`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
          if (errorData.tip) {
            errorMessage += `. ${errorData.tip}`;
          }
        } catch (e) {
          if (responseText.includes('<!DOCTYPE html>')) {
            errorMessage = "Server returned HTML instead of JSON. Check routing.";
          } else {
            errorMessage = responseText.substring(0, 100);
          }
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("[DATA SERVICE] Failed to parse upload response JSON:", responseText);
        throw new Error("Invalid response format from upload server");
      }

      if (!data.url) {
        console.error("[DATA SERVICE] Upload response missing url field:", data);
        throw new Error("No URL returned from server");
      }
      
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
      if (data) return data.map(mapOrderFromDb);
      return [];
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
      if (data) return data.map(mapUserFromDb);
      return [];
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
