import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, ChevronDown, TrendingUp, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '../services/dataService';
import { Category } from '../types';
import { toast } from 'sonner';

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const fetchCategories = async () => {
      try {
        const data = await dataService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMegaMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/products' },
    { name: 'Categories', path: '#', hasDropdown: true },
    { name: 'Best Sellers', path: '/products?filter=best-seller' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-white py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 md:h-12 w-10 md:w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
              <span className="text-xl md:text-2xl font-black italic">N</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black tracking-tighter text-zinc-900 leading-tight uppercase italic">NILESH <span className="text-indigo-600">STORES</span></span>
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Premium Stationery</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative"
                onMouseEnter={() => link.hasDropdown && setIsMegaMenuOpen(true)}
                onMouseLeave={() => link.hasDropdown && setIsMegaMenuOpen(false)}
              >
                {link.hasDropdown ? (
                  <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-zinc-600 hover:text-indigo-600 transition-colors">
                    {link.name} <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link 
                    to={link.path} 
                    className={`px-4 py-2 text-sm font-bold transition-colors ${location.pathname === link.path ? 'text-indigo-600' : 'text-zinc-600 hover:text-indigo-600'}`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
            {isAdmin && (
              <Link to="/admin" className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Admin Panel
              </Link>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/search" className="p-2 md:p-2.5 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
              <Search className="h-5 w-5" />
            </Link>
            <Link to="/cart" className="group relative p-2 md:p-2.5 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/account" className="p-2 md:p-2.5 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
                  <User className="h-5 w-5" />
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block">
                <Button size="sm" className="px-6 rounded-full shadow-md shadow-indigo-600/20 font-black uppercase tracking-widest text-[10px]">Login</Button>
              </Link>
            )}
            <button className="lg:hidden p-2 text-zinc-900 bg-zinc-50 rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mega Menu */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
            className="absolute left-0 top-full w-full bg-white border-b shadow-2xl overflow-hidden hidden lg:block"
          >
            <div className="container mx-auto p-10">
              <div className="grid grid-cols-4 gap-8">
                <div className="col-span-1 border-r pr-8">
                  <h3 className="text-xl font-black mb-4 italic tracking-tight">Shop by Category</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    Find the perfect tools for your creativity, from premium pens to professional art supplies.
                  </p>
                  <Link to="/products" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all">
                    View All Products <TrendingUp className="h-4 w-4" />
                  </Link>
                </div>
                <div className="col-span-3 grid grid-cols-3 gap-6">
                  {categories.slice(0, 9).map((cat) => (
                    <Link 
                      key={cat.id} 
                      to={`/products?category=${cat.id}`}
                      className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors"
                    >
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-100 shadow-sm">
                        <img src={cat.image} alt={cat.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <span className="font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-50 lg:hidden bg-white"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex justify-between items-center">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <span className="text-lg font-black italic">N</span>
                  </div>
              <span className="text-xl font-black tracking-tighter italic uppercase">NILESH <span className="text-indigo-600">STORES</span></span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-zinc-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.path} 
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-2xl font-black text-zinc-900 hover:text-indigo-600 italic tracking-tighter"
                  >
                    {link.name}
                  </Link>
                ))}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-2xl font-black text-red-600 italic tracking-tighter"
                  >
                    Admin Panel
                  </Link>
                )}
                <div className="pt-6 border-t font-bold text-zinc-400 uppercase tracking-widest text-[10px] mb-4">Categories</div>
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      to={`/products?category=${cat.id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-sm font-bold text-zinc-600"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
