import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, BarChart3, Package, Bell, Search, Plus, Filter, MoreVertical, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse">VALIDATING ACCESS...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const stats = [
    { label: 'Total Revenue', value: '₹42,500', change: '+12.5%', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Orders', value: '156', change: '+18.2%', icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Customers', value: '890', change: '+4.3%', icon: Users, color: 'text-secondary', bg: 'bg-secondary/5' },
    { label: 'Avg Value', value: '₹270', change: '-2.1%', icon: BarChart3, color: 'text-accent', bg: 'bg-accent/5' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col p-8 space-y-12">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white font-black italic">N</div>
          <span className="font-black tracking-tighter">HQ DASHBOARD</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {[
            { label: 'Overview', icon: LayoutDashboard, active: true },
            { label: 'Products', icon: Package },
            { label: 'Orders', icon: ShoppingBag },
            { label: 'Customers', icon: Users },
            { label: 'Analytics', icon: BarChart3 },
          ].map(item => (
            <button key={item.label} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${item.active ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900'}`}>
              <item.icon className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 bg-zinc-900 rounded-[2rem] text-white space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Support</p>
          <p className="text-xs font-bold leading-relaxed">Need help managing the store?</p>
          <Button size="sm" variant="accent" className="w-full text-[8px] h-10">Documentation</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 space-y-12">
        <header className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter italic">Nilesh Store <span className="text-zinc-300">HQ</span></h1>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Store Overview & Performance</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="h-12 w-12 rounded-2xl bg-white border flex items-center justify-center text-zinc-400 hover:text-primary transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-3 right-3 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <Button className="rounded-2xl h-12 px-8">
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

        {/* Recent Orders Table Placeholder */}
        <section className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b flex justify-between items-center">
            <h2 className="text-xl font-black italic">Recent Orders</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                <input type="text" placeholder="Search orders..." className="h-10 pl-10 pr-4 bg-zinc-50 border-none rounded-xl text-xs outline-none" />
              </div>
              <Button variant="outline" size="sm" className="rounded-xl h-10 px-4"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
            </div>
          </div>
          <div className="p-10 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 mx-auto">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Connecting to live order data...</p>
          </div>
        </section>
      </main>
    </div>
  );
}
