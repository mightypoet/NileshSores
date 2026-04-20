export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string;
  sortOrder?: number;
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
  reviewsCount?: number;
  gstRate: number;
  sku: string;
  stock: number;
  images: string[];
  categoryId: string;
  status: 'active' | 'draft' | 'archived';
  isBestSeller?: boolean;
  collection?: string;
  createdAt: any;
  updatedAt: any;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  gstAmount: number;
  shippingCharge: number;
  grandTotal: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cod' | 'upi' | 'card';
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items: OrderItem[];
  createdAt: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  createdAt: any;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
