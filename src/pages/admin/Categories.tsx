import React, { useEffect, useState } from 'react';
import { 
  Layers, 
  PlusCircle, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Category } from '../../types';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    image: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await dataService.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', image: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const success = await dataService.deleteCategory(id);
      if (success) {
        setCategories(categories.filter(c => c.id !== id));
        toast.success('Category deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await dataService.uploadImage(file, 'category-images');
      if (url) {
        setFormData(prev => ({ ...prev, image: url }));
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.slug) {
        formData.slug = formData.name?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') || '';
      }

      if (editingCategory) {
        const result = await dataService.updateCategory(editingCategory.id, formData);
        if (result) {
          setCategories(categories.map(c => c.id === result.id ? result : c));
          toast.success('Category updated');
        }
      } else {
        const result = await dataService.createCategory(formData);
        if (result) {
          setCategories([...categories, result]);
          toast.success('Category created');
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Categories</h1>
          <p className="text-zinc-500 mt-1.5">Manage your store's product categories.</p>
        </div>
        <Button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <PlusCircle className="w-5 h-5" />
          Add Category
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 animate-pulse">
              <div className="w-full aspect-square bg-zinc-100 rounded-xl mb-4"></div>
              <div className="h-4 bg-zinc-100 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-zinc-100 rounded w-1/2"></div>
            </div>
          ))
        ) : categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square relative overflow-hidden bg-zinc-100">
              <img 
                src={category.image || 'https://via.placeholder.com/400'} 
                alt={category.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button onClick={() => handleEdit(category)} size="icon" className="bg-white text-zinc-900 hover:bg-zinc-100">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleDelete(category.id)} size="icon" className="bg-white text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-zinc-900 truncate">{category.name}</h3>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{category.slug}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></Button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <label className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-indigo-500 cursor-pointer overflow-hidden group">
                      {formData.image ? (
                        <img src={formData.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                          <ImageIcon className="w-8 h-8 mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Add Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="text-white w-6 h-6" />
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Category Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Slug</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="auto-generated"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700" disabled={loading || uploadingImage}>
                    {loading ? 'Saving...' : 'Save Category'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;
