import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, Settings, Star, Clock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { dataService } from '../services/dataService';
import { Order } from '../types';

export default function Account() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      if (user) {
        const fetchedOrders = await dataService.getUserOrders(user.uid);
        setOrders(fetchedOrders);
      }
    }
    fetchOrders();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-40 text-center">
        <div className="max-w-md mx-auto space-y-8">
          <div className="h-32 w-32 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 mx-auto">
            <User className="h-16 w-16" />
          </div>
          <h2 className="text-4xl font-black tracking-tighter italic uppercase underline decoration-primary/20">Guest Access</h2>
          <p className="text-sm font-medium text-zinc-500 leading-relaxed">Please sign in to view your creative history and manage your personal stationery vault.</p>
          <Link to="/login">
            <Button size="lg" className="w-full rounded-2xl shadow-xl shadow-primary/20">Sign in Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalSpent = orders.reduce((acc, order) => acc + order.grandTotal, 0);

  return (
    <div className="container mx-auto px-4 py-20 pb-40">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Profile Header */}
        <header className="flex flex-col md:flex-row items-center gap-10 p-12 bg-white rounded-[4rem] border border-zinc-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative group">
            <div className="h-32 w-32 rounded-[2.5rem] overflow-hidden bg-zinc-100 ring-8 ring-zinc-50 shadow-2xl">
              <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.displayName || ''} className="h-full w-full object-cover" />
            </div>
            <button className="absolute -bottom-2 -right-2 h-10 w-10 bg-white rounded-2xl shadow-xl border border-zinc-100 flex items-center justify-center text-primary hover:rotate-12 transition-transform">
              <Settings className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter capitalize italic">{user.displayName || 'Stationery Enthusiast'}</h1>
              <p className="text-sm font-bold text-zinc-400 normal-case tracking-normal">{user.email}</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-4 py-1.5 bg-primary/5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Star className="h-3 w-3 fill-current" /> Platinum Member
              </div>
              <div className="px-4 py-1.5 bg-zinc-50 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Clock className="h-3 w-3" /> Joined 2024
              </div>
            </div>
          </div>

          <Button variant="ghost" onClick={handleLogout} className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs hover:bg-red-50 hover:text-red-500 transition-colors">
            <LogOut className="h-4 w-4 mr-3" /> Logout
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <section className="space-y-8">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Order History</h2>
                  <h3 className="text-3xl font-black tracking-tighter">Recent Purchases</h3>
                </div>
                <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:gap-3 flex items-center gap-2 transition-all">
                  View All Orders <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
                    <p className="text-sm font-bold text-zinc-400">No orders yet</p>
                  </div>
                ) : orders.map(order => (
                  <div key={order.id} className="group bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:border-zinc-200 transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-black tracking-tight">{order.orderNumber}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt || Date.now()).toLocaleDateString()} &bull; {order.items.reduce((acc, item) => acc + item.quantity, 0)} Items</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-right">
                        <p className="text-sm font-black text-zinc-900">₹{order.grandTotal.toLocaleString()}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-green-500">{order.status}</p>
                      </div>
                      <Button variant="outline" className="rounded-xl px-6 h-12 text-[10px] font-black uppercase tracking-widest">Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-8">
              <div className="space-y-1">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">My Favorites</h2>
                <h3 className="text-3xl font-black tracking-tighter">Wishlist</h3>
              </div>
              <div className="bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200 py-20 text-center space-y-6">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-zinc-200 mx-auto shadow-sm">
                  <Heart className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No items saved yet</p>
                <Link to="/products">
                  <Button variant="link" className="text-primary font-black uppercase tracking-widest text-[10px]">Start exploring</Button>
                </Link>
              </div>
            </section>
          </div>

          {/* Quick Stats / Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <section className="bg-zinc-900 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-10">
              <h4 className="text-xl font-black italic">Creative Stats</h4>
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Spent</span>
                    <span className="text-2xl font-black">₹{totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-primary rounded-full" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-6 rounded-3xl space-y-2">
                    <Package className="h-5 w-5 text-secondary" />
                    <div className="flex flex-col">
                      <span className="text-xl font-black">{orders.length < 10 ? `0${orders.length}` : orders.length}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Orders</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl space-y-2">
                    <Star className="h-5 w-5 text-accent" />
                    <div className="flex flex-col">
                      <span className="text-xl font-black">4lv</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Points</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="p-8 rounded-[3rem] border border-zinc-100 space-y-8">
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-widest">Addresses</h4>
              </div>
              <div className="p-6 bg-zinc-50 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Primary Home</p>
                <p className="text-xs font-bold text-zinc-900 leading-relaxed">Nr. Siddhi Vinayak Temple, Dandia Bazaar, Vadodara, 390001</p>
              </div>
              <Button variant="outline" className="w-full rounded-2xl h-14 text-xs font-black uppercase tracking-widest">+ Add New Address</Button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
