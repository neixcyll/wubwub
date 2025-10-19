import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  name: string;
  description?: string;
  long_description?: string;
  price: number;
  stock: number;
  image_url?: string;
  category?: string;
  brand?: string;
  images?: string[];
  specifications?: Record<string, string>;
  variants?: Record<string, string[]>;
  related_products?: string[];
}

const AdminPage = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // form states
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [gallery, setGallery] = useState("");
  const [specs, setSpecs] = useState("");
  const [variants, setVariants] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const categories = [
    { id: "fixie", label: "Fixie" },
    { id: "ban", label: "Ban" },
    { id: "gear", label: "Gear" },
    { id: "frame", label: "Frame" },
    { id: "stang", label: "Stang" },
    { id: "saddle", label: "Saddle" },
  ];

  // Fetch produk dari Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Tambah / Update produk
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataProduct = {
        name,
        description: desc,
        long_description: longDesc || null,
        specifications: specs ? JSON.parse(specs) : null,
        variants: variants ? JSON.parse(variants) : null,
        images: gallery ? gallery.split(",").map((url) => url.trim()) : [],
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url: image,
        category,
        brand,
        related_products: relatedProducts,
      };

      let error;
      if (editingId) {
        ({ error } = await supabase
          .from("products")
          .update(dataProduct)
          .eq("id", editingId));
      } else {
        ({ error } = await supabase.from("products").insert([dataProduct]));
      }

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Sukses",
        description: editingId
          ? "Produk berhasil diperbarui"
          : "Produk berhasil ditambahkan",
      });
      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Gagal menyimpan produk.",
        variant: "destructive",
      });
    }
  };

  // Hapus produk
  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Produk dihapus" });
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  // Edit produk
  const handleEditProduct = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setDesc(p.description || "");
    setLongDesc(p.long_description || "");
    setPrice(p.price.toString());
    setStock(p.stock.toString());
    setImage(p.image_url || "");
    setCategory(p.category || "");
    setBrand(p.brand || "");
    setGallery(p.images?.join(", ") || "");
    setSpecs(p.specifications ? JSON.stringify(p.specifications) : "");
    setVariants(p.variants ? JSON.stringify(p.variants) : "");
    setRelatedProducts(p.related_products || []);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDesc("");
    setLongDesc("");
    setPrice("");
    setStock("");
    setImage("");
    setGallery("");
    setSpecs("");
    setVariants("");
    setCategory("");
    setBrand("");
    setRelatedProducts([]);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Form tambah/update produk */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{editingId ? "Edit Produk" : "Tambah Produk"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Kategori */}
            <div>
              <Label>Kategori</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded-md px-2 py-2 w-full bg-background text-foreground"
                required
              >
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Produk terkait */}
            <div>
              <Label>Produk Terkait</Label>
              <select
                multiple
                value={relatedProducts}
                onChange={(e) =>
                  setRelatedProducts(
                    Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    )
                  )
                }
                className="border rounded-md px-2 py-2 w-full bg-background text-foreground h-32"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Tekan Ctrl (atau Cmd di Mac) untuk memilih lebih dari satu produk.
              </p>
            </div>

            {/* Nama & brand */}
            <div>
              <Label>Nama Produk</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Brand</Label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="contoh: Shimano, FixGear Co"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <Label>Deskripsi Singkat</Label>
              <Input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Deskripsi pendek untuk tampilan grid"
              />
            </div>

            <div>
              <Label>Deskripsi Lengkap</Label>
              <Textarea
                value={longDesc}
                onChange={(e) => setLongDesc(e.target.value)}
                placeholder="Tuliskan deskripsi lengkap produk..."
              />
            </div>

            {/* Gambar utama dan galeri */}
            <div>
              <Label>URL Gambar Utama</Label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/gambar.jpg"
              />
            </div>

            <div>
              <Label>Galeri Gambar (pisahkan koma)</Label>
              <Input
                value={gallery}
                onChange={(e) => setGallery(e.target.value)}
                placeholder="https://img1.jpg, https://img2.jpg"
              />
            </div>
            
            {/* Harga & Stok */}
            <div>
              <Label>Harga</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Stok</Label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingId ? "Update Produk" : "Tambah Produk"}
              </Button>
              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Daftar produk */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Memuat produk...</p>
          ) : products.length === 0 ? (
            <p>Tidak ada produk.</p>
          ) : (
            <div className="space-y-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Kategori: {p.category || "—"} | Rp {p.price} | Stok:{" "}
                      {p.stock}
                    </p>
                    {p.related_products && p.related_products.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Terkait: {p.related_products.length} produk
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(p)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(p.id)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
