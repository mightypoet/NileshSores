import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ShoppingCart, Star, Heart, ArrowLeft, Truck, ShieldCheck, RotateCcw, Share2, Check, Minus, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await dataService.getProductBySlug(slug);
        setProduct(prod);
        
        if (prod) {
          const allProducts = await dataService.getProducts();
          const related = allProducts
            .filter(p => p.category_id === prod.category_id && p.id !== prod.id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-40 text-center">
        <h2 className="text-4xl font-black mb-6 tracking-tighter capitalize leading-none italic uppercase">Product Not Found</h2>
        <Button onClick={() => navigate('/products')}>Back to Shop</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0]
    });
    toast.success(`Enhanced ${quantity}x ${product.name} to your creative arsenal`);
  };

  return (
    <div className="pb-32">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-4 mb-12">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full px-4 text-xs font-black uppercase tracking-widest text-zinc-400"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="h-px w-12 bg-zinc-100" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">{product.category_id.replace('-', ' ')}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-20">
          {/* Gallery */}
          <div className="space-y-4 sm:space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-2xl sm:rounded-[3rem] bg-zinc-50 border border-zinc-100 overflow-hidden group p-6 sm:p-12"
            >
              <img 
                src={product.images[activeImage]} 
                alt={product.name} 
                className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700" 
              />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-2xl border-2 transition-all overflow-hidden bg-zinc-50 ${activeImage === idx ? 'border-primary' : 'border-transparent hover:border-zinc-200'}`}
                >
                  <img src={img} alt={`${product.name} ${idx}`} className="h-full w-full object-contain p-2" />
                </button>
              ))}
              {/* Mock placeholders to fill grid */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-zinc-100/50 border border-dashed border-zinc-200" />
              ))}
            </div>
          </div>

            <div className="flex flex-col justify-center space-y-6 sm:space-y-10">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="accent" className="px-3 sm:px-4 py-1">In Stock</Badge>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-primary/5 transition-colors">
                      <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">{product.reviews_count} REVIEWS</span>
              </div>
            </div>

            <div className="flex items-baseline gap-4 sm:gap-6 pb-6 sm:pb-10 border-b border-zinc-100">
              <span className="text-3xl sm:text-5xl font-black text-primary">₹{product.price}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-xl sm:text-2xl text-zinc-300 font-bold line-through">₹{product.mrp}</span>
                  <span className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-green-500">Save {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%</span>
                </>
              )}
            </div>

            <p className="text-lg text-zinc-500 leading-relaxed font-medium">
              {product.description}
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center h-14 bg-zinc-100 rounded-2xl px-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 flex items-center justify-center hover:bg-white rounded-xl transition-colors font-black"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-black text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 flex items-center justify-center hover:bg-white rounded-xl transition-colors font-black"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button size="lg" className="flex-1 rounded-2xl shadow-xl shadow-primary/20" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-3" /> Add to Cart
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 border-t border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-primary">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 leading-none mb-1">Fast Delivery</p>
                  <p className="text-[8px] font-bold text-zinc-400">Within 24-48 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-secondary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 leading-none mb-1">Secure Pay</p>
                  <p className="text-[8px] font-bold text-zinc-400">Encrypted checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-accent">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 leading-none mb-1">Easy Return</p>
                  <p className="text-[8px] font-bold text-zinc-400">7-day policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 mt-32">
          <div className="flex items-end justify-between mb-16">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">You Might Also Need</h2>
              <h3 className="text-4xl font-black tracking-tighter">Perfect Companions</h3>
            </div>
            <Link to="/products" className="text-sm font-bold text-primary group flex items-center gap-2">
              View all products <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <Link key={p.id} to={`/products/${p.slug}`} className="group space-y-6">
                <div className="aspect-square bg-zinc-50 rounded-[2rem] overflow-hidden border border-transparent group-hover:border-primary/20 transition-all p-8">
                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-contain group-hover:scale-110 transition-all duration-700" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-zinc-900 line-clamp-1 group-hover:text-primary transition-colors">{p.name}</h4>
                  <p className="text-xl font-black">₹{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
