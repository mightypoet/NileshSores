import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Product, Category } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, SlidersHorizontal, Grid, List as ListIcon, Star, ShoppingCart, Heart, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function fetchData() {
      try {
        const [prods, cats] = await Promise.all([
          dataService.getProducts(),
          dataService.getCategories()
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (error) {
        console.error("Error loading catalogue:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const selectedCategory = searchParams.get('category');
  const filterType = searchParams.get('filter');
  const selectedCollection = searchParams.get('collection');

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory) {
      const categoryResults = result.filter(p => p.categoryId === selectedCategory);
      if (categoryResults.length > 0) result = categoryResults;
    }

    if (selectedCollection) {
      // In UI we pass the slug, but in database it might be stored as name or slug.
      // We will match case-insensitive to either slug or exact name.
      const collectionResults = result.filter(p => 
        p.collection && (
          p.collection.toLowerCase() === selectedCollection.toLowerCase() ||
          p.collection.toLowerCase().replace(/[^a-z0-9]+/g, '-') === selectedCollection.toLowerCase()
        )
      );
      if (collectionResults.length > 0) result = collectionResults;
    }

    if (filterType === 'best-seller') {
      const bestSellerResults = result.filter(p => p.isBestSeller);
      if (bestSellerResults.length > 0) result = bestSellerResults;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'discount': result.sort((a, b) => (b.discount || 0) - (a.discount || 0)); break;
    }

    return result;
  }, [products, selectedCategory, selectedCollection, filterType, searchQuery, sortBy]);

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0]
    });
    toast.success(`Added ${product.name} to cart`);
  };

  const categoryName = categories.find(c => c.id === selectedCategory)?.name || 'All Products';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest text-center">Loading Catalogue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">{categoryName}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter capitalize leading-none">
            {filterType === 'best-seller' ? 'Best Sellers' : categoryName}
          </h1>
          <p className="text-sm text-zinc-500 font-medium">Discover {filteredProducts.length} premium stationery items</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search in category..."
              className="w-full h-12 pl-12 pr-4 rounded-2xl border-zinc-100 bg-zinc-50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-xl lg:hidden ${showFilters ? 'bg-primary border-primary text-white' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <div className="hidden lg:flex items-center gap-2 bg-zinc-100 p-1.5 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-zinc-400'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-zinc-400'}`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
          <select 
            className="h-12 px-6 rounded-2xl border-zinc-100 bg-zinc-50 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>
      </div>

      <div className="flex gap-12">
        {/* Sidebar Filters */}
        <aside className={`fixed inset-0 z-50 lg:static lg:block lg:w-64 bg-white transition-transform duration-500 lg:translate-x-0 ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full lg:h-auto overflow-y-auto p-10 lg:p-0">
            <div className="flex justify-between items-center lg:hidden mb-10">
              <span className="text-2xl font-black">Filters</span>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-zinc-100 rounded-full"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-12">
              <section className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Categories</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setSearchParams({})}
                    className={`block w-full text-left text-sm font-bold capitalize transition-colors ${!selectedCategory && !filterType ? 'text-primary' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    All Products
                  </button>
                  <button 
                    onClick={() => setSearchParams({ filter: 'best-seller' })}
                    className={`block w-full text-left text-sm font-bold capitalize transition-colors ${filterType === 'best-seller' ? 'text-primary' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    Best Sellers
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => setSearchParams({ category: cat.id })}
                      className={`block w-full text-left text-sm font-bold capitalize transition-colors ${selectedCategory === cat.id ? 'text-primary px-4 border-l-2 border-primary' : 'text-zinc-500 hover:text-zinc-900'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Special Collections</h3>
                <div className="flex flex-wrap gap-2">
                  {['Kids', 'Professional', 'School', 'Exam'].map(tag => (
                    <button key={tag} className="px-4 py-2 bg-zinc-50 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </section>

              <section className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                <h4 className="text-sm font-black mb-2 italic">Custom Orders?</h4>
                <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed tracking-tight font-medium">Bulk orders for schools or offices get special privilege pricing.</p>
                <Link to="/contact">
                  <Button size="sm" variant="outline" className="w-full text-[10px] bg-white border-primary/20">Contact Us</Button>
                </Link>
              </section>
            </div>
          </div>
        </aside>

        {/* Product List */}
        <main className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200">
              <div className="h-20 w-20 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-6">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black mb-2">No results found</h3>
              <p className="text-sm text-zinc-400 font-medium">Try adjusting your filters or search query.</p>
              <Button variant="ghost" className="mt-6" onClick={() => { setSearchQuery(''); setSearchParams({}); }}>Clear all</Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10" : "flex flex-col gap-8"}>
              {filteredProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`group bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ${viewMode === 'list' ? 'flex' : ''}`}
                >
                  <Link 
                    to={`/products/${product.slug}`} 
                    className={`relative block bg-zinc-50 overflow-hidden ${viewMode === 'list' ? 'w-1/3' : 'aspect-square'}`}
                  >
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="h-full w-full object-contain p-8 group-hover:scale-110 transition-transform duration-700" 
                    />
                    {product.discount && (
                      <div className="absolute top-6 left-6 px-3 py-1 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                        {product.discount}% OFF
                      </div>
                    )}
                    <button className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all hover:bg-white text-zinc-400 hover:text-red-500">
                      <Heart className="h-5 w-5" />
                    </button>
                  </Link>

                  <div className={`p-8 space-y-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-center' : ''}`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{product.categoryId.replace('-', ' ')}</span>
                        <div className="flex items-center gap-1 text-accent">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-[10px] font-black">{product.rating}</span>
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-zinc-900 group-hover:text-primary transition-colors leading-tight">
                        {product.name}
                      </h4>
                    </div>
                    
                    {viewMode === 'list' && (
                      <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed normal-case tracking-normal font-medium">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                      <div className="flex flex-col leading-none">
                        <span className="text-2xl font-black text-zinc-900">₹{product.price}</span>
                        {product.mrp > product.price && (
                          <span className="text-[10px] text-zinc-400 font-bold line-through">₹{product.mrp}</span>
                        )}
                      </div>
                      <Button 
                        size={viewMode === 'list' ? 'md' : 'icon'} 
                        className={viewMode === 'list' ? 'rounded-2xl px-8' : 'rounded-xl h-12 w-12 shadow-xl shadow-primary/10'}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                      >
                        {viewMode === 'list' ? (
                          <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Add to Cart</span>
                        ) : (
                          <ShoppingCart className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
