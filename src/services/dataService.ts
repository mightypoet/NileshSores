import { db, storage } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product, Category, Banner, Order, UserProfile } from '../types';
import { products as mockProducts, categories as mockCategories } from '../data/mockData';

export const dataService = {
  async getProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      if (products.length > 0) return products;
      return mockProducts;
    } catch (error) {
      console.error("Error fetching products:", error);
      return mockProducts;
    }
  },

  async createProduct(product: Partial<Product>): Promise<Product | null> {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      const newDoc = await getDoc(docRef);
      return { id: docRef.id, ...newDoc.data() } as Product;
    } catch (error) {
      console.error("Error creating product:", error);
      return null;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      const updatedDoc = await getDoc(docRef);
      return { id: docRef.id, ...updatedDoc.data() } as Product;
    } catch (error) {
      console.error("Error updating product:", error);
      return null;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'products', id));
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const q = query(collection(db, 'categories'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      
      if (categories.length > 0) return categories;
      return mockCategories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return mockCategories;
    }
  },

  async createCategory(category: Partial<Category>): Promise<Category | null> {
    try {
      const docRef = await addDoc(collection(db, 'categories'), category);
      const newDoc = await getDoc(docRef);
      return { id: docRef.id, ...newDoc.data() } as Category;
    } catch (error) {
      console.error("Error creating category:", error);
      return null;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    try {
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, updates);
      const updatedDoc = await getDoc(docRef);
      return { id: docRef.id, ...updatedDoc.data() } as Category;
    } catch (error) {
      console.error("Error updating category:", error);
      return null;
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'categories', id));
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      return false;
    }
  },

  async getBanners(): Promise<Banner[]> {
    try {
      const q = query(collection(db, 'banners'), orderBy('order'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Banner[];
    } catch (error) {
      console.error("Error fetching banners:", error);
      return [];
    }
  },

  async createBanner(banner: Partial<Banner>): Promise<Banner | null> {
    try {
      const docRef = await addDoc(collection(db, 'banners'), banner);
      const newDoc = await getDoc(docRef);
      return { id: docRef.id, ...newDoc.data() } as Banner;
    } catch (error) {
      console.error("Error creating banner:", error);
      return null;
    }
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
    try {
      const docRef = doc(db, 'banners', id);
      await updateDoc(docRef, updates);
      const updatedDoc = await getDoc(docRef);
      return { id: docRef.id, ...updatedDoc.data() } as Banner;
    } catch (error) {
      console.error("Error updating banner:", error);
      return null;
    }
  },

  async deleteBanner(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'banners', id));
      return true;
    } catch (error) {
      console.error("Error deleting banner:", error);
      return false;
    }
  },

  async uploadImage(file: File, bucket: string): Promise<string | null> {
    try {
      const storageRef = ref(storage, `${bucket}/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const q = query(collection(db, 'products'), where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        const mockProduct = mockProducts.find(p => p.slug === slug);
        return mockProduct || null;
      }
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Product;
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      const mockProduct = mockProducts.find(p => p.slug === slug);
      return mockProduct || null;
    }
  },

  // Order Management
  async getOrders(): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
    try {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { status });
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      return false;
    }
  },

  // User Management
  async getUsers(): Promise<UserProfile[]> {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  async updateUserRole(id: string, role: 'customer' | 'admin'): Promise<boolean> {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, { role });
      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      return false;
    }
  }
};
