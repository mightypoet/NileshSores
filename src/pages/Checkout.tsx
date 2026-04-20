import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Truck, CreditCard, ChevronRight, CheckCircle2, ArrowLeft, MapPin, Phone, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Checkout() {
  const { items, subtotal, clearCart, totalItems } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const shipping = subtotal > 1000 ? 0 : 50;
  const grandTotal = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setOrderComplete(true);
      clearCart();
      toast.success('Your creative journey has begun! Order placed successfully.');
    }, 2500);
  };

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-40 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto space-y-10"
        >
          <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-black tracking-tighter italic uppercase leading-none">Order Confirmed</h2>
            <p className="text-lg font-bold text-zinc-500">Thank you for choosing Nilesh Store. Your premium stationery is being prepared for its new home.</p>
          </div>
          <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex flex-col items-center gap-4">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Order Reference</p>
            <p className="text-2xl font-black tracking-tight">#NS-{Math.floor(100000 + Math.random() * 900000)}</p>
            <p className="text-[10px] font-bold text-zinc-400">A confirmation email has been sent to your inbox.</p>
          </div>
          <Link to="/" className="block">
            <Button size="lg" className="px-12 rounded-2xl shadow-xl shadow-primary/20">Return Home</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black mb-6 italic uppercase">No items to checkout</h2>
        <Button onClick={() => navigate('/products')}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 bg-zinc-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 space-y-4">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            <Link to="/cart" className="hover:text-primary transition-colors">Cart</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">Checkout</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none italic uppercase">Finalize <span className="text-zinc-300">Order</span></h1>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-16">
          <div className="xl:col-span-7 space-y-12">
            {/* Delivery Details */}
            <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight">Shipping Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                    <input required type="text" className="w-full h-14 pl-12 pr-4 bg-zinc-50 border-none rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="Rohan Sharma" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                    <input required type="tel" className="w-full h-14 pl-12 pr-4 bg-zinc-50 border-none rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Street Address</label>
                  <input required type="text" className="w-full h-14 px-4 bg-zinc-50 border-none rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="Nr. Siddhi Vinayak Temple, Dandia Bazaar" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">City</label>
                  <input required type="text" className="w-full h-14 px-4 bg-zinc-50 border-none rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="Vadodara" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Pincode</label>
                  <input required type="text" className="w-full h-14 px-4 bg-zinc-50 border-none rounded-2xl text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="390001" />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary/5 flex items-center justify-center text-secondary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight">Payment Method</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative p-6 rounded-[2rem] border-2 border-primary bg-primary/5 cursor-pointer flex items-center gap-4 group">
                  <input type="radio" name="payment" defaultChecked className="h-4 w-4 accent-primary" />
                  <div>
                    <p className="text-sm font-black text-zinc-900 leading-none mb-1">Cash on Delivery</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pay at doorstep</p>
                  </div>
                </label>
                <label className="relative p-6 rounded-[2rem] border-2 border-zinc-50 hover:border-zinc-100 cursor-not-allowed opacity-50 flex items-center gap-4 group">
                  <input disabled type="radio" name="payment" className="h-4 w-4 accent-primary" />
                  <div>
                    <p className="text-sm font-black text-zinc-900 leading-none mb-1">Online Payment</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Coming Soon</p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="xl:col-span-5 space-y-12">
            <section className="bg-zinc-900 text-white p-10 rounded-[3rem] shadow-2xl space-y-10">
              <h2 className="text-3xl font-black tracking-tighter italic">Order <span className="text-zinc-600">Review</span></h2>
              
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 scrollbar-hide">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 items-center">
                    <div className="h-16 w-16 bg-white/5 rounded-2xl p-2 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-xs font-bold line-clamp-1 italic">{item.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-black">QTY: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-black tracking-tight">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="pt-10 border-t border-zinc-800 space-y-6">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-500">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-500">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-400" : "text-white"}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="pt-6 border-t border-zinc-800 flex justify-between items-end">
                  <span className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em]">Payable</span>
                  <span className="text-5xl font-black tracking-tighter">₹{grandTotal}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                disabled={isProcessing}
                className="w-full h-16 rounded-2xl bg-white text-zinc-900 hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/20"
              >
                {isProcessing ? 'Validating Order...' : 'Confirm Order & Pay'}
              </Button>

              <div className="flex items-center justify-center gap-6 pt-4 text-zinc-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Safe Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Handmade Journey</span>
                </div>
              </div>
            </section>

            <button 
              type="button"
              onClick={() => navigate('/cart')}
              className="flex items-center justify-center gap-3 w-full text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-primary transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Modify My Creative Bundle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
