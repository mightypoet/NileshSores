import { useCart } from '../hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, ArrowLeft, ShieldCheck, Truck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  const shipping = subtotal > 1000 ? 0 : 50;
  const hsnCharge = subtotal * 0.18; // 18% GST estimate
  const grandTotal = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-40 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto space-y-8"
        >
          <div className="h-32 w-32 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 mx-auto">
            <ShoppingCart className="h-16 w-16" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tighter italic uppercase leading-none">Your canvas is empty</h2>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed">It looks like you haven't added any premium stationery to your cart yet. Let's find some inspiration!</p>
          </div>
          <Link to="/products" className="block">
            <Button size="lg" className="w-full rounded-2xl shadow-xl shadow-primary/20">Start Shopping</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 pb-40">
      <div className="flex flex-col gap-12">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <div className="h-0.5 w-8 bg-zinc-100" />
            <span className="text-primary">Cart</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">Your Shopping <span className="text-zinc-300">Bag</span></h1>
          <p className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{totalItems} Items selected</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
          {/* Cart Items */}
          <div className="xl:col-span-2 space-y-8">
            <div className="flex flex-col gap-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group relative flex flex-col sm:flex-row gap-8 bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500"
                  >
                    <Link to={`/products/${item.productId}`} className="h-40 w-40 flex-shrink-0 bg-zinc-50 rounded-3xl overflow-hidden p-6">
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700" />
                    </Link>
                    
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-zinc-900 group-hover:text-primary transition-colors leading-tight">{item.name}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Premium Series</p>
                        </div>
                        <span className="text-2xl font-black">₹{item.price * item.quantity}</span>
                      </div>

                      <div className="flex items-center justify-between mt-8">
                        <div className="flex items-center h-12 bg-zinc-100 rounded-xl px-2">
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="h-8 w-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="h-8 w-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => {
                            removeItem(item.productId);
                            toast.info(`Removed ${item.name} from bag`);
                          }}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <Link to="/products">
              <Button variant="ghost" className="mt-4 rounded-full font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Summary */}
          <div className="space-y-12">
            <section className="bg-zinc-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h2 className="text-3xl font-black tracking-tighter mb-10 italic">Order <span className="text-zinc-600">Summary</span></h2>
              
              <div className="space-y-6 text-sm font-bold uppercase tracking-widest">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-400" : "text-white"}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>GST (Tax)</span>
                  <span className="text-white italic">Incl.</span>
                </div>
                
                <div className="pt-6 border-t border-zinc-800 space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-zinc-400 text-xs">Total Amount</span>
                    <span className="text-4xl font-black tracking-tighter">₹{grandTotal}</span>
                  </div>
                  <p className="text-[8px] text-zinc-600 text-right opacity-60">Handcrafted in Vadodara with love</p>
                </div>
              </div>

              <div className="mt-10">
                <Button 
                  size="lg" 
                  className="w-full h-16 rounded-2xl bg-white text-zinc-900 hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/20"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </section>

            <section className="space-y-8 px-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center text-primary flex-shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 mb-1">Secure Checkout</h4>
                  <p className="text-[10px] text-zinc-500 font-medium normal-case tracking-normal">Your payment details are fully encrypted and safe with us.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center text-secondary flex-shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 mb-1">Trusted Logistics</h4>
                  <p className="text-[10px] text-zinc-500 font-medium normal-case tracking-normal">We partner with India's best couriers for swift delivery.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
