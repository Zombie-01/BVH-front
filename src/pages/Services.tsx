import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServiceWorkerCard } from "@/components/common/ServiceWorkerCard";
import { CategoryPill } from "@/components/common/CategoryPill";
import { mockServiceWorkers, serviceCategories } from "@/data/mockData";

export default function Services() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filteredWorkers = mockServiceWorkers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = !showAvailableOnly || worker.isAvailable;
    const selectedCategory = serviceCategories.find(
      (c) => c.id === activeCategory
    );
    const matchesCategory =
      activeCategory === "all" ||
      worker.specialty === selectedCategory?.specialty;
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
          {serviceCategories.map((category) => (
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
