import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Navigation,
  MapPin,
  Package,
  Clock,
  ChevronUp,
  Phone,
  MessageCircle,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { vehicleTypes } from "@/data/driverData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function DriverMap() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { profile } = useAuth();

  type DeliveryTaskRow = Database["public"]["Tables"]["delivery_tasks"]["Row"];
  type OrderRow = Database["public"]["Tables"]["orders"]["Row"] & {
    order_items?: Database["public"]["Tables"]["order_items"]["Row"][];
  };
  type DeliveryWithOrder = DeliveryTaskRow & { order?: OrderRow | null };

  type DriverTaskUI = {
    id: string;
    orderId?: string;
    pickupLocation: string;
    deliveryLocation: string;
    deliveryLat?: number;
    deliveryLng?: number;
    status: "assigned" | "picked_up" | "in_transit" | "delivered";
    estimatedTime?: number | null;
    distance?: number | null;
    storeName?: string;
    customerName?: string;
    reward?: number;
    vehicleRequired?: string | undefined;
  };

  const [tasks, setTasks] = useState<DriverTaskUI[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const res = (await supabase
          .from("delivery_tasks")
          .select(
            `*, order:orders(id, total_amount, store_id, user_id, delivery_lat, delivery_lng, delivery_address)`,
          )
          .eq("driver_id", profile.id)
          .order("created_at", { ascending: false })) as {
          data: DeliveryWithOrder[] | null;
          error: unknown;
        };

        const data = res.data ?? [];
        if (!mounted) return;
        const mapped: DriverTaskUI[] = data.map((r) => ({
          id: r.id,
          orderId: r.order_id ?? r.order?.id,
          pickupLocation: r.pickup_location ?? "",
          deliveryLocation:
            r.delivery_location ?? r.order?.delivery_address ?? "",
          deliveryLat: r.order?.delivery_lat
            ? Number(r.order.delivery_lat)
            : undefined,
          deliveryLng: r.order?.delivery_lng
            ? Number(r.order.delivery_lng)
            : undefined,
          status: (r.status as DriverTaskUI["status"]) ?? "assigned",
          estimatedTime: r.estimated_time ?? null,
          distance: r.distance ?? null,
          storeName: r.order?.store_id ?? undefined,
          customerName: undefined,
          reward: r.order?.total_amount ?? undefined,
          vehicleRequired: undefined,
        }));

        setTasks(mapped);
      } catch (err) {
        console.error("Failed to load delivery tasks (map):", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    if (!profile?.id) return () => {};
    const channel = supabase
      .channel(`delivery-map-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "delivery_tasks",
          filter: `driver_id=eq.${profile.id}`,
        },
        (p: { new: DeliveryWithOrder }) => {
          const n = p.new;
          setTasks((prev) =>
            prev.some((t) => t.id === n.id)
              ? prev
              : [
                  {
                    id: n.id,
                    orderId: n.order_id ?? n.order?.id,
                    pickupLocation: n.pickup_location ?? "",
                    deliveryLocation:
                      n.delivery_location ?? n.order?.delivery_address ?? "",
                    deliveryLat: n.order?.delivery_lat
                      ? Number(n.order.delivery_lat)
                      : undefined,
                    deliveryLng: n.order?.delivery_lng
                      ? Number(n.order.delivery_lng)
                      : undefined,
                    status: (n.status as DriverTaskUI["status"]) ?? "assigned",
                    estimatedTime: n.estimated_time ?? null,
                    distance: n.distance ?? null,
                    storeName: n.order?.store_id ?? undefined,
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
        (p: { new: DeliveryWithOrder }) => {
          const n = p.new;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === n.id
                ? {
                    ...t,
                    pickupLocation: n.pickup_location ?? t.pickupLocation,
                    deliveryLocation:
                      n.delivery_location ??
                      n.order?.delivery_address ??
                      t.deliveryLocation,
                    deliveryLat: n.order?.delivery_lat
                      ? Number(n.order.delivery_lat)
                      : t.deliveryLat,
                    deliveryLng: n.order?.delivery_lng
                      ? Number(n.order.delivery_lng)
                      : t.deliveryLng,
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

  const activeTask = tasks.find((t) => t.status === "picked_up") || tasks[0];
  const vehicle = vehicleTypes.find(
    (v) => v.id === activeTask?.vehicleRequired,
  );

  return (
    <>
      {isFullScreen ? (
        // Full-screen map view
        <div className="fixed inset-0 z-50 bg-background">
          <MapContainer
            center={
              activeTask?.deliveryLat && activeTask?.deliveryLng
                ? [activeTask.deliveryLat, activeTask.deliveryLng]
                : [47.9185, 106.9176]
            }
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            className="rounded-none">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Pickup Location Marker */}
            {activeTask?.pickupLocation && (
              <Marker position={[47.9185, 106.9176]}>
                <Popup>
                  <div className="text-center">
                    <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="font-semibold">Авах газар</p>
                    <p className="text-sm text-muted-foreground">
                      {activeTask.pickupLocation}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Delivery Location Marker */}
            {activeTask?.deliveryLat && activeTask?.deliveryLng && (
              <Marker
                position={[activeTask.deliveryLat, activeTask.deliveryLng]}>
                <Popup>
                  <div className="text-center">
                    <MapPin className="w-6 h-6 mx-auto mb-2 text-success" />
                    <p className="font-semibold">Хүргэх газар</p>
                    <p className="text-sm text-muted-foreground">
                      {activeTask.deliveryLocation}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Exit full-screen button */}
          <div className="absolute top-4 right-4 z-[1000]">
            <Button
              variant="default"
              size="icon"
              onClick={() => setIsFullScreen(false)}
              className="shadow-lg bg-card hover:bg-card/80">
              <ChevronUp className="w-5 h-5 rotate-45" />
            </Button>
          </div>
        </div>
      ) : (
        // Normal view with AppLayout
        <AppLayout>
          {/* OSM Map */}
          <div className="h-full flex flex-col justify-between">
            <div className="relative h-full">
              <MapContainer
                center={
                  activeTask?.deliveryLat && activeTask?.deliveryLng
                    ? [activeTask.deliveryLat, activeTask.deliveryLng]
                    : [47.9185, 106.9176]
                } // Default center on Ulaanbaatar or use delivery location
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                className="rounded-none">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Pickup Location Marker */}
                {activeTask?.pickupLocation && (
                  <Marker position={[47.9185, 106.9176]}>
                    <Popup>
                      <div className="text-center">
                        <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="font-semibold">Авах газар</p>
                        <p className="text-sm text-muted-foreground">
                          {activeTask.pickupLocation}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Delivery Location Marker */}
                {activeTask?.deliveryLat && activeTask?.deliveryLng && (
                  <Marker
                    position={[activeTask.deliveryLat, activeTask.deliveryLng]}>
                    <Popup>
                      <div className="text-center">
                        <MapPin className="w-6 h-6 mx-auto mb-2 text-success" />
                        <p className="font-semibold">Хүргэх газар</p>
                        <p className="text-sm text-muted-foreground">
                          {activeTask.deliveryLocation}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>

              {/* Navigation Button - now toggles full-screen */}
              <div className="absolute top-safe right-4 pt-4 z-[1000]">
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => setIsFullScreen(true)}
                  className="shadow-lg">
                  <Navigation className="w-5 h-5" />
                </Button>
              </div>

              {/* Route Info */}
              <div className="absolute top-safe left-4 pt-4 z-[1000]">
                <div className="bg-card rounded-xl shadow-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-success-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Хүрэх хугацаа
                      </p>
                      <p className="font-bold text-foreground">
                        {activeTask?.estimatedTime} мин
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sheet */}
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? "400px" : "150px" }}
              className="bg-card absolute left-0 right-0  z-[10000] rounded-t-3xl bottom-0 -mt-6 shadow-elevated overflow-hidden">
              {/* Handle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-3 flex justify-center">
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              </button>

              <div className="px-4 pb-6">
                {activeTask && (
                  <>
                    {/* Current Task */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                        {vehicle?.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">
                          {activeTask.storeName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {activeTask.customerName} руу хүргэх
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          ₮{activeTask.reward?.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activeTask.distance}км
                        </p>
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">
                            Авах газар
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {activeTask.pickupLocation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-success/10 rounded-xl border-2 border-success">
                        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-success-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-success">Хүргэх газар</p>
                          <p className="text-sm font-medium text-foreground">
                            {activeTask.deliveryLocation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-3">
                      <Button variant="outline" size="lg" className="flex-1">
                        <Phone className="w-5 h-5" />
                        Залгах
                      </Button>
                      <Button variant="outline" size="lg" className="flex-1">
                        <MessageCircle className="w-5 h-5" />
                        Чат
                      </Button>
                    </div>

                    <Button variant="hero" size="xl" className="w-full mt-4">
                      {activeTask.status === "assigned"
                        ? "Захиалга авах"
                        : activeTask.status === "picked_up"
                        ? "Хүргэлт эхлүүлэх"
                        : "Хүргэсэн гэж тэмдэглэх"}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </AppLayout>
      )}
    </>
  );
}
