import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/types/product";


const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { cart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch produk dari Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error.message);
        setProducts([]);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Filter produk berdasarkan kategori & pencarian
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        );
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cart.itemCount} onSearchChange={setSearchQuery} />

      <HeroSection />

      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-8">
        {searchQuery && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Menampilkan {filteredProducts.length} hasil untuk "{searchQuery}"
            </p>
          </div>
        )}

        {loading ? (
          <p className="text-center py-10 text-muted-foreground">
            Memuat produk...
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-lg font-semibold mb-2">
                  Tidak ada produk ditemukan
                </h3>
                <p className="text-muted-foreground">
                  Coba ubah kategori atau kata kunci pencarian
                </p>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Index;
