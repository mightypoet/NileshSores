import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider, useCart } from './hooks/useCart';
import { Toaster, toast } from 'sonner';
import { ShoppingCart, User, Menu, X, Search, LogOut, Phone, MapPin, ChevronDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { categories } from './data/mockData';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

function Navbar() {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMegaMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/products' },
    { name: 'Categories', path: '#', hasDropdown: true },
    { name: 'Best Sellers', path: '/products?filter=best-seller' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-white py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
              <span className="text-2xl font-black">N</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-zinc-900 leading-tight">NILESH <span className="text-primary">STORE</span></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Premium Stationery</span>
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
                  <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-zinc-600 hover:text-primary transition-colors">
                    {link.name} <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link 
                    to={link.path} 
                    className={`px-4 py-2 text-sm font-bold transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-zinc-600 hover:text-primary'}`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2.5 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors hidden md:block">
              <Search className="h-5 w-5" />
            </button>
            <Link to="/cart" className="group relative p-2.5 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/account" className="p-2.5 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
                  <User className="h-5 w-5" />
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block">
                <Button size="sm" className="px-6 rounded-full shadow-md shadow-primary/20 font-black uppercase tracking-widest text-[10px]">Login</Button>
              </Link>
            )}
            <button className="lg:hidden p-2.5 text-zinc-900 bg-zinc-50 rounded-full" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
                  <h3 className="text-xl font-black mb-4">Shop by Category</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    Find the perfect tools for your creativity, from premium pens to professional art supplies.
                  </p>
                  <Link to="/products" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
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
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                        <img src={cat.image} alt={cat.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <span className="font-bold text-zinc-900 group-hover:text-primary transition-colors">{cat.name}</span>
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
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
                    <span className="text-lg font-black">N</span>
                  </div>
                  <span className="text-xl font-black tracking-tighter">NILESH <small className="text-primary">STORE</small></span>
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
                    className="block text-2xl font-black text-zinc-900 hover:text-primary"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-6 border-t font-bold text-zinc-400 uppercase tracking-widest text-xs mb-4">Categories</div>
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
              <div className="p-8 border-t bg-zinc-50">
                {!user && (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full mb-6">Login / Register</Button>
                  </Link>
                )}
                <div className="flex flex-col gap-4 text-sm font-bold text-zinc-400">
                  <div className="flex items-center gap-3"><Phone className="h-4 w-4" /> +91 94278 99898</div>
                  <div className="flex items-start gap-3"><MapPin className="h-4 w-4 flex-shrink-0" /> Vadodara, Gujarat</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="relative bg-zinc-900 text-white overflow-hidden uppercase tracking-widest text-[10px]">
      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white">
                <span className="text-xl font-black">N</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tighter">NILESH STORE</span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-400 normal-case tracking-normal">
              "Success in getting what you want happiness is wanting what you get"
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-zinc-400 hover:text-white transition-colors">
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-zinc-500">Call Us</span>
                  <span className="text-sm font-bold">+91 94278 99898</span>
                </div>
              </div>
              <div className="flex items-start gap-4 text-zinc-400 hover:text-white transition-colors">
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-secondary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-zinc-500">Address</span>
                  <span className="text-[10px] leading-relaxed max-w-[200px] normal-case tracking-normal font-medium">
                    Nr. Siddhi Vinayak Temple, Dandia Bazaar Main Road, Vadodara, Gujarat 390001
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-8 text-zinc-500">Categories</h4>
            <ul className="grid grid-cols-1 gap-4 font-bold text-zinc-400">
              {categories.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <Link to={`/products?category=${cat.id}`} className="hover:text-primary transition-colors flex items-center gap-2">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-zinc-500">Quick Links</h4>
            <ul className="grid grid-cols-1 gap-4 font-bold text-zinc-400">
              <li><Link to="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Get in Touch</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Latest Collection</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="bg-zinc-800/50 p-8 rounded-[2rem] border border-zinc-700/50">
            <h4 className="mb-4 text-sm font-black italic">Stay Inspired</h4>
            <p className="text-[10px] text-zinc-400 mb-6 leading-relaxed normal-case tracking-normal">
              Subscribe to get news about latest arrivals and exclusive store offers.
            </p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-zinc-900 border-none rounded-xl px-4 py-3 text-[10px] focus:ring-1 focus:ring-primary h-10"
              />
              <Button size="sm" className="w-full text-[10px]">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-500">
          <p>&copy; {new Date().getFullYear()} NILESH STORE. All rights reserved.</p>
          <div className="flex gap-10">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex min-h-screen flex-col bg-background font-sans antialiased text-zinc-900 selection:bg-primary/10 selection:text-primary">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/account" element={<Account />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<div className="container py-40 text-center text-4xl font-black uppercase tracking-tighter">Page Not Found</div>} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-center" richColors theme="light" />
            
            {/* WhatsApp Float */}
            <a 
              href="https://wa.me/919427899898" 
              target="_blank" 
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-50 flex items-center h-14 w-14 bg-[#25D366] text-white rounded-full shadow-[0_15px_35px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all justify-center group"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.653a11.883 11.883 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <div className="absolute right-full mr-4 bg-white text-[#25D366] px-4 py-2 rounded-xl text-xs font-black shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                WhatsApp Us
              </div>
            </a>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
