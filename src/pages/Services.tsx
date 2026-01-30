import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServiceWorkerCard } from "@/components/common/ServiceWorkerCard";
import { CategoryPill } from "@/components/common/CategoryPill";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { ServiceWorker } from "@/types";

export default function Services() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const [workers, setWorkers] = useState<ServiceWorker[]>([]);
  const [categories, setCategories] = useState<
    Array<{ id: string; label: string }>
  >([]);

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const { data: workerRows } = (await supabase
          .from("service_workers")
          .select("*")
          .order("rating", { ascending: false })) as {
          data: Database["public"]["Tables"]["service_workers"]["Row"][] | null;
          error: unknown;
        };

        const rows = workerRows ?? [];
        const profileIds = Array.from(
          new Set(rows.map((r) => r.profile_id).filter(Boolean)),
        );
        const { data: profiles } = profileIds.length
          ? ((await supabase
              .from("profiles")
              .select("id, name, avatar, phone")
              .in("id", profileIds as string[])) as {
              data: Database["public"]["Tables"]["profiles"]["Row"][] | null;
              error: unknown;
            })
          : {
              data: [] as
                | Database["public"]["Tables"]["profiles"]["Row"][]
                | null,
            };

        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

        const mapped = rows.map((r) => ({
          id: r.id,
          name: profileMap.get(r.profile_id ?? "")?.name ?? "Мэргэжилтэн",
          avatar: profileMap.get(r.profile_id ?? "")?.avatar ?? "",
          specialty: r.specialty,
          rating: r.rating ?? 0,
          completedJobs: r.completed_jobs ?? 0,
          badges: r.badges ?? [],
          hourlyRate: r.hourly_rate ?? 0,
          isAvailable: r.is_available,
          phone: profileMap.get(r.profile_id ?? "")?.phone ?? undefined,
          description: r.description ?? undefined,
        }));

        setWorkers(mapped);

        const uniq = Array.from(
          new Set(rows.map((r) => r.specialty).filter(Boolean)),
        );
        const cats = [
          { id: "all", label: "Бүгд" },
          ...uniq.map((s) => ({ id: s, label: s })),
        ];
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load workers:", err);
      }
    };

    loadWorkers();
  }, []);

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = !showAvailableOnly || worker.isAvailable;
    const matchesCategory =
      activeCategory === "all" || worker.specialty === activeCategory;
    return matchesSearch && matchesAvailability && matchesCategory;
  });

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-card border-b border-border pt-safe">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-4">
          <div className="pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Үйлчилгээ
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Мэргэжлийн ажилчин олоорой
              </p>
            </div>

            {/* Search */}
            <div className="flex gap-2 md:w-96">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Мэргэжилтэн хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-muted border-0"
                />
              </div>
              <Button variant="outline" size="icon" className="h-11 w-11">
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant={showAvailableOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}>
              Чөлөөтэй
            </Button>
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
              isActive={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </div>
      </section>

      {/* Workers List */}
      <section className="px-4 lg:px-6 pb-6 max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground mb-4">
          {filteredWorkers.length} мэргэжилтэн олдлоо
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredWorkers.map((worker, index) => (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * Math.min(index, 8) }}>
              <ServiceWorkerCard
                worker={worker}
                onClick={() => navigate(`/services/${worker.id}`)}
              />
            </motion.div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
