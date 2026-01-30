import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Search, Edit, Trash2, Filter } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductModal } from "@/components/modals/ProductModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type {
  Database,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  inStock: boolean;
}

export default function OwnerProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [productCategories, setProductCategories] = useState<string[]>(["all"]);
  const categories = productCategories;

  // Fetch owner's store and products
  const fetchStoreAndProducts = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data: storeData, error: storeErr } = await supabase
        .from("stores")
        .select("id, categories")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (storeErr) throw storeErr;
      const storeRow = storeData as
        | Database["public"]["Tables"]["stores"]["Row"]
        | null;
      const sid = storeRow?.id ?? null;
      setStoreId(sid);

      if (sid) {
        const { data: prods, error: prodErr } = await supabase
          .from("products")
          .select("*")
          .eq("store_id", sid)
          .order("created_at", { ascending: false });
        if (prodErr) throw prodErr;
        if (prods) {
          setProducts(
            prods.map((p: Database["public"]["Tables"]["products"]["Row"]) => ({
              id: p.id,
              name: p.name,
              description: p.description ?? "",
              price: p.price ?? 0,
              unit: p.unit ?? "",
              category: p.category ?? "",
              image: p.image ?? "",
              inStock: !!p.in_stock,
            })) as Product[],
          );
        }

        // Use categories from the stores table only
        if (Array.isArray(storeRow?.categories) && storeRow.categories.length) {
          setProductCategories(["all", ...storeRow.categories.filter(Boolean)]);
        } else {
          setProductCategories(["all"]);
        }
      } else {
        setProducts([]);
        setProductCategories(["all"]);
      }
    } catch (err) {
      console.error("Error fetching store/products:", err);
      toast.error("Бараа/дэлгүүр татахад алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };
  // load on mount and when user changes
  useEffect(() => {
    fetchStoreAndProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="px-4 py-6 max-w-7xl mx-auto">Татаж байна...</div>
      </AppLayout>
    );
  }

  if (!storeId) {
    return (
      <AppLayout>
        <div className="px-4 py-6 max-w-7xl mx-auto">
          Дэлгүүрийн мэдээлэл олдсонгүй
        </div>
      </AppLayout>
    );
  }

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  // Create or update product in Supabase
  const handleSaveProduct = async (
    productData: Omit<Product, "id"> & { id?: string },
  ) => {
    if (!storeId) {
      toast.error("Дэлгүүрийн мэдээлэл олдсонгүй");
      return;
    }

    try {
      if (productData.id) {
        // Update existing product
        const updateVals = {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          unit: productData.unit,
          category: productData.category,
          image: productData.image,
          in_stock: productData.inStock,
          updated_at: new Date().toISOString(),
        } as TablesUpdate<"products">;

        const result = await supabase
          .from("products")
          .update(updateVals as unknown as never)
          .eq("id", productData.id)
          .select()
          .maybeSingle();
        const data = result.data as
          | Database["public"]["Tables"]["products"]["Row"]
          | null;
        const error = result.error;
        if (error) throw error;
        if (data) {
          // Do not create or modify categories here — categories come only from `stores.categories`.
          // We accept the updated product.category but do not change store categories.

          setProducts((prev) =>
            prev.map((p) =>
              p.id === data.id
                ? ({
                    id: data.id,
                    name: data.name,
                    description: data.description ?? "",
                    price: data.price ?? 0,
                    unit: data.unit ?? "",
                    category: data.category ?? "",
                    image: data.image ?? "",
                    inStock: !!data.in_stock,
                  } as Product)
                : p,
            ),
          );
          toast.success("Бараа амжилттай шинэчлэгдлээ");
        }
      } else {
        // Add new product
        const insertVals = {
          store_id: storeId,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          unit: productData.unit,
          category: productData.category,
          image: productData.image,
          in_stock: productData.inStock,
          created_at: new Date().toISOString(),
        } as TablesInsert<"products">;

        const result = await supabase
          .from("products")
          .insert(insertVals as unknown as never)
          .select()
          .maybeSingle();
        const data = result.data as
          | Database["public"]["Tables"]["products"]["Row"]
          | null;
        const error = result.error;
        if (error) throw error;
        if (data) {
          const newProduct: Product = {
            id: data.id,
            name: data.name,
            description: data.description ?? "",
            price: data.price ?? 0,
            unit: data.unit ?? "",
            category: data.category ?? "",
            image: data.image ?? "",
            inStock: !!data.in_stock,
          };

          // No category creation or modification on this page — categories come only from `stores.categories`
          // (We still accept the product category value but do not modify store categories.)

          setProducts((prev) => [newProduct, ...prev]);
          toast.success("Шинэ бараа амжилттай нэмэгдлээ");
        }
      }
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("Бараа хадгалахдаа алдаа гарлаа");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct?.id) return;
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", selectedProduct.id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      toast.success("Бараа амжилттай устгагдлаа");
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Бараа устгахад алдаа гарлаа");
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-card border-b border-border pt-safe px-4 pb-4">
        <div className="pt-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Бүтээгдэхүүн
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {products.length} бүтээгдэхүүн • {inStockCount} нөөцтэй
              </p>
            </div>
            <Button onClick={handleAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Нэмэх
            </Button>
          </div>

          {/* Search & Filter */}
          <div className="mt-4 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Бараа хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted border-0"
              />
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="px-4 py-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 text-center shadow-card">
            <span className="text-xl font-bold text-foreground">
              {products.length}
            </span>
            <p className="text-xs text-muted-foreground">Нийт бараа</p>
          </div>
          <div className="bg-success/10 rounded-xl p-3 text-center">
            <span className="text-xl font-bold text-success">
              {inStockCount}
            </span>
            <p className="text-xs text-muted-foreground">Нөөцтэй</p>
          </div>
          <div className="bg-destructive/10 rounded-xl p-3 text-center">
            <span className="text-xl font-bold text-destructive">
              {outOfStockCount}
            </span>
            <p className="text-xs text-muted-foreground">Дууссан</p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 pb-4 max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              className="cursor-pointer whitespace-nowrap px-4 py-2"
              onClick={() => setSelectedCategory(category)}>
              {category === "all" ? "Бүгд" : category}
            </Badge>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 pb-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.03 * index }}
              className="bg-card rounded-2xl overflow-hidden shadow-card group">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    size="icon-sm"
                    variant="secondary"
                    onClick={() => handleEditProduct(product)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    onClick={() => handleDeleteClick(product)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div
                  className={cn(
                    "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium",
                    product.inStock
                      ? "bg-success text-success-foreground"
                      : "bg-destructive text-destructive-foreground",
                  )}>
                  {product.inStock ? "Нөөцтэй" : "Дууссан"}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-primary">
                      {product.price?.toLocaleString()}₮
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      /{product.unit}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-foreground">Бараа олдсонгүй</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Хайлтад тохирох бараа байхгүй байна
            </p>
          </div>
        )}
      </section>

      {/* Product Modal */}
      <ProductModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
        categories={categories.filter((c) => c !== "all")}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Бараа устгах"
        description={`"${selectedProduct?.name}" барааг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.`}
        onConfirm={handleDeleteConfirm}
      />
    </AppLayout>
  );
}
