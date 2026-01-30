/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MessageCircle,
  ChevronRight,
  MapPin,
  Phone,
  XCircle,
  Plus,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderDetailModal } from "@/components/modals/OrderDetailModal";
import { OrderModal } from "@/components/modals/OrderModal";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

interface OwnerOrder {
  id: string;
  customer: {
    id?: string | null;
    name?: string | null;
    avatar?: string | null;
    phone?: string | null;
  };
  items: { name: string; quantity: number; price: number }[];
  status: OrderStatus;
  totalAmount: number | null;
  deliveryAddress: string | null;
  createdAt: string | null;
  driver?: { id?: string | null; name?: string | null; phone?: string | null };
}

// Supabase-backed orders (initially empty)

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  negotiating: {
    label: "Тохиролцож байна",
    color: "bg-warning",
    icon: MessageCircle,
  },
  pending: { label: "Хүлээгдэж байна", color: "bg-warning", icon: Clock },
  confirmed: { label: "Баталгаажсан", color: "bg-primary", icon: CheckCircle },
  in_progress: { label: "Хүргэж байна", color: "bg-success", icon: Truck },
  completed: { label: "Дууссан", color: "bg-muted", icon: CheckCircle },
  cancelled: { label: "Цуцлагдсан", color: "bg-destructive", icon: XCircle },
};

type FilterType = "all" | "active" | "completed";

export default function OwnerOrders() {
  const { user, profile } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");
  const [orders, setOrders] = useState<OwnerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OwnerOrder | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // load orders for owner's stores
  useEffect(() => {
    async function loadOrders() {
      const ownerId = profile?.id ?? user?.id;
      if (!ownerId) return;
      setIsLoading(true);
      try {
        // find stores owned by the user
        const { data: stores } = await supabase
          .from("stores")
          .select("id")
          .eq("owner_id", ownerId);
        const storeRows = (stores ??
          []) as Database["public"]["Tables"]["stores"]["Row"][];
        const storeIds = storeRows.map((s) => s.id);
        if (!storeIds.length) {
          setOrders([]);
          return;
        }

        // fetch orders for those stores
        const { data: orderRows, error: ordersErr } = await supabase
          .from("orders")
          .select("*")
          .in("store_id", storeIds)
          .order("created_at", { ascending: false });
        if (ordersErr) throw ordersErr;
        const rows = (orderRows ??
          []) as Database["public"]["Tables"]["orders"]["Row"][];
        const orderIds = rows.map((r) => r.id);

        // fetch items
        const { data: items } = await supabase
          .from("order_items")
          .select("order_id, product_name, quantity, price")
          .in("order_id", orderIds);
        const itemsRows = (items ??
          []) as Database["public"]["Tables"]["order_items"]["Row"][];

        // fetch customer profiles
        const userIds = Array.from(
          new Set(rows.map((r) => r.user_id).filter(Boolean)),
        );
        const { data: profiles } = (await supabase
          .from("profiles")
          .select("id, name, avatar, phone")
          .in("id", userIds as string[])) as {
          data: Database["public"]["Tables"]["profiles"]["Row"][] | null;
          error: any;
        };

        // fetch driver profiles
        const driverIds = Array.from(
          new Set(rows.map((r) => r.driver_id).filter(Boolean)),
        );
        const { data: drivers } = (await supabase
          .from("profiles")
          .select("id, name, avatar, phone")
          .in("id", driverIds as string[])) as {
          data: Database["public"]["Tables"]["profiles"]["Row"][] | null;
          error: any;
        };

        const mapped: OwnerOrder[] = rows.map((r: any) => {
          const relatedItems = itemsRows
            .filter((it) => it.order_id === r.id)
            .map((it) => ({
              name: it.product_name,
              quantity: it.quantity,
              price: it.price,
            }));
          const customer =
            (profiles ?? []).find((p: any) => p.id === r.user_id) ?? null;
          const driver =
            (drivers ?? []).find((d: any) => d.id === r.driver_id) ?? null;

          return {
            id: r.id,
            customer: {
              id: r.user_id ?? null,
              name: customer?.name ?? null,
              avatar: customer?.avatar ?? null,
              phone: customer?.phone ?? null,
            },
            items: relatedItems,
            status: r.status as OrderStatus,
            totalAmount: r.total_amount ?? null,
            deliveryAddress: r.delivery_address ?? null,
            createdAt: r.created_at ?? null,
            driver: driver
              ? { id: driver.id, name: driver.name, phone: driver.phone }
              : undefined,
          };
        });

        setOrders(mapped);
      } catch (err) {
        console.error("Failed to load orders:", err);
        toast.error("Захиалга татахад алдаа гарлаа");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [user, profile?.id]);

  const handleCreateOrder = async (orderData: {
    customer: { name: string; phone: string };
    items: { name: string; quantity: number; price: number }[];
    status: OrderStatus;
    deliveryAddress: string;
    notes?: string;
  }) => {
    try {
      const ownerId = profile?.id ?? user?.id;
      if (!ownerId) throw new Error("Not authenticated");

      // find owner's store
      const { data: store } = (await supabase
        .from("stores")
        .select("id")
        .eq("owner_id", ownerId)
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["stores"]["Row"] | null;
        error: any;
      };
      if (!store || !store.id) throw new Error("Дэлгүүр олдсонгүй");

      // insert order
      const { data: orderInsert, error: orderErr } = (await (supabase as any)
        .from("orders")
        .insert({
          user_id: null, // created by owner for a customer
          store_id: store.id,
          type: "store",
          status: orderData.status,
          total_amount: orderData.items.reduce(
            (s, i) => s + i.price * i.quantity,
            0,
          ),
          delivery_address: orderData.deliveryAddress,
        } as Database["public"]["Tables"]["orders"]["Insert"])
        .select()
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["orders"]["Row"] | null;
        error: any;
      };

      if (orderErr) throw orderErr;
      if (!orderInsert?.id) throw new Error("Order insert failed");
      const orderId = orderInsert.id;

      // insert order items
      const itemsPayload = orderData.items.map((it) => ({
        order_id: orderId,
        product_name: it.name,
        quantity: it.quantity,
        price: it.price,
      }));
      const { error: itemsErr } = await (supabase as any)
        .from("order_items")
        .insert(
          itemsPayload as Database["public"]["Tables"]["order_items"]["Insert"][],
        );
      if (itemsErr) throw itemsErr;

      toast.success("Захиалга амжилттай үүсгэгдлээ");

      // refresh
      // re-use the fetch logic by calling the effect - simple approach: reload all
      const evt = new Event("reloadOrders");
      window.dispatchEvent(evt);
    } catch (err) {
      console.error("Create order failed:", err);
      toast.error("Захиалга үүсгэхэд алдаа гарлаа");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "active")
      return ["negotiating", "pending", "confirmed", "in_progress"].includes(
        order.status,
      );
    if (filter === "completed")
      return ["completed", "cancelled"].includes(order.status);
    return true;
  });

  const activeCount = orders.filter((o) =>
    ["negotiating", "pending", "confirmed", "in_progress"].includes(o.status),
  ).length;
  const todayRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handleOrderClick = (order: OwnerOrder) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    try {
      const { error } = await (supabase as any)
        .from("orders")
        .update({
          status: newStatus,
        } as Database["public"]["Tables"]["orders"]["Update"])
        .eq("id", orderId);
      if (error) throw error;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
      toast.success("Захиалгын төлөв шинэчлэгдлээ");
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Төлөв шинэчлэхэд алдаа гарлаа");
    }
  };



  const handleQuickConfirm = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleUpdateStatus(orderId, "confirmed");
  };

  const handleQuickAssign = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrder(orders.find((o) => o.id === orderId) || null);
    setDetailModalOpen(true);
  };

  // listen for manual reload event (used after create)
  useEffect(() => {
    const onReload = () => {
      // re-run load by toggling user (cheap way: reload page) or better, call loadOrders directly
      // For now, re-run load via simple page re-fetch
      window.location.reload();
    };
    window.addEventListener("reloadOrders", onReload);
    return () => window.removeEventListener("reloadOrders", onReload);
  }, []);

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-card border-b border-border pt-safe px-4 pb-4">
        <div className="pt-4 max-w-7xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Захиалгууд</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Бүх захиалгуудыг удирдах
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Захиалга үүсгэх
          </Button>
        </div>
      </header>

      {/* Stats */}
      <section className="px-4 py-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/10 rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-primary">
              {activeCount}
            </span>
            <p className="text-xs text-muted-foreground mt-1">Идэвхтэй</p>
          </div>
          <div className="bg-success/10 rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-success">
              {orders.filter((o) => o.status === "completed").length}
            </span>
            <p className="text-xs text-muted-foreground mt-1">Дууссан</p>
          </div>
          <div className="bg-secondary/10 rounded-xl p-4 text-center">
            <span className="text-xl font-bold text-secondary">
              ₮{(todayRevenue / 1000).toFixed(0)}K
            </span>
            <p className="text-xs text-muted-foreground mt-1">Орлого</p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="px-4 pb-4 max-w-7xl mx-auto">
        <div className="flex gap-2">
          {[
            { id: "all", label: "Бүгд" },
            { id: "active", label: "Идэвхтэй" },
            { id: "completed", label: "Дууссан" },
          ].map((f) => (
            <Badge
              key={f.id}
              variant={filter === f.id ? "default" : "secondary"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setFilter(f.id as FilterType)}>
              {f.label}
            </Badge>
          ))}
        </div>
      </section>

      {/* Orders List */}
      <section className="px-4 pb-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order, index) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-card rounded-2xl p-4 shadow-card cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleOrderClick(order)}>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.customer.avatar}
                      alt={order.customer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-foreground">
                        {order.customer.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        #{order.id} •{" "}
                        {new Date(order.createdAt).toLocaleTimeString("mn-MN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge className={cn(status.color, "text-white gap-1")}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </Badge>
                </div>

                {/* Items */}
                <div className="mt-3 p-3 bg-muted rounded-xl">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-muted-foreground">
                        ₮{(item.price * item.quantity)?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                    <span className="font-medium text-foreground">Нийт</span>
                    <span className="font-bold text-primary">
                      ₮{order.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm truncate">
                    {order.deliveryAddress}
                  </span>
                </div>

                {/* Driver Info */}
                {order.driver && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-success" />
                    <span className="text-foreground">{order.driver.name}</span>
                    <span className="text-muted-foreground">
                      • {order.driver.phone}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}>
                    <Phone className="w-4 h-4 mr-2" />
                    Залгах
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Чат
                  </Button>
                  {order.status === "negotiating" && (
                    <Button
                      size="sm"
                      onClick={(e) => handleQuickConfirm(order.id, e)}>
                      Батлах
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                  {order.status === "confirmed" && !order.driver && (
                    <Button
                      size="sm"
                      onClick={(e) => handleQuickAssign(order.id, e)}>
                      Жолооч оноох
                      <Truck className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-foreground">Захиалга байхгүй</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Одоогоор захиалга ирээгүй байна
            </p>
          </div>
        )}
      </section>

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Create Order Modal */}
      <OrderModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSave={handleCreateOrder}
      />
    </AppLayout>
  );
}
