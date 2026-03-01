import { motion } from "framer-motion";
import { CheckCircle, Star, MapPin, Calendar } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

export default function DriverCompleted() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<
    {
      id: string;
      orderId?: string;
      storeName?: string;
      customerName?: string;
      deliveryLocation?: string;
      completedAt: Date;
      reward?: number;
      rating?: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    type DeliveryTaskRow =
      Database["public"]["Tables"]["delivery_tasks"]["Row"];
    type OrderRow = Database["public"]["Tables"]["orders"]["Row"] & {
      user?: Database["public"]["Tables"]["profiles"]["Row"];
      store?: Database["public"]["Tables"]["stores"]["Row"];
    };
    type DeliveryWithOrder = DeliveryTaskRow & { order?: OrderRow | null };

    const load = async () => {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const res = (await supabase
          .from("delivery_tasks")
          .select(
            `*, order:orders(id, total_amount, user:profiles(id,name), store:stores(id,name))`,
          )
          .eq("driver_id", profile.id)
          .eq("status", "delivered")
          .order("updated_at", { ascending: false })) as {
          data: DeliveryWithOrder[] | null;
          error: unknown;
        };

        const rows = res.data ?? [];
        if (!mounted) return;
        const mapped = rows.map((r) => ({
          id: r.id,
          orderId: r.order_id ?? r.order?.id,
          storeName:
            r.order?.store?.name ??
            (r.order?.store_id as string | undefined) ??
            "",
          customerName:
            r.order?.user?.name ??
            (r.order?.user_id as string | undefined) ??
            "",
          deliveryLocation: r.delivery_location ?? "",
          completedAt: r.updated_at
            ? new Date(r.updated_at)
            : r.created_at
              ? new Date(r.created_at)
              : new Date(),
          reward: r.order?.total_amount ?? undefined,
          rating: 0,
        }));

        setTasks(mapped);
      } catch (err) {
        console.error("Failed to load completed delivery tasks:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    if (!profile?.id) return () => {};
    const channel = supabase
      .channel(`driver-completed-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "delivery_tasks",
          filter: `driver_id=eq.${profile.id}&status=eq.delivered`,
        },
        (p: { new: DeliveryWithOrder }) => {
          const n = p.new;
          setTasks((prev) => [
            {
              id: n.id,
              orderId: n.order_id ?? n.order?.id,
              storeName: n.order?.store?.name ?? "",
              customerName: n.order?.user?.name ?? "",
              deliveryLocation: n.delivery_location ?? "",
              completedAt: n.updated_at ? new Date(n.updated_at) : new Date(),
              reward: n.order?.total_amount ?? undefined,
              rating: 0,
            },
            ...prev,
          ]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "delivery_tasks",
          filter: `driver_id=eq.${profile.id}&status=eq.delivered`,
        },
        (p: { new: DeliveryWithOrder }) => {
          const n = p.new;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === n.id
                ? {
                    ...t,
                    deliveryLocation: n.delivery_location ?? t.deliveryLocation,
                    completedAt: n.updated_at
                      ? new Date(n.updated_at)
                      : t.completedAt,
                    reward: n.order?.total_amount ?? t.reward,
                  }
                : t,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      try {
        channel.unsubscribe();
      } catch (e) {
        /* ignore */
      }
    };
  }, [profile?.id]);

  const groupedTasks = tasks.reduce(
    (acc, task) => {
      const date = task.completedAt.toLocaleDateString("mn-MN");
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
      return acc;
    },
    {} as Record<string, typeof tasks>,
  );

  const total = tasks.length;
  const avgRating = total
    ? +(tasks.reduce((s, t) => s + (t.rating ?? 0), 0) / total).toFixed(1)
    : 0;

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-card border-b border-border pt-safe px-4 pb-4">
        <div className="pt-4">
          <h1 className="text-2xl font-bold text-foreground">
            Дууссан хүргэлтүүд
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Амжилттай хүргэсэн захиалгууд
          </p>
        </div>

        {/* Summary */}
        <div className="mt-4 flex gap-4">
          <div className="flex-1 bg-success/10 rounded-xl p-3 text-center">
            <span className="text-2xl font-bold text-success">{total}</span>
            <p className="text-xs text-muted-foreground mt-1">Нийт хүргэлт</p>
          </div>
          <div className="flex-1 bg-accent/10 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-accent fill-accent" />
              <span className="text-2xl font-bold text-foreground">
                {avgRating || "-"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Дундаж үнэлгээ</p>
          </div>
        </div>
      </header>

      {/* Completed Tasks */}
      <section className="px-4 py-4">
        {Object.entries(groupedTasks).map(([date, tasks]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {date}
              </span>
            </div>

            <div className="space-y-3">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">
                          {task.storeName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {task.customerName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-success">
                        +₮{task.reward?.toLocaleString()}
                      </span>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < task.rating
                                ? "text-accent fill-accent"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{task.deliveryLocation}</span>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {task.completedAt.toLocaleTimeString("mn-MN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </AppLayout>
  );
}
