import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  category?: string;
  related_products?: string[];
}

const AdminPage = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // form
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
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

  // ambil produk
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

  // tambah / update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataProduct = {
      name,
      description: desc,
      price: parseFloat(price),
      stock: parseInt(stock),
      image_url: image,
      category,
      related_products: relatedProducts, // ✅ simpan produk terkait
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukses",
        description: editingId
          ? "Produk diperbarui"
          : "Produk berhasil ditambahkan",
      });
      resetForm();
      fetchProducts();
    }
  };

  // hapus produk
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

  // edit
  const handleEditProduct = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setDesc(p.description || "");
    setPrice(p.price.toString());
    setStock(p.stock.toString());
    setImage(p.image_url || "");
    setCategory(p.category || "");
    setRelatedProducts(p.related_products || []); // ✅ isi ulang produk terkait
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDesc("");
    setPrice("");
    setStock("");
    setImage("");
    setCategory("");
    setRelatedProducts([]);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Form tambah/update produk */}
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>
            {editingId ? "Update Produk" : "Tambah Produk"}
          </CardTitle>
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

            <div>
              <Label>Nama Produk</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Deskripsi</Label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>

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

            <div>
              <Label>URL Gambar</Label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/gambar.jpg"
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

      {/* List produk */}
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
