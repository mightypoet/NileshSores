import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

const sampleProducts = [
  {
    name: "Parker Vector Gold Fountain Pen",
    slug: "parker-vector-gold",
    description: "A classic fountain pen with a gold-plated finish. Smooth writing experience with a durable stainless steel nib.",
    price: 550,
    mrp: 650,
    gstRate: 18,
    sku: "PK-VEC-GLD",
    stock: 50,
    images: ["https://picsum.photos/seed/parker/800/800"],
    categoryId: "pens",
    status: "active"
  },
  {
    name: "Classmate Pulse Spiral Notebook",
    slug: "classmate-pulse-spiral",
    description: "A4 size, 300 pages, single line spiral notebook. High-quality paper for smooth writing.",
    price: 180,
    mrp: 200,
    gstRate: 12,
    sku: "CM-PLS-300",
    stock: 100,
    images: ["https://picsum.photos/seed/notebook1/800/800"],
    categoryId: "notebooks",
    status: "active"
  },
  {
    name: "Faber-Castell 24 Color Pencils",
    slug: "faber-castell-24-colors",
    description: "Vibrant colors, break-resistant lead. Perfect for artists and students alike.",
    price: 350,
    mrp: 400,
    gstRate: 12,
    sku: "FC-COL-24",
    stock: 30,
    images: ["https://picsum.photos/seed/colors/800/800"],
    categoryId: "art",
    status: "active"
  },
  {
    name: "Casio MJ-120D Plus Calculator",
    slug: "casio-mj-120d-plus",
    description: "12-digit desktop calculator with tax calculation and check & correct features.",
    price: 450,
    mrp: 495,
    gstRate: 18,
    sku: "CS-MJ-120D",
    stock: 20,
    images: ["https://picsum.photos/seed/calculator/800/800"],
    categoryId: "office",
    status: "active"
  },
  {
    name: "Staedtler Mars Lumograph Pencils (Set of 6)",
    slug: "staedtler-mars-lumograph",
    description: "Premium quality drawing pencils for writing, drawing, and sketching on paper and matte drawing film.",
    price: 600,
    mrp: 750,
    gstRate: 12,
    sku: "ST-MARS-6",
    stock: 15,
    images: ["https://picsum.photos/seed/pencils/800/800"],
    categoryId: "art",
    status: "active"
  }
];

export default function SeedData() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const productsWithTimestamps = sampleProducts.map(p => ({
        ...p,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('products')
        .insert(productsWithTimestamps);

      if (error) throw error;
      toast.success("Sample data seeded to Supabase successfully!");
    } catch (error) {
      console.error("Seed error:", error);
      toast.error("Failed to seed data to Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSeed} disabled={loading} variant="outline">
      {loading ? "Seeding..." : "Seed Sample Data"}
    </Button>
  );
}
