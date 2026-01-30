import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  MapPin,
  Truck,
  MessageCircle,
  Wrench,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  OrderStatus,
  Order as OrderType,
  OrderItem as OrderItemType,
} from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  negotiating: {
    label: "Тохиролцож байна",
    color: "bg-yellow-500",
    icon: MessageCircle,
  },
  pending: { label: "Хүлээгдэж байна", color: "bg-warning", icon: Clock },
  confirmed: { label: "Баталгаажсан", color: "bg-primary", icon: CheckCircle },
  in_progress: { label: "Явагдаж байна", color: "bg-success", icon: Truck },
  completed: { label: "Дууссан", color: "bg-muted", icon: CheckCircle },
  cancelled: { label: "Цуцлагдсан", color: "bg-destructive", icon: XCircle },
};

type FilterType = "all" | "active" | "completed";

export default function Orders() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "chats">("orders");

  const [chats, setChats] = useState<
    Array<{
      id: string;
      name: string;
      lastMessage?: string | null;
      unread?: number | null;
      status?: string | null;
      expectedPrice?: number | null;
      createdAt?: Date | null;
    }>
  >([]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const { data: rows } = (await supabase
          .from("orders")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })) as {
          data: Database["public"]["Tables"]["orders"]["Row"][] | null;
          error: unknown;
        };

        const orderRows = rows ?? [];
        const orderIds = orderRows.map((r) => r.id);

        const { data: itemsRows } = (await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds)) as {
          data: Database["public"]["Tables"]["order_items"]["Row"][] | null;
          error: unknown;
        };

        const itemsByOrder: Record<string, OrderItemType[]> = {};
        (itemsRows ?? []).forEach((it) => {
          itemsByOrder[it.order_id] = itemsByOrder[it.order_id] ?? [];
          itemsByOrder[it.order_id].push({
            productId: it.product_id ?? "",
            productName: it.product_name,
            quantity: it.quantity,
            price: it.price,
            image: it.image ?? undefined,
          });
        });

        const mapped: OrderType[] = orderRows.map((r) => ({
          id: r.id,
          chatId: r.chat_id ?? "",
          userId: r.user_id ?? "",
          storeId: r.store_id ?? undefined,
          workerId: r.worker_id ?? undefined,
          driverId: r.driver_id ?? undefined,
          type: r.type === "delivery" ? "delivery" : "service",
          status: r.status as OrderStatus,
          items: itemsByOrder[r.id] ?? [],
          expectedPrice: r.expected_price ?? 0,
          agreedPrice: r.agreed_price ?? undefined,
          totalAmount: r.total_amount ?? 0,
          deliveryAddress: r.delivery_address ?? undefined,
          serviceDescription: r.service_description ?? undefined,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          confirmedAt: r.confirmed_at ? new Date(r.confirmed_at) : undefined,
        }));

        setOrders(mapped);
      } catch (e) {
        console.error("Failed to load orders:", e);
      }
      setLoading(false);
    };

    loadOrders();
  }, [profile?.id]);

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") {
      return ["negotiating", "pending", "confirmed", "in_progress"].includes(
        order.status,
      );
    }
    if (activeFilter === "completed") {
      return ["completed", "cancelled"].includes(order.status);
    }
    return true;
  });

  // Chats
  const [chatFilter, setChatFilter] = useState<
    "all" | "unread" | "negotiating"
  >("all");

  useEffect(() => {
    const loadChats = async () => {
      if (!profile?.id) return;
      try {
        const { data: rows } = (await supabase
          .from("chats")
          .select(
            "id, store_id, last_message, unread_count, status, expected_price, created_at, updated_at",
          )
          .eq("user_id", profile.id)
          .order("updated_at", { ascending: false })) as {
          data: Database["public"]["Tables"]["chats"]["Row"][] | null;
          error: unknown;
        };

        const chatRows = rows ?? [];
        const storeIds = Array.from(
          new Set(chatRows.map((r) => r.store_id).filter(Boolean)),
        );

        const { data: stores } = storeIds.length
          ? ((await supabase
              .from("stores")
              .select("id, name")
              .in("id", storeIds as string[])) as {
              data: Database["public"]["Tables"]["stores"]["Row"][] | null;
              error: unknown;
            })
          : {
              data: [] as
                | Database["public"]["Tables"]["stores"]["Row"][]
                | null,
            };

        const storeMap = new Map((stores ?? []).map((s) => [s.id, s.name]));

        const mapped = chatRows.map((r) => ({
          id: r.id,
          name: storeMap.get(r.store_id ?? "") ?? "Дэлгүүр",
          lastMessage: r.last_message ?? "",
          unread: r.unread_count ?? 0,
          status: r.status,
          expectedPrice: r.expected_price ?? undefined,
          createdAt: r.updated_at
            ? new Date(r.updated_at)
            : new Date(r.created_at ?? undefined),
        }));

        setChats(mapped);
      } catch (err) {
        console.error("Failed to load chats:", err);
      }
    };

    loadChats();
  }, [profile?.id]);

  const filteredChats = chats.filter((chat) => {
    if (chatFilter === "unread") return (chat.unread || 0) > 0;
    if (chatFilter === "negotiating") return chat.status === "negotiating";
    return true;
  });

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-card border-b border-border pt-safe px-4 pb-4">
        <div className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {activeTab === "orders" ? "Миний захиалгууд" : "Миний чатууд"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {activeTab === "orders"
                  ? "Бүх захиалга болон хүргэлтүүд"
                  : "Чатууд болон харилцаа"}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={activeTab === "orders" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setActiveTab("orders")}>
                Захиалгууд ({orders.length})
              </Badge>
              <Badge
                variant={activeTab === "chats" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setActiveTab("chats")}>
                Чатууд ({chats.length})
              </Badge>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex gap-2">
          <Badge
            variant={activeFilter === "all" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setActiveFilter("all")}>
            Бүгд ({orders.length})
          </Badge>
          <Badge
            variant={activeFilter === "active" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setActiveFilter("active")}>
            Идэвхтэй (
            {
              orders.filter((o) =>
                ["negotiating", "pending", "confirmed", "in_progress"].includes(
                  o.status,
                ),
              ).length
            }
            )
          </Badge>
          <Badge
            variant={activeFilter === "completed" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setActiveFilter("completed")}>
            Дууссан (
            {
              orders.filter((o) =>
                ["completed", "cancelled"].includes(o.status),
              ).length
            }
            )
          </Badge>
        </div>
      </header>

      {/* Orders List */}
      {activeTab === "orders" ? (
        <section className="px-4 py-4 space-y-4">
          {filteredOrders.map((order, index) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <motion.button
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => handleOrderClick(order.id)}
                className="w-full bg-card rounded-2xl p-4 shadow-card text-left">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        status.color,
                      )}>
                      {order.type === "delivery" ? (
                        <Package className="w-6 h-6 text-white" />
                      ) : (
                        <Wrench className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">
                        #{order.id} -{" "}
                        {order.type === "delivery" ? "Хүргэлт" : "Үйлчилгээ"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("mn-MN")}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      {order.items
                        .slice(0, 3)
                        .map(
                          (item, idx) =>
                            item.image && (
                              <img
                                key={idx}
                                src={item.image}
                                alt={item.productName}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ),
                        )}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-muted-foreground ml-2">
                        {order.items.length} бараа
                      </span>
                    </div>
                  </div>
                )}

                {order.serviceDescription && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {order.serviceDescription}
                    </p>
                  </div>
                )}

                {order.deliveryAddress && (
                  <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm truncate">
                      {order.deliveryAddress}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      status.color,
                      "text-white",
                    )}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </div>
                  <div className="text-right">
                    {order.agreedPrice ? (
                      <span className="font-bold text-foreground">
                        {order.agreedPrice?.toLocaleString()}₮
                      </span>
                    ) : (
                      <span className="font-bold text-muted-foreground">
                        ~{order.expectedPrice?.toLocaleString()}₮
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-foreground">
                Захиалга байхгүй
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Та одоогоор захиалга хийгээгүй байна
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="px-4 py-4 space-y-4">
          {filteredChats.map((chat, index) => (
            <motion.button
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="w-full bg-card rounded-2xl p-4 shadow-card text-left">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{chat.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        chat.createdAt || new Date(),
                      ).toLocaleDateString("mn-MN")}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>

              <p className="text-sm text-muted-foreground mt-3 line-clamp-1">
                {chat.lastMessage}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-muted-foreground text-sm">
                  {chat.status}
                </div>
                <div className="text-right">
                  {chat.expectedPrice ? (
                    <span className="font-bold text-foreground">
                      {chat.expectedPrice?.toLocaleString()}₮
                    </span>
                  ) : null}
                </div>
              </div>
            </motion.button>
          ))}

          {filteredChats.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-foreground">Чат байхгүй</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Чат үүсээгүй байна
              </p>
            </div>
          )}
        </section>
      )}
    </AppLayout>
  );
}
