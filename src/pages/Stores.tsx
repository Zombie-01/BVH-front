import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Filter, MapPin } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StoreCard } from "@/components/common/StoreCard";
import { CategoryPill } from "@/components/common/CategoryPill";
import { categories } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Store } from "@/types"; // App shape for UI components

export default function Stores() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("stores").select("*");
      if (!mounted) return;
      const rows = (data ??
        []) as Database["public"]["Tables"]["stores"]["Row"][];
      const mapped: Store[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description ?? "",
        image: r.image ?? "",
        rating: r.rating ?? 0,
        reviewCount: r.review_count ?? 0,
        category: (r.categories && r.categories[0]) || "other",
        location: r.location ?? "",
        isOpen: r.is_open,
        phone: r.phone ?? undefined,
      }));
      setStores(mapped);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || store.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-card border-b border-border pt-safe">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-4">
          <div className="pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Дэлгүүрүүд
              </h1>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Улаанбаатар</span>
              </div>
            </div>

            {/* Search */}
            <div className="flex gap-2 md:w-96">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Дэлгүүр хайх..."
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
        </div>
      </header>

      {/* Categories */}
      <section className="py-4 max-w-7xl mx-auto">
        <div className="flex gap-2 px-4 lg:px-6 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <CategoryPill
              key={category.id}
              label={category.label}
              icon={category.icon}
              isActive={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </div>
      </section>

      {/* Stores Grid */}
      <section className="px-4 lg:px-6 pb-6 max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground mb-4">
          {filteredStores.length} дэлгүүр олдлоо
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * Math.min(index, 8) }}>
              <StoreCard
                store={store}
                onClick={() => navigate(`/stores/${store.id}`)}
              />
            </motion.div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
