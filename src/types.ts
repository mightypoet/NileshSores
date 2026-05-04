export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parent_id?: string;
  sort_order?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  discount?: number;
  rating?: number;
  reviews_count?: number;
  gst_rate: number;
  sku: string;
  stock: number;
  images: string[];
  category_id: string;
  status: 'active' | 'draft' | 'archived';
  is_best_seller?: boolean;
  collection?: string;
  created_at: any;
  updated_at: any;
}

export interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  gst_amount: number;
  shipping_charge: number;
  grand_total: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'cod' | 'upi' | 'card';
  shipping_address: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items: OrderItem[];
  created_at: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  created_at: any;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  active: boolean;
  order: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
