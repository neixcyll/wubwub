import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Truck, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  };
}

const Checkout = () => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [shippingMethod, setShippingMethod] = useState("regular");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  // Ambil user login
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        toast({
          title: "Belum login",
          description: "Silakan login terlebih dahulu untuk melanjutkan checkout.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      setUserId(data.user.id);
    };
    fetchUser();
  }, []);

  // Ambil data keranjang dari Supabase
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, products(*)")
        .eq("user_id", userId);

      if (error) {
        console.error("Gagal memuat cart:", error.message);
        toast({
          title: "Gagal memuat keranjang",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setCartItems(data || []);
      }
      setLoading(false);
    };

    fetchCart();
  }, [userId]);

  const shippingCost = shippingMethod === "express" ? 25000 : 0;
  const subtotal = cartItems.reduce(
    (total, item) => total + item.products.price * item.quantity,
    0
  );
  const totalWithShipping = subtotal + shippingCost;

  const handleSubmitOrder = async () => {
    if (!userId || cartItems.length === 0) {
      toast({
        title: "Tidak bisa membuat pesanan",
        description: "Keranjang kosong atau user belum login.",
        variant: "destructive",
      });
      return;
    }

    // Simpan data pesanan ke tabel orders (opsional)
    const { error } = await supabase.from("orders").insert([
      {
        user_id: userId,
        total_price: totalWithShipping,
        status: "pending",
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        created_at: new Date(),
      },
    ]);

    if (error) {
      toast({
        title: "Gagal membuat pesanan",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pesanan berhasil dibuat!",
        description: "Terima kasih telah berbelanja di FixieStore.",
      });

      // Opsional: hapus isi keranjang setelah checkout
      await supabase.from("cart_items").delete().eq("user_id", userId);
      setCartItems([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Keranjang
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Alamat */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Alamat Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nama Depan</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nama Belakang</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input id="phone" placeholder="08123456789" />
                </div>
                <div>
                  <Label htmlFor="address">Alamat Lengkap</Label>
                  <Textarea
                    id="address"
                    placeholder="Jalan, Nomor Rumah, RT/RW"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Kota</Label>
                    <Input id="city" placeholder="Jakarta" />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Kode Pos</Label>
                    <Input id="postalCode" placeholder="12345" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metode Pengiriman */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Metode Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="regular" id="regular" />
                    <Label htmlFor="regular" className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Pengiriman Reguler</p>
                          <p className="text-sm text-muted-foreground">
                            5-7 hari kerja
                          </p>
                        </div>
                        <span className="font-medium text-green-600">GRATIS</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Pengiriman Express</p>
                          <p className="text-sm text-muted-foreground">
                            1-2 hari kerja
                          </p>
                        </div>
                        <span className="font-medium">
                          {formatPrice(25000)}
                        </span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Metode Pembayaran */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Metode Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                      <p className="font-medium">Transfer Bank</p>
                      <p className="text-sm text-muted-foreground">
                        BCA, Mandiri, BNI, BRI
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="ewallet" id="ewallet" />
                    <Label htmlFor="ewallet" className="flex-1 cursor-pointer">
                      <p className="font-medium">E-Wallet</p>
                      <p className="text-sm text-muted-foreground">
                        GoPay, OVO, DANA, ShopeePay
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <p className="font-medium">Bayar di Tempat (COD)</p>
                      <p className="text-sm text-muted-foreground">
                        Bayar saat barang diterima
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Ringkasan Pesanan */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Tidak ada produk di keranjang.
                    </p>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.products.image_url || "/placeholder.png"}
                          alt={item.products.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {item.products.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} ×{" "}
                            {formatPrice(item.products.price)}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          {formatPrice(
                            item.products.price * item.quantity
                          )}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span>
                      {shippingCost === 0
                        ? "GRATIS"
                        : formatPrice(shippingCost)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(totalWithShipping)}
                  </span>
                </div>

                <Button
                  onClick={handleSubmitOrder}
                  className="w-full"
                  size="lg"
                >
                  Buat Pesanan
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Dengan membuat pesanan, Anda menyetujui syarat dan ketentuan
                  kami
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
