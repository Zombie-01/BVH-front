import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  Package,
  ShoppingCart,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Stats labels are static but values are populated from Supabase
const stats = [
  {
    label: "Өнөөдрийн борлуулалт",
    value: null as number | null,
    change: "+12%",
    trend: "up",
    icon: DollarSign,
    color: "bg-success/10 text-success",
  },
  {
    label: "Захиалга",
    value: null as number | null,
    change: "+8",
    trend: "up",
    icon: ShoppingCart,
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Шинэ чат",
    value: null as number | null,
    change: "+5",
    trend: "up",
    icon: MessageCircle,
    color: "bg-warning/10 text-warning",
  },
  {
    label: "Хэрэглэгч",
    value: null as number | null,
    change: "+23",
    trend: "up",
    icon: Users,
    color: "bg-secondary/10 text-secondary",
  },
];

// Dashboard state & loader are declared inside the component to follow hook rules (moved below).

// `pendingChats` is populated via Supabase in the effect above.

const statusConfig: Record<string, { label: string; color: string }> = {
  negotiating: { label: "Тохиролцож байна", color: "bg-warning" },
  confirmed: { label: "Баталгаажсан", color: "bg-success" },
  in_progress: { label: "Явагдаж байна", color: "bg-primary" },
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [newChatsCount, setNewChatsCount] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<
    {
      id: string;
      customer: string;
      avatar?: string | null;
      items: string;
      total: number | null;
      status: string;
      createdAt: string | null;
    }[]
  >([]);
  const [pendingChats, setPendingChats] = useState<
    {
      id: string;
      customer: string;
      avatar?: string | null;
      lastMessage?: string;
      unread: number;
      updatedAt?: string | null;
    }[]
  >([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoadingDashboard(true);
        const ownerIdResolved = profile?.id || user?.id || null;
        if (!ownerIdResolved) return;

        // find stores owned by the user
        const { data: stores } = (await supabase
          .from("stores")
          .select("id")
          .eq("owner_id", ownerIdResolved)) as {
          data: Database["public"]["Tables"]["stores"]["Row"][] | null;
          error: unknown;
        };

        const storeIds = (stores ?? []).map((s) => s.id);
        if (!storeIds.length) return;

        // fetch all orders for those stores to compute aggregates
        const { data: allOrders } = (await supabase
          .from("orders")
          .select("id, user_id, total_amount, status, created_at")
          .in("store_id", storeIds)) as {
          data: Database["public"]["Tables"]["orders"]["Row"][] | null;
          error: unknown;
        };

        const ordersList = allOrders ?? [];

        // compute counts and today's revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const revenueToday = ordersList
          .filter((o) => o.status === "completed" && o.created_at)
          .reduce((sum, o) => {
            const created = o.created_at ? new Date(o.created_at) : null;
            if (!created) return sum;
            if (created >= today) return sum + (o.total_amount ?? 0);
            return sum;
          }, 0);

        const activeOrdersCount = ordersList.filter((o) =>
          ["negotiating", "pending", "confirmed", "in_progress"].includes(
            o.status as string,
          ),
        ).length;

        // fetch recent orders (limit 5)
        const { data: recent } = (await supabase
          .from("orders")
          .select("id, user_id, total_amount, status, created_at")
          .in("store_id", storeIds)
          .order("created_at", { ascending: false })
          .limit(5)) as {
          data: Database["public"]["Tables"]["orders"]["Row"][] | null;
          error: unknown;
        };

        const recentRows = recent ?? [];
        const userIds = Array.from(
          new Set(recentRows.map((r) => r.user_id).filter(Boolean)),
        );
        const { data: profiles } = (await supabase
          .from("profiles")
          .select("id, name, avatar")
          .in("id", userIds as string[])) as {
          data: Database["public"]["Tables"]["profiles"]["Row"][] | null;
          error: unknown;
        };

        const mappedRecent = recentRows.map((r) => {
          const p = (profiles ?? []).find((x) => x.id === r.user_id);
          return {
            id: r.id,
            customer: p?.name ?? "Хэрэглэгч",
            avatar: p?.avatar ?? undefined,
            items: "—",
            total: r.total_amount ?? null,
            status: r.status ?? "",
            createdAt: r.created_at ?? null,
          };
        });

        // fetch pending chats (unread) for owner's stores
        const { data: chats } = (await supabase
          .from("chats")
          .select("id, user_id, last_message, unread_count, updated_at")
          .in("store_id", storeIds)
          .gt("unread_count", 0)
          .order("updated_at", { ascending: false })
          .limit(5)) as {
          data: Database["public"]["Tables"]["chats"]["Row"][] | null;
          error: unknown;
        };

        const chatRows = chats ?? [];
        const chatUserIds = Array.from(
          new Set(chatRows.map((c) => c.user_id).filter(Boolean)),
        );
        const { data: chatProfiles } = (await supabase
          .from("profiles")
          .select("id, name, avatar")
          .in("id", chatUserIds as string[])) as {
          data: Database["public"]["Tables"]["profiles"]["Row"][] | null;
          error: unknown;
        };

        const mappedChats = chatRows.map((c) => {
          const p = (chatProfiles ?? []).find((x) => x.id === c.user_id);
          return {
            id: c.id,
            customer: p?.name ?? "Хэрэглэгч",
            avatar: p?.avatar ?? undefined,
            lastMessage: c.last_message ?? undefined,
            unread: c.unread_count ?? 0,
            updatedAt: c.updated_at ?? null,
          };
        });

        setTodayRevenue(revenueToday);
        setOrdersCount(activeOrdersCount);
        setNewChatsCount(
          (mappedChats ?? []).reduce((s, c) => s + (c.unread ?? 0), 0),
        );
        setRecentOrders(mappedRecent);
        setPendingChats(mappedChats);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    loadDashboard();
  }, [profile?.id, user?.id]);
  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-gradient-to-br from-secondary via-secondary to-gray-700 pt-safe px-4 pb-6 lg:rounded-b-3xl">
        <div className="pt-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Сайн байна уу 🏪</p>
              <h1 className="text-2xl font-bold text-white">
                Барилгын Материал ХХК
              </h1>
            </div>
            <Badge className="bg-success text-success-foreground">
              Нээлттэй
            </Badge>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="px-4 -mt-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-card rounded-xl p-4 shadow-card">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                    stat.color,
                  )}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold text-foreground">
                    {stat.label === "Өнөөдрийн борлуулалт"
                      ? `₮${(todayRevenue / 1000).toFixed(1)}K`
                      : stat.label === "Захиалга"
                        ? ordersCount
                        : stat.label === "Шинэ чат"
                          ? newChatsCount
                          : (stat.value ?? "—")}
                  </span>
                  <span
                    className={cn(
                      "text-xs flex items-center gap-0.5",
                      stat.trend === "up" ? "text-success" : "text-destructive",
                    )}>
                    {stat.trend === "up" ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    {stat.change}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="px-4 py-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <section className="bg-card rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Сүүлийн захиалгууд
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/owner/orders")}>
              Бүгд
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order, index) => {
              const status = statusConfig[order.status];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => navigate(`/owner/orders/${order.id}`)}>
                  <img
                    src={order.avatar}
                    alt={order.customer}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground truncate">
                        {order.customer}
                      </h4>
                      <Badge
                        className={cn(
                          status ? status.color : "bg-white",
                          "text-white text-2xs",
                        )}>
                        {status ? status.label : "-"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.items}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary text-sm">
                      ₮{order.total?.toLocaleString()}
                    </span>
                    <p className="text-2xs text-muted-foreground">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleTimeString(
                            "mn-MN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : ""}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Pending Chats */}
        <section className="bg-card rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-warning" />
              Хүлээгдэж буй чат
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/owner/chats")}>
              Бүгд
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {pendingChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted transition-colors"
                onClick={() => navigate(`/owner/chats/${chat.id}`)}>
                <div className="relative">
                  <img
                    src={chat.avatar}
                    alt={chat.customer}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {chat.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                      <span className="text-2xs text-white font-bold">
                        {chat.unread}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">
                    {chat.customer}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                <span className="text-2xs text-muted-foreground">
                  {chat.updatedAt
                    ? new Date(chat.updatedAt).toLocaleTimeString("mn-MN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-3"
              onClick={() => navigate("/owner/products")}>
              <Package className="w-5 h-5 mr-2" />
              <span>Бараа нэмэх</span>
            </Button>
            <Button
              className="h-auto py-3"
              onClick={() => navigate("/owner/orders")}>
              <TrendingUp className="w-5 h-5 mr-2" />
              <span>Тайлан харах</span>
            </Button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
