import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, BarChart3, Package, Bell, Search, Plus, Filter, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dataService } from '../../services/dataService';
import { Order, Product, UserProfile } from '../../types';
import SeedData from '../../components/SeedData';

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '₹0', change: '+0%', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Orders', value: '0', change: '+0%', icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Customers', value: '0', change: '+0%', icon: Users, color: 'text-secondary', bg: 'bg-secondary/5' },
    { label: 'Products', value: '0', change: '+0%', icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      const [orders, products, users] = await Promise.all([
        dataService.getOrders(),
        dataService.getProducts(),
        dataService.getUsers()
      ]);

      const totalRevenue = orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.grandTotal, 0);

      setStats([
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '+12.5%', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Orders', value: orders.length.toString(), change: '+18.2%', icon: ShoppingBag, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Customers', value: users.length.toString(), change: '+4.3%', icon: Users, color: 'text-zinc-500', bg: 'bg-zinc-100' },
        { label: 'Products', value: products.length.toString(), change: '+5.1%', icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' },
      ]);

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setDataLoading(false);
    }
  };

  if (authLoading) return <div className="h-full flex items-center justify-center font-black animate-pulse">VALIDATING ACCESS...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-12 pb-12 overflow-x-hidden">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter italic">HQ <span className="text-zinc-300">Dashboard</span></h1>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Real-time business insights</p>
        </div>
        <div className="flex items-center gap-4">
          <SeedData />
          <Button className="rounded-2xl h-12 px-8" onClick={() => navigate('/admin/products')}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <Badge variant={stat.change.startsWith('+') ? 'success' : 'destructive'} className="text-[8px]">
                <TrendingUp className="h-3 w-3 mr-1" /> {stat.change}
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-black tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Orders Table */}
      <section className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden mb-12">
        <div className="p-10 border-b flex justify-between items-center bg-zinc-50/50">
          <h2 className="text-xl font-black italic">Recent Orders</h2>
          <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest" onClick={() => navigate('/admin/orders')}>View All Orders</Button>
        </div>
        
        <div className="overflow-x-auto">
          {dataLoading ? (
            <div className="p-20 text-center text-zinc-400 animate-pulse font-black uppercase tracking-widest">
              Loading live data...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-20 text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 mx-auto">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No orders found yet</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <th className="px-10 py-6">Order ID</th>
                  <th className="px-10 py-6">Customer</th>
                  <th className="px-10 py-6">Amount</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-10 py-6 font-black tracking-tight">{order.orderNumber}</td>
                    <td className="px-10 py-6 font-bold">{(order.shippingAddress as any).fullName || 'Guest'}</td>
                    <td className="px-10 py-6 font-black">₹{order.grandTotal.toLocaleString()}</td>
                    <td className="px-10 py-6">
                      <Badge variant={order.status === 'delivered' ? 'success' : 'outline'} className="text-[8px] uppercase tracking-widest">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-10 py-6 text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
