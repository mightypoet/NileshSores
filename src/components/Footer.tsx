import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Button } from './ui/button';

const Footer = () => {
  return (
    <footer className="relative bg-zinc-900 text-white overflow-hidden uppercase tracking-widest text-[10px]">
      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-auto flex items-center justify-center transition-transform group-hover:scale-105">
                <img 
                  src="https://zonyxuymmdtacejy.private.blob.vercel-storage.com/pomelli_photoshoot_image_1_1_0420.png" 
                  alt="Logo" 
                  className="h-full w-auto object-contain brightness-0 invert"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tighter italic">NILESH STORES</span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-400 normal-case tracking-normal lowercase first-letter:uppercase">
              "Success in getting what you want happiness is wanting what you get"
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-zinc-400 hover:text-white transition-colors">
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-indigo-600 group hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Call Us</span>
                  <span className="text-sm font-bold tracking-tight">+91 94278 99898</span>
                </div>
              </div>
              <div className="flex items-start gap-4 text-zinc-400 hover:text-white transition-colors">
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-indigo-600 group hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Address</span>
                  <span className="text-[10px] leading-relaxed max-w-[200px] normal-case tracking-normal font-medium lowercase first-letter:uppercase">
                    Nr. Siddhi Vinayak Temple, Dandia Bazaar Main Road, Vadodara, Gujarat 390001
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-8 text-zinc-500 font-black">Explore</h4>
            <ul className="grid grid-cols-1 gap-4 font-bold text-zinc-400">
              <li><Link to="/products" className="hover:text-indigo-600 transition-colors flex items-center gap-2">New Arrivals</Link></li>
              <li><Link to="/products?filter=best-seller" className="hover:text-indigo-600 transition-colors flex items-center gap-2">Best Sellers</Link></li>
              <li><Link to="/products" className="hover:text-indigo-600 transition-colors flex items-center gap-2">Gift Sets</Link></li>
              <li><Link to="/products" className="hover:text-indigo-600 transition-colors flex items-center gap-2">Corporate Orders</Link></li>
              <li><Link to="/products" className="hover:text-indigo-600 transition-colors flex items-center gap-2">Store Near Me</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-zinc-500 font-black">Quick Links</h4>
            <ul className="grid grid-cols-1 gap-4 font-bold text-zinc-400">
              <li><Link to="/about" className="hover:text-indigo-600 transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-600 transition-colors">Get in Touch</Link></li>
              <li><Link to="/products" className="hover:text-indigo-600 transition-colors">Latest Collection</Link></li>
              <li><Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="bg-zinc-800/30 p-8 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-sm shadow-inner group">
            <h4 className="mb-4 text-sm font-black italic tracking-tighter group-hover:text-indigo-600 transition-colors">Stay Inspired</h4>
            <p className="text-[10px] text-zinc-500 mb-6 leading-relaxed normal-case tracking-normal lowercase first-letter:uppercase">
              Subscribe to get news about latest arrivals and exclusive store offers.
            </p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-zinc-900/50 border-zinc-800 border-2 rounded-2xl px-5 py-3 text-[10px] focus:ring-2 focus:ring-indigo-600 h-12 outline-none transition-all placeholder:text-zinc-600"
              />
              <Button size="sm" className="w-full text-[10px] h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">Subscribe Now</Button>
            </div>
            <div className="flex gap-4 mt-8 justify-center">
              <Facebook className="h-4 w-4 text-zinc-500 hover:text-indigo-600 cursor-pointer transition-colors" />
              <Instagram className="h-4 w-4 text-zinc-500 hover:text-pink-600 cursor-pointer transition-colors" />
              <Twitter className="h-4 w-4 text-zinc-500 hover:text-sky-500 cursor-pointer transition-colors" />
              <Youtube className="h-4 w-4 text-zinc-500 hover:text-red-600 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-500 font-bold">
          <p className="lowercase tracking-widest text-[9px]">&copy; {new Date().getFullYear()} NILESH STORES. Crafted for excellence.</p>
          <div className="flex gap-10">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
