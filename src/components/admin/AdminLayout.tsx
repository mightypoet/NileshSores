import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Image as ImageIcon, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Store,
  ShoppingCart,
  Users
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'motion/react';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Banners', path: '/admin/banners', icon: ImageIcon },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-zinc-200 transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 border-bottom border-zinc-100 flex items-center justify-between">
          {isSidebarOpen ? (
            <Link to="/admin" className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <Store className="w-6 h-6 text-indigo-600" />
              <span>Admin Panel</span>
            </Link>
          ) : (
            <Store className="w-8 h-8 text-indigo-600 mx-auto" />
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 font-medium' 
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {isSidebarOpen && <span>{item.name}</span>}
                {isActive && isSidebarOpen && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1 h-4 bg-indigo-600 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100 space-y-2">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded-lg transition-colors"
          >
            <Store className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>View Store</span>}
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-zinc-200 h-16 shrink-0 flex items-center justify-between px-8">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-zinc-900">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-zinc-500 capitalize">{user?.role || 'Administrator'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold border-2 border-white shadow-sm">
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
