import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, Pencil, Trash2, Loader2, Save, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { dataService } from '../../services/dataService';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function AdminCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tableExists, setTableExists] = useState(true);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    slug: '',
    status: 'active',
    sort_order: 0
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      // We will check if we can fetch collections
      const { data, error } = await supabase.from('collections').select('*').order('sort_order');
      
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table') || error.message?.includes('does not exist')) {
          setTableExists(false);
        } else {
          toast.error('Failed to load collections: ' + error.message);
        }
        return;
      }
      
      setTableExists(true);
      setCollections(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({ id: '', name: '', description: '', image: '', slug: '', status: 'active', sort_order: collections.length });
    setIsEditing(true);
  };

  const handleEdit = (col: any) => {
    setFormData(col);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) throw error;
      toast.success('Collection deleted');
      setCollections(collections.filter(c => c.id !== id));
    } catch (err: any) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.image) {
      toast.error('Name and Image are required');
      return;
    }
    
    // Auto generate slug if missing
    if (!formData.slug) {
      formData.slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    try {
      setLoading(true);
      if (formData.id) {
        const { error } = await supabase
          .from('collections')
          .update(formData)
          .eq('id', formData.id);
        if (error) throw error;
        toast.success('Collection updated');
        setCollections(collections.map(c => c.id === formData.id ? formData : c));
      } else {
        const { id, ...newCol } = formData;
        const { data, error } = await supabase
          .from('collections')
          .insert([newCol])
          .select()
          .single();
        if (error) throw error;
        toast.success('Collection created');
        if (data) setCollections([...collections, data]);
      }
      setIsEditing(false);
    } catch (err: any) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await dataService.uploadImage(file, 'product-images'); // Reuse product-images bucket
      if (url) {
        setFormData({ ...formData, image: url });
        toast.success('Image uploaded');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  if (!tableExists) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-20 text-center space-y-6 bg-red-50 rounded-3xl border border-red-100">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-black text-red-900">Database Update Required</h2>
        <p className="text-red-700">
          The <strong>collections</strong> table is missing in your Supabase database. To manage collections, please run the SQL script below in your Supabase SQL editor.
        </p>
        <div className="bg-white p-4 rounded-xl text-left overflow-x-auto text-sm font-mono border border-red-200">
          <pre>{`CREATE TABLE collections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  slug TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Allow all on collections" ON collections FOR ALL USING (true) WITH CHECK (true);`}</pre>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          I've run the SQL - Reload Page
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Collections</h1>
          <p className="text-zinc-500 mt-1.5">Manage curated product collections for the homepage.</p>
        </div>
        {!isEditing && (
          <Button onClick={handleAddNew} className="rounded-full px-6">
            <Plus className="mr-2 h-4 w-4" /> Add Collection
          </Button>
        )}
      </div>

      {isEditing ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-zinc-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Collection Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border-transparent focus:border-primary focus:bg-white focus:ring-0 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border-transparent focus:border-primary focus:bg-white focus:ring-0 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Slug</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-zinc-50 border-transparent focus:border-primary focus:bg-white focus:ring-0 rounded-xl text-sm"
                      value={formData.slug}
                      placeholder="(auto-generated)"
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Sort Order</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-zinc-50 border-transparent focus:border-primary focus:bg-white focus:ring-0 rounded-xl text-sm"
                      value={formData.sort_order}
                      onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Featured Image</label>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-50 border-2 border-dashed border-zinc-200 group flex items-center justify-center">
                  {formData.image ? (
                    <>
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="outline" className="text-white border-white hover:bg-white/20" onClick={() => document.getElementById('col-img')?.click()}>
                          Change Image
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 cursor-pointer" onClick={() => document.getElementById('col-img')?.click()}>
                      {uploadingImage ? <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-3" /> : <ImageIcon className="w-8 h-8 text-zinc-400 mx-auto mb-3" />}
                      <span className="text-sm font-medium text-zinc-500">{uploadingImage ? 'Uploading...' : 'Click to upload image'}</span>
                    </div>
                  )}
                  <input
                    id="col-img"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-zinc-100">
              <Button type="submit" disabled={loading} className="rounded-full px-8">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Collection
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="rounded-full px-8">
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : collections.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 flex flex-col items-center">
              <LayoutDashboard className="h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-lg font-bold text-zinc-900 mb-1">No collections yet</p>
              <p>Create thematic collections to group your products together.</p>
              <Button variant="outline" className="mt-6 rounded-full" onClick={handleAddNew}>Create First Collection</Button>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {collections.map((col) => (
                <div key={col.id} className="group relative rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 flex flex-col">
                  <div className="aspect-video w-full overflow-hidden relative">
                    {col.image ? (
                      <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-zinc-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-sm" onClick={() => handleEdit(col)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-sm" onClick={() => handleDelete(col.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-5 flex-1">
                    <h3 className="font-bold text-lg text-zinc-900 leading-tight">{col.name}</h3>
                    {col.description && <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{col.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
