/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronRight,
  Star,
  MapPin,
  TrendingUp,
  Package,
  Truck,
  Wrench as WrenchIcon,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoreCard } from "@/components/common/StoreCard";
import { ServiceWorkerCard } from "@/components/common/ServiceWorkerCard";
import { CategoryPill } from "@/components/common/CategoryPill";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const quickActions = [
  { id: "order", label: "Бараа захиалах", icon: Package, color: "bg-primary" },
  { id: "delivery", label: "Хүргэлт", icon: Truck, color: "bg-success" },
  { id: "service", label: "Үйлчилгээ", icon: WrenchIcon, color: "bg-warning" },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Data will be fetched from Supabase
  const [featuredStores, setFeaturedStores] = useState<any[]>([]);
  const [topWorkers, setTopWorkers] = useState<any[]>([]);

  // categories from Supabase (include "all")
  const [categories, setCategories] = useState<
    { id: string; name: string; icon: string }[]
  >([{ id: "all", name: "Бүгд", icon: "" }]);

  useEffect(() => {
    // Fetch top 3 featured stores
    supabase
      .from("stores")
      .select("*")
      .eq("is_open", true)
      .order("rating", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setFeaturedStores(data);
      });

    // Fetch top 3 available service workers
    supabase
      .from("service_workers")
      .select("*")
      .eq("is_available", true)
      .order("rating", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setTopWorkers(data);
      });

    // load categories
    supabase
      .from("store_categories")
      .select("id,name,icon")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Could not load categories", error);
          return;
        }
        if (data) {
          setCategories([
            { id: "all", name: "Бүгд", icon: "" },
            ...data.map((d: any) => ({
              id: String(d.id),
              name: d.name,
              icon: d.icon,
            })),
          ]);
        }
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        {/* Header */}
        <header className="bg-gradient-to-br from-primary via-primary to-orange-400 pt-safe px-4 pb-6">
          <div className="pt-4 flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Location */}
          <div className="mt-3 flex items-center gap-1">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </header>

        {/* Quick Actions Skeleton */}
        <section className="px-4 -mt-3 max-w-7xl mx-auto">
          <div className="bg-card rounded-2xl shadow-elevated p-4 lg:p-6">
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-3 lg:p-4 rounded-xl">
                  <Skeleton className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Skeleton */}
        <section className="mt-6">
          <div className="px-4 flex items-center justify-between mb-3">
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="h-8 w-20 rounded-full flex-shrink-0"
              />
            ))}
          </div>
        </section>

        {/* Featured Stores Skeleton */}
        <section className="mt-6">
          <div className="px-4 flex items-center justify-between mb-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0">
                <div className="bg-card rounded-2xl p-4 shadow-card w-64">
                  <Skeleton className="w-full h-32 rounded-xl mb-3" />
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

        {/* Top Service Workers Skeleton */}
        <section className="mt-6 px-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-orange-400 pt-safe px-4 pb-6">
        <div className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Сайн байна у|у 👋</p>
            <h1 className="text-xl font-bold text-white">
              {user?.user_metadata?.name ||
                user?.email?.split("@")[0] ||
                "Хэрэглэгч"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline-light" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Дэлгүүр, бараа хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
              }
            }}
            className="pl-12 h-12 bg-white border-0 shadow-lg rounded-xl"
          />
        </div>

        {/* Location */}
        <div className="mt-3 flex items-center gap-1 text-white/80">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {" "}
            {user?.user_metadata?.name ||
              user?.email?.split("@")[0] ||
              "Хэрэглэгч"}
          </span>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="px-4 -mt-3 max-w-7xl mx-auto">
        <div className="bg-card rounded-2xl shadow-elevated p-4 lg:p-6">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (action.id === "order") navigate("/stores");
                    if (action.id === "service") navigate("/services");
                    if (action.id === "delivery") navigate("/orders");
                  }}
                  className="flex flex-col items-center gap-2 p-3 lg:p-4 rounded-xl hover:bg-muted transition-colors">
                  <div
                    className={`w-12 h-12 lg:w-14 lg:h-14 ${action.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <span className="text-xs lg:text-sm font-medium text-foreground">
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-6">
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Ангилал</h2>
        </div>
        <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category) => (
            <CategoryPill
              key={category.id}
              label={category.name}
              icon={category.icon}
              isActive={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </div>
      </section>

      {/* Featured Stores */}
      <section className="mt-6">
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Онцлох дэлгүүрүүд
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/stores")}>
            Бүгд
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide pb-2">
          {featuredStores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}>
              <StoreCard
                store={store}
                variant="featured"
                onClick={() => navigate(`/stores/${store.id}`)}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Service Workers */}
      <section className="mt-6 px-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            Шилдэг мэргэжилтнүүд
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/services")}>
            Бүгд
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {topWorkers.map((worker, index) => (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}>
              <ServiceWorkerCard
                worker={worker}
                variant="compact"
                onClick={() => navigate(`/services/${worker.id}`)}
              />
            </motion.div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
