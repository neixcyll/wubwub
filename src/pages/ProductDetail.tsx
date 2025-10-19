import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
      }
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p>Memuat produk...</p>;

  if (!product)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Produk Tidak Ditemukan</h1>
        <Link to="/">
          <Button>Kembali ke Beranda</Button>
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <img
            src={product.image_url || "/placeholder.png"}
            alt={product.name}
            className="rounded-lg w-full h-96 object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground mb-4">{product.description}</p>
            <p className="text-2xl font-bold mb-6">Rp {product.price}</p>
            <Button>Tambah ke Keranjang</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
