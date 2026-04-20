import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Layers, 
  ShoppingCart, 
  TrendingUp, 
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Product, Category } from '../../types';
import { motion } from 'motion/react';

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pData, cData] = await Promise.all([
          dataService.getProducts(),
          dataService.getCategories()
        ]);
        
        setProducts(pData);
        setCategories(cData);
        setStats({
          products: pData.length,
          categories: cData.length,
          orders: 24, // Placeholder for now
          revenue: 125400
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-500', trend: '+12%' },
    { name: 'Total Categories', value: stats.categories, icon: Layers, color: 'bg-purple-500', trend: '+2' },
    { name: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-orange-500', trend: '+18%' },
    { name: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-green-500', trend: '+24%' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-500 mt-1.5">Welcome back, Admin. Here's what's happening with your store today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">{stat.name}</p>
              <p className="text-2xl font-bold text-zinc-900 tracking-tight mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity or Chart Placeholder */}
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Recent Products</h2>
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-200 overflow-hidden">
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 leading-tight">{product.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">₹{product.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                    product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {product.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Top Categories</h2>
          <div className="space-y-4">
            {categories.slice(0, 5).map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-200 overflow-hidden">
                    <img src={cat.image || `https://picsum.photos/seed/${cat.name}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 leading-tight">{cat.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Category ID: {cat.slug}</p>
                  </div>
                </div>
                <div className="text-right">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
