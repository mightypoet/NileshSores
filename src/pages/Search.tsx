import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, ArrowRight, ShoppingCart, Filter, SlidersHorizontal } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Product } from '../types';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const products = await dataService.getProducts();
        const filtered = products.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) || 
          p.description.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: inputValue });
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-zinc-50">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-16 text-center">
          <h1 className="text-5xl font-black tracking-tighter mb-8 uppercase italic">
            Search <span className="text-indigo-600 underline decoration-indigo-600/30 decoration-8 underline-offset-8">Results</span>
          </h1>
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Find products, brands, or tools..."
              className="w-full h-16 md:h-20 pl-8 pr-32 bg-white rounded-3xl border-2 border-zinc-100 shadow-xl shadow-zinc-200/50 text-lg font-bold outline-none ring-offset-4 focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder:text-zinc-400"
            />
            <Button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 md:h-14 px-8 rounded-2xl bg-zinc-900 shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <SearchIcon className="h-5 w-5" />
              )}
            </Button>
          </form>
          {query && !loading && (
            <p className="mt-6 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
              Found {results.length} results for "{query}"
            </p>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 4, 5, 6, 7].map(i => (
              <div key={i} className="aspect-[4/5] bg-zinc-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            <AnimatePresence mode="popLayout">
              {results.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group"
                >
                  <Link to={`/products/${product.slug}`} className="block relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-zinc-200/50 border border-zinc-100 mb-6 group-hover:shadow-2xl group-hover:shadow-indigo-600/20 transition-all duration-500">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      {product.stock <= 0 ? (
                        <span className="px-4 py-2 bg-red-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg">Sold Out</span>
                      ) : product.isBestSeller && (
                        <span className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg">Best Seller</span>
                      )}
                    </div>
                  </Link>
                  <div className="px-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-black text-zinc-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-1">{product.name}</h3>
                      <span className="text-sm font-black text-indigo-600">₹{product.price}</span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{product.categoryId}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : query ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-zinc-100 shadow-inner">
            <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="h-8 w-8 text-zinc-300" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 mb-2 italic">Nothing Matched</h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Try adjusting your keywords or browse all products.</p>
            <Link to="/products" className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-600/30">
              Browse All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-8 text-center">Popular Searches</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['Parker', 'Water Color', 'Spiral Notebook', 'Fountain Pen', 'Acrylic', 'Sketchbook'].map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setInputValue(tag);
                    setSearchParams({ q: tag });
                  }}
                  className="px-6 py-3 bg-white hover:bg-indigo-600 hover:text-white rounded-2xl text-sm font-bold border border-zinc-100 shadow-lg shadow-zinc-200/50 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
