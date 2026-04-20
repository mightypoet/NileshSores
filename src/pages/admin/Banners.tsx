import React, { useEffect, useState } from 'react';
import { 
  Image as ImageIcon, 
  PlusCircle, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Upload,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Banner } from '../../types';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    active: true,
    order: 0
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await dataService.getBanners();
      setBanners(data);
    } catch (error) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingBanner(null);
    setFormData({ title: '', subtitle: '', image: '', link: '', active: true, order: banners.length });
    setIsModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      const success = await dataService.deleteBanner(id);
      if (success) {
        setBanners(banners.filter(b => b.id !== id));
        toast.success('Banner deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await dataService.uploadImage(file, 'banners');
      if (url) {
        setFormData(prev => ({ ...prev, image: url }));
        toast.success('Banner image uploaded');
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
      if (editingBanner) {
        const result = await dataService.updateBanner(editingBanner.id, formData);
        if (result) {
          setBanners(banners.map(b => b.id === result.id ? result : b));
          toast.success('Banner updated');
        }
      } else {
        const result = await dataService.createBanner(formData);
        if (result) {
          setBanners([...banners, result]);
          toast.success('Banner created');
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Home Banners</h1>
          <p className="text-zinc-500 mt-1.5">Configure promotional banners for your homepage.</p>
        </div>
        <Button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <PlusCircle className="w-5 h-5" />
          Add Banner
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2].map(i => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-zinc-200 animate-pulse" />
          ))
        ) : banners.length === 0 ? (
          <div className="bg-white p-12 text-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400">
            No banners active. Create one to highlight your top products.
          </div>
        ) : (
          banners.map((banner) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col md:flex-row"
            >
              <div className="w-full md:w-80 h-48 relative overflow-hidden bg-zinc-100">
                <img 
                  src={banner.image} 
                  alt={banner.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {!banner.active && (
                  <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-white text-zinc-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Inactive</span>
                  </div>
                )}
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-zinc-900">{banner.title}</h3>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(banner)} className="h-8 w-8">
                        <Edit2 className="w-4 h-4 text-zinc-600" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(banner.id)} className="h-8 w-8 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-zinc-500 mt-1">{banner.subtitle}</p>
                  <p className="text-xs text-indigo-600 mt-4 font-medium flex items-center gap-1 uppercase tracking-widest">
                    <ExternalLink className="w-3 h-3" />
                    {banner.link || 'No Link'}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  <span>Order: {banner.order}</span>
                  <span className={`w-2 h-2 rounded-full ${banner.active ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={banner.active ? 'text-green-600' : 'text-red-500'}>{banner.active ? 'Visible' : 'Hidden'}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingBanner ? 'Edit Banner' : 'New Banner'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></Button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6 uppercase tracking-widest">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block mb-2">Banner Title</label>
                      <input type="text" required className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block mb-2">Subtitle</label>
                      <input type="text" className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block mb-2">Link (Redirect URL)</label>
                      <input type="text" className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" placeholder="/products/category-slug" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 block mb-2 uppercase tracking-widest">Banner Image (1920x600 recommended)</label>
                    <label className="relative block aspect-[16/6] bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 overflow-hidden cursor-pointer group">
                      {formData.image ? (
                        <img src={formData.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                          <ImageIcon className="w-10 h-10 mb-2" />
                          <span className="text-xs uppercase font-bold">Recommended: Long Wide Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Upload className="w-8 h-8" />
                      </div>
                      <input type="file" className="hidden" onChange={handleImageUpload} />
                    </label>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 block mb-2 uppercase tracking-widest">Order</label>
                        <input type="number" className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                      </div>
                      <div className="flex flex-col justify-end pb-3">
                         <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                              checked={formData.active}
                              onChange={e => setFormData({...formData, active: e.target.checked})}
                            />
                            <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest leading-none">Visible on site</span>
                         </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 h-12 bg-indigo-600 text-white hover:bg-indigo-700" disabled={loading || uploadingImage}>
                    {loading ? 'Saving...' : 'Save Banner'}
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

export default AdminBanners;
