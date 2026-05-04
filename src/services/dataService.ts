import { supabase } from '../lib/supabase';
import { Product, Category, Banner, Order, UserProfile } from '../types';
import { products as mockProducts, categories as mockCategories } from '../data/mockData';
import { toast } from 'sonner';

// Helper to map DB snake_case to UI camelCase
const mapProductFromDb = (p: any): Product => ({
  ...p,
  reviewsCount: p.reviews_count !== undefined ? p.reviews_count : p.reviewsCount,
  gstRate: p.gst_rate !== undefined ? p.gst_rate : p.gstRate,
  categoryId: p.category_id !== undefined ? p.category_id : p.categoryId,
  isBestSeller: p.is_best_seller !== undefined ? p.is_best_seller : p.isBestSeller,
  createdAt: p.created_at || p.createdAt,
  updatedAt: p.updated_at || p.updatedAt,
  categoryName: p.categories?.name
});

// Helper to map UI camelCase to DB snake_case
const mapProductToDb = (p: any): any => {
  const { 
    reviewsCount, 
    gstRate, 
    categoryId, 
    isBestSeller, 
    createdAt, 
    updatedAt, 
    categoryName,
    ...rest 
  } = p;
  
  const mapped: any = { ...rest };
  // Standard snake_case mapping for DB
  if (reviewsCount !== undefined) mapped.reviews_count = reviewsCount;
  if (gstRate !== undefined) mapped.gst_rate = gstRate;
  if (categoryId !== undefined) mapped.category_id = categoryId;
  if (isBestSeller !== undefined) mapped.is_best_seller = isBestSeller;
  if (createdAt !== undefined) mapped.created_at = createdAt;
  if (updatedAt !== undefined) mapped.updated_at = updatedAt;
  
  return mapped;
};

const mapCategoryFromDb = (c: any): Category => ({
  ...c,
  parentId: c.parent_id !== undefined ? c.parent_id : c.parentId,
  sortOrder: c.sort_order !== undefined ? c.sort_order : c.sortOrder
});

const mapCategoryToDb = (c: any): any => {
  const { parentId, sortOrder, ...rest } = c;
  const mapped: any = { ...rest };
  if (parentId !== undefined) mapped.parent_id = parentId;
  if (sortOrder !== undefined) mapped.sort_order = sortOrder;
  return mapped;
};

const mapOrderFromDb = (o: any): Order => ({
  ...o,
  orderNumber: o.order_number || o.orderNumber,
  userId: o.user_id || o.userId,
  gstAmount: o.gst_amount || o.gstAmount,
  shippingCharge: o.shipping_charge || o.shippingCharge,
  grandTotal: o.grand_total || o.grandTotal,
  paymentStatus: o.payment_status || o.paymentStatus,
  paymentMethod: o.payment_method || o.paymentMethod,
  shippingAddress: o.shipping_address || o.shippingAddress,
  createdAt: o.created_at || o.createdAt
});

const mapUserFromDb = (u: any): UserProfile => ({
  ...u,
  createdAt: u.created_at || u.createdAt
});

const mapOrderToDb = (o: any): any => {
  const { 
    orderNumber, 
    userId, 
    gstAmount, 
    shippingCharge, 
    grandTotal, 
    paymentStatus, 
    paymentMethod, 
    shippingAddress,
    createdAt,
    ...rest 
  } = o;
  
  const mapped: any = { ...rest };
  // Standard snake_case mapping for DB
  if (orderNumber !== undefined) mapped.order_number = orderNumber;
  if (userId !== undefined) mapped.user_id = userId;
  if (gstAmount !== undefined) mapped.gst_amount = gstAmount;
  if (shippingCharge !== undefined) mapped.shipping_charge = shippingCharge;
  if (grandTotal !== undefined) mapped.grand_total = grandTotal;
  if (paymentStatus !== undefined) mapped.payment_status = paymentStatus;
  if (paymentMethod !== undefined) mapped.payment_method = paymentMethod;
  if (shippingAddress !== undefined) mapped.shipping_address = shippingAddress;
  if (createdAt !== undefined) mapped.created_at = createdAt;
  
  return mapped;
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
      const { id: _, created_at: __, categories: ___, categoryName: ____, ...rest } = updates as any;
      const payload = mapProductToDb(rest);
      // Ensure we don't try to update fields that shouldn't be updated
      delete payload.created_at;
      delete payload.id;
      
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
    // Using a more specific path to avoid platform conflicts
    const uploadUrl = '/api/service/storage/upload';
    
    console.log(`[DATA SERVICE] Starting image upload: ${file.name} to ${uploadUrl} (Current Origin: ${window.location.origin})`);
    
    // Add a controller to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Log what we're sending
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
        } catch (e) {
          if (responseText.includes('<!DOCTYPE html>')) {
            errorMessage = "Server returned HTML instead of JSON. Ensure the server is running and the route exists.";
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
