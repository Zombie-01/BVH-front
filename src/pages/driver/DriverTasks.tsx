import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  Clock,
  ChevronRight,
  Weight,
  Navigation,
  Phone,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryPill } from "@/components/common/CategoryPill";
import { vehicleTypes } from "@/data/driverData";
import { DriverVehicleType } from "@/types";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

const statusConfig = {
  assigned: { label: "Хүлээгдэж байна", color: "bg-warning" },
  picked_up: { label: "Авсан", color: "bg-primary" },
  in_transit: { label: "Явж байна", color: "bg-success" },
  delivered: { label: "Хүргэсэн", color: "bg-muted" },
};

export default function DriverTasks() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState<
    DriverVehicleType | "all"
  >("all");

  type DriverTaskUI = {
    id: string;
    orderId?: string;
    driverId?: string | null;
    pickupLocation: string;
    deliveryLocation: string;
    status: "assigned" | "picked_up" | "in_transit" | "delivered";
    estimatedTime?: number | null;
    distance?: number | null;
    storeName?: string;
    items?: string[];
    weight?: number;
    reward?: number;
    vehicleRequired?: DriverVehicleType | undefined;
  };

  type DeliveryTaskRow = Database["public"]["Tables"]["delivery_tasks"]["Row"];
  type OrderRow = Database["public"]["Tables"]["orders"]["Row"] & {
    order_items?: Database["public"]["Tables"]["order_items"]["Row"][];
  };
  type DeliveryWithOrder = DeliveryTaskRow & { order?: OrderRow | null };

  const [tasks, setTasks] = useState<DriverTaskUI[]>([]);
  const [loading, setLoading] = useState(false);

  // load tasks assigned to driver (and keep realtime subscription)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const res = (await supabase
          .from("delivery_tasks")
          .select(`*, order:orders(id, total_amount, store_id, order_items(*))`)
          .eq("driver_id", profile.id)
          .order("created_at", { ascending: false })) as {
          data: DeliveryWithOrder[] | null;
          error: unknown;
        };

        const data = res.data ?? [];
        if (!mounted) return;
        const mapped: DriverTaskUI[] = data.map((r) => ({
          id: r.id,
          orderId: (r.order_id ?? r.order?.id) as string | undefined,
          driverId: r.driver_id ?? null,
          pickupLocation: (r.pickup_location ?? "") as string,
          deliveryLocation: (r.delivery_location ?? "") as string,
          status: (r.status as DriverTaskUI["status"]) ?? "assigned",
          estimatedTime: (r.estimated_time ?? null) as number | null,
          distance: (r.distance ?? null) as number | null,
          storeName: (r.order?.store_id as string | undefined) ?? undefined,
          items:
            (r.order?.order_items ?? []).map((it) => it.product_name) || [],
          weight: undefined,
          reward: r.order?.total_amount ?? undefined,
          vehicleRequired: undefined,
        }));

        setTasks(mapped);
      } catch (err) {
        console.error("Failed to load delivery tasks:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    if (!profile?.id) return () => {};

    const channel = supabase
      .channel(`delivery-tasks-driver-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "delivery_tasks",
          filter: `driver_id=eq.${profile.id}`,
        },
        (payload: { new: DeliveryWithOrder }) => {
          const n = payload.new;
          setTasks((prev) =>
            prev.some((t) => t.id === n.id)
              ? prev
              : [
                  {
                    id: n.id,
                    orderId: n.order_id ?? n.order?.id,
                    driverId: n.driver_id ?? null,
                    pickupLocation: n.pickup_location ?? "",
                    deliveryLocation: n.delivery_location ?? "",
                    status: (n.status as DriverTaskUI["status"]) ?? "assigned",
                    estimatedTime: n.estimated_time ?? null,
                    distance: n.distance ?? null,
                    storeName: n.order?.store_id ?? undefined,
                    items:
                      (n.order?.order_items ?? []).map(
                        (it) => it.product_name,
                      ) || [],
                    reward: n.order?.total_amount ?? undefined,
                  },
                  ...prev,
                ],
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "delivery_tasks",
          filter: `driver_id=eq.${profile.id}`,
        },
        (payload: { new: DeliveryWithOrder }) => {
          const n = payload.new;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === n.id
                ? {
                    ...t,
                    pickupLocation: n.pickup_location ?? t.pickupLocation,
                    deliveryLocation: n.delivery_location ?? t.deliveryLocation,
                    status: (n.status as DriverTaskUI["status"]) ?? t.status,
                    estimatedTime: n.estimated_time ?? t.estimatedTime,
                    distance: n.distance ?? t.distance,
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

  const filteredTasks = tasks.filter((task) => {
    if (selectedVehicle === "all") return true;
    return task.vehicleRequired === selectedVehicle;
  });

  const activeTasks = filteredTasks.filter((t) => t.status !== "delivered");

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-gradient-to-br from-success via-success to-emerald-600 pt-safe px-4 pb-6">
        <div className="pt-4">
          <p className="text-white/80 text-sm">Өнөөдөр</p>
          <h1 className="text-2xl font-bold text-white">Миний ажлууд</h1>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <span className="text-2xl font-bold text-white">
              {activeTasks.length}
            </span>
            <p className="text-xs text-white/70 mt-1">Идэвхтэй</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <span className="text-2xl font-bold text-white">3</span>
            <p className="text-xs text-white/70 mt-1">Дууссан</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <span className="text-2xl font-bold text-white">₮45K</span>
            <p className="text-xs text-white/70 mt-1">Орлого</p>
          </div>
        </div>
      </header>

      {/* Vehicle Type Filter */}
      <section className="py-4">
        <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide">
          <CategoryPill
            label="Бүгд"
            icon="📦"
            isActive={selectedVehicle === "all"}
            onClick={() => setSelectedVehicle("all")}
          />
          {vehicleTypes.map((vehicle) => (
            <CategoryPill
              key={vehicle.id}
              label={vehicle.label}
              icon={vehicle.icon}
              isActive={selectedVehicle === vehicle.id}
              onClick={() => setSelectedVehicle(vehicle.id)}
            />
          ))}
        </div>
      </section>

      {/* Tasks List */}
      <section className="px-4 pb-6">
        <p className="text-sm text-muted-foreground mb-4">
          {activeTasks.length} ажил олдлоо
        </p>

        <div className="space-y-4">
          {activeTasks.map((task, index) => {
            const status = statusConfig[task.status];
            const vehicle = vehicleTypes.find(
              (v) => v.id === task.vehicleRequired,
            );

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-card rounded-2xl p-4 shadow-card">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                      {vehicle?.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">
                        {task.storeName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        #{task.orderId}
                      </p>
                    </div>
                  </div>
                  <Badge className={cn(status.color, "text-white")}>
                    {status.label}
                  </Badge>
                </div>

                {/* Items */}
                <div className="mt-3 p-3 bg-muted rounded-xl">
                  <p className="text-sm font-medium text-foreground">
                    {task.items.join(", ")}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Weight className="w-4 h-4" />
                      <span className="text-xs">{task.weight}кг</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="w-4 h-4" />
                      <span className="text-xs">{task.distance}км</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">~{task.estimatedTime} мин</span>
                    </div>
                  </div>
                </div>

                {/* Locations */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Package className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Авах</p>
                      <p className="text-sm font-medium text-foreground">
                        {task.pickupLocation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-success-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Хүргэх</p>
                      <p className="text-sm font-medium text-foreground">
                        {task.deliveryLocation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-primary">
                      ₮{task.reward?.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      орлого
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon-sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/tasks/${task.id}`)}>
                      {task.status === "assigned" ? "Авах" : "Дэлгэрэнгүй"}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {activeTasks.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-foreground">Ажил байхгүй</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Одоогоор хүргэлтийн ажил байхгүй байна
            </p>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
