/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { StoreCard } from "@/components/common/StoreCard";
import { supabase } from "@/integrations/supabase/client";
import type { Store, Product } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // read query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setSearchQuery(q);
  }, [location.search]);

  // fetch results when query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setStores([]);
        setProducts([]);
        return;
      }

      setLoading(true);

      try {
        const { data: storeData } = await supabase
          .from("stores")
          .select("*")
          // match query in name or description
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

        if (storeData) {
          // map to our Store type (should be compatible)
          setStores(
            storeData.map((s: any) => ({
              id: s.id,
              name: s.name,
              description: s.description ?? "",
              image: s.image ?? "",
              rating: s.rating ?? 0,
              reviewCount: s.review_count ?? 0,
              category: (s.categories && s.categories[0]) || "other",
              location: s.location ?? "",
              isOpen: s.is_open,
              phone: s.phone ?? undefined,
            })),
          );
        }

        const { data: prodData } = await supabase
          .from("products")
          .select("*")
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

        if (prodData) {
          setProducts(
            prodData.map((p: any) => ({
              id: p.id,
              storeId: p.store_id,
              name: p.name,
              description: p.description ?? "",
              price: p.price || 0,
              unit: p.unit ?? "",
              image: p.image ?? "",
              category: p.category ?? "",
              inStock: p.in_stock,
            })),
          );
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <AppLayout>
      {/* Search header */}
      <div className="px-4 pt-safe pt-4 pb-4 bg-background">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Дэлгүүр, бараа хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 h-12 bg-card border-0 shadow-sm rounded-xl"
          />
        </div>
      </div>

      <div className="px-4 pb-32 space-y-6">
        {!searchQuery && (
          <p className="text-center text-muted-foreground mt-10">
            Хайх үгээ бичээд Enter дарна уу
          </p>
        )}

        {loading && (
          <div className="space-y-6">
            {/* Stores Skeleton */}
            <section>
              <Skeleton className="h-6 w-24 mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-card rounded-2xl overflow-hidden shadow-card">
                    <Skeleton className="w-full h-40" />
                    <div className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3 mb-3" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Products Skeleton */}
            <section>
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-card rounded-xl p-3 border border-border flex gap-3 w-full">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-5 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {!loading &&
          searchQuery &&
          stores.length === 0 &&
          products.length === 0 && (
            <p className="text-center text-muted-foreground mt-10">
              Үр дүн олдсонгүй
            </p>
          )}

        {!loading && stores.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">Дэлгүүр</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onClick={() => navigate(`/stores/${store.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {!loading && products.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">
              Бүтээгдэхүүн
            </h2>
            <div className="space-y-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() =>
                    navigate(
                      `/stores/${product.storeId}/products/${product.id}`,
                    )
                  }
                  className="bg-card rounded-xl p-3 border border-border flex gap-3 w-full text-left touch-feedback">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-primary font-bold mt-1">
                      {product.price?.toLocaleString()}₮/{product.unit}
                    </p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
