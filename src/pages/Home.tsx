import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { products as mockProducts, categories as mockCategories } from '../data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ArrowRight, Star, ShoppingCart, Heart, Sparkles, TrendingUp, Zap, Gift, PenTool } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';
import { dataService } from '../services/dataService';
import { Product, Category, Banner } from '../types';

export default function Home() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prods, cats, bans] = await Promise.all([
          dataService.getProducts(),
          dataService.getCategories(),
          dataService.getBanners()
        ]);
        setProducts(prods);
        setCategories(cats);
        setBanners(bans.filter(b => b.active));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8);
  
  const featuredCollections = [
    { name: 'Inkredibles Series', image: 'https://cdn.shopify.com/s/files/1/0681/1510/3931/products/JumboNoteBookHardBound-1.jpg', desc: 'Creative tools for little hands' },
    { name: 'The Guardians', image: 'https://cdn.shopify.com/s/files/1/0681/1510/3931/products/EconamaCaseBoundA5Book_800x.jpg', desc: 'Elite gear for serious protection' },
    { name: 'Eco Warriors', image: 'https://cdn.shopify.com/s/files/1/0681/1510/3931/files/Mumbai-indians-Banner-Web_1.jpg', desc: 'Stationery for the environment' },
    { name: 'Art & Craft', image: 'https://cdn.shopify.com/s/files/1/0681/1510/3931/products/EconamaDrawingBook-3ARed_800x.jpg', desc: 'Unleash your imagination' },
  ];

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0]
    });
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden bg-zinc-50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 w-full h-full flex items-center">
          <AnimatePresence mode="wait">
            {banners.length > 0 ? (
              banners.map((banner, idx) => idx === currentBanner && (
                <motion.div 
                  key={banner.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full"
                >
                  <div className="space-y-10">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-zinc-100"
                    >
                      <Sparkles className="h-3 w-3 text-accent" /> Featured Offer
                    </motion.div>
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl sm:text-6xl md:text-8xl font-black text-zinc-900 leading-[1.05] tracking-tighter"
                    >
                      {banner.title}
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl text-zinc-500 leading-relaxed max-w-lg"
                    >
                      {banner.subtitle || "Discover premium stationery at Nilesh Store. From fine writing instruments to professional art supplies, we fuel your creativity."}
                    </motion.p>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-wrap gap-4"
                    >
                      <Link to={banner.link || "/products"}>
                        <Button size="lg" className="rounded-full px-10 shadow-xl shadow-primary/20">Shop Now</Button>
                      </Link>
                      <Link to="/products">
                        <Button variant="outline" size="lg" className="rounded-full px-10">View Categories</Button>
                      </Link>
                    </motion.div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative"
                  >
                    <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden shadow-2xl skew-y-2 group">
                      <img 
                        src={banner.image} 
                        alt={banner.title} 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  </motion.div>
                </motion.div>
              ))
            ) : (
              // Fallback to default if no banners
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
                <div className="space-y-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-zinc-100">
                    <Sparkles className="h-3 w-3 text-accent" /> Premium Collection 2026
                  </div>
                  <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-zinc-900 leading-[1.05] tracking-tighter">
                    Every Idea <br />
                    <span className="text-primary italic">Starts Here.</span>
                  </h1>
                  <p className="text-xl text-zinc-500 leading-relaxed max-w-lg">
                    Explore premium stationery at Nilesh Store. From fine writing instruments to professional art supplies, we fuel your creativity.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/products">
                      <Button size="lg" className="rounded-full px-10 shadow-xl shadow-primary/20">Shop Now</Button>
                    </Link>
                    <Link to="/products">
                      <Button variant="outline" size="lg" className="rounded-full px-10">View Categories</Button>
                    </Link>
                  </div>
                </div>

                <div className="relative">
                  <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden shadow-2xl skew-y-2 group">
                    <img 
                      src="https://econama.in/cdn/shop/files/Econama_book_mockup.png?v=1737547794&width=750" 
                      alt="Nilesh Store Stationery" 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 sm:mb-16">
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-primary">Discover</h2>
            <h3 className="text-3xl sm:text-5xl font-black tracking-tighter">Iconic Categories</h3>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-primary transition-colors">
            See all categories <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.slice(0, 8).map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={`/products?category=${cat.id}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-zinc-100 shadow-sm border border-zinc-100">
                <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2 group-hover:brightness-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">{idx + 1} &mdash; Category</p>
                  <h4 className="text-2xl font-black text-white leading-tight">{cat.name}</h4>
                  <div className="mt-4 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500 rounded-full" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Side Promotion */}
      <section className="bg-primary py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-black/5 -skew-x-12 translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center space-y-10">
          <Badge variant="accent" className="px-6 py-2 text-sm">Flash Offer</Badge>
          <h2 className="text-6xl md:text-8xl font-black text-white tracking-widest leading-none">
            BACK TO SCHOOL <br />
            STATIONERY <span className="opacity-40 italic">SALE</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl font-medium tracking-tight leading-relaxed">
            Stock up on all your academic essentials before the term starts. Quality you can trust, prices you'll love.
          </p>
          <div className="flex flex-col items-center gap-6">
            <Link to="/products">
              <Button size="lg" variant="accent" className="rounded-full px-12 text-zinc-900 shadow-2xl">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <span className="text-white/50 text-xs font-black uppercase tracking-[0.3em]">Flat 20% OFF Site-wide</span>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-secondary">Trending</h2>
            <h3 className="text-5xl font-black tracking-tighter">Best Sellers</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-0.5 w-32 bg-zinc-100 rounded-full" />
            <Link to="/products" className="text-sm font-bold text-zinc-400 hover:text-primary transition-colors">Explore All</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellers.map((product) => (
            <motion.div 
              key={product.id}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-[2.5rem] border border-zinc-100 p-4 shadow-sm hover:shadow-2xl hover:border-transparent transition-all duration-500"
            >
              <Link to={`/products/${product.slug}`} className="relative block aspect-square rounded-[2rem] overflow-hidden bg-zinc-50 mb-6">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="h-full w-full object-contain p-8 group-hover:scale-110 transition-transform duration-700" 
                />
                <button className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all hover:bg-white text-zinc-400 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </button>
              </Link>
              <div className="px-4 pb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">{product.categoryId.replace('-', ' ')}</span>
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-[10px] font-black">{product.rating}</span>
                  </div>
                </div>
                <h4 className="text-lg font-black text-zinc-900 group-hover:text-primary transition-colors leading-tight line-clamp-2 min-h-[3.5rem]">{product.name}</h4>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col leading-none">
                    <span className="text-xl font-black text-zinc-900">₹{product.price}</span>
                    {product.mrp > product.price && (
                      <span className="text-[10px] text-zinc-400 font-bold line-through">₹{product.mrp}</span>
                    )}
                  </div>
                  <Button 
                    size="icon" 
                    variant="outline"
                    className="rounded-xl"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(product);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Collections Section */}
      <section className="bg-zinc-50 py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400">Shop by Purpose</h2>
            <h3 className="text-5xl md:text-6xl font-black tracking-tighter">Our Collections</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCollections.map((col, idx) => (
              <Link key={idx} to="/products" className="group relative block aspect-[4/5] rounded-[3rem] overflow-hidden">
                <img src={col.image} alt={col.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-10 flex flex-col justify-end text-white">
                  <h4 className="text-2xl font-black mb-2">{col.name}</h4>
                  <p className="text-[10px] font-bold text-white/60 mb-6 group-hover:translate-x-2 transition-transform normal-case tracking-normal">{col.desc}</p>
                  <div className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="container mx-auto px-4 text-center py-20">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="h-px w-24 bg-zinc-100 mx-auto" />
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
            "Every Idea starts with the <br />
            <span className="text-zinc-300">Right Stationery.</span>"
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 leading-relaxed max-w-sm mx-auto">
            &mdash; Nilesh Store Philosophy &mdash; <br />
            <span className="font-medium normal-case tracking-normal text-zinc-400 italic">"Success in getting what you want happiness is wanting what you get"</span>
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-zinc-100 pt-32">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-zinc-50 flex items-center justify-center text-primary shadow-sm group hover:scale-110 transition-transform">
            <Gift className="h-8 w-8" />
          </div>
          <h5 className="font-black text-[10px] uppercase tracking-widest text-zinc-900">Store Pickup</h5>
          <p className="text-[10px] font-medium text-zinc-400 normal-case tracking-normal">Order online, pick in Vadodara</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-zinc-50 flex items-center justify-center text-secondary shadow-sm group hover:scale-110 transition-transform">
            <Zap className="h-8 w-8" />
          </div>
          <h5 className="font-black text-[10px] uppercase tracking-widest text-zinc-900">Fast Delivery</h5>
          <p className="text-[10px] font-medium text-zinc-400 normal-case tracking-normal">Quick shipping across Gujarat</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-zinc-50 flex items-center justify-center text-accent shadow-sm group hover:scale-110 transition-transform">
            <Sparkles className="h-8 w-8" />
          </div>
          <h5 className="font-black text-[10px] uppercase tracking-widest text-zinc-900">Guaranteed Quality</h5>
          <p className="text-[10px] font-medium text-zinc-400 normal-case tracking-normal">Only the best for your desk</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-900 shadow-sm group hover:scale-110 transition-transform">
            <PenTool className="h-8 w-8" />
          </div>
          <h5 className="font-black text-[10px] uppercase tracking-widest text-zinc-900">Expert Advice</h5>
          <p className="text-[10px] font-medium text-zinc-400 normal-case tracking-normal">Stationery pros at your service</p>
        </div>
      </section>
    </div>
  );
}
