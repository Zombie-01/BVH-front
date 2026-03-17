/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  MessageCircle,
  Search,
  Clock,
  CheckCircle,
  Package,
  ChevronRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatPreview {
  id: string;
  customer: {
    name: string;
    avatar: string;
  };
  lastMessage: string;
  unread: number;
  status: "negotiating" | "agreed" | "cancelled";
  items?: string[];
  expectedPrice?: number;
  updatedAt: Date;
}

const statusConfig = {
  negotiating: { label: "Тохиролцож байна", color: "bg-warning" },
  agreed: { label: "Тохирсон", color: "bg-success" },
  cancelled: { label: "Цуцлагдсан", color: "bg-destructive" },
};

export default function OwnerChats() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    async function loadChats() {
      setIsLoading(true);
      try {
        const ownerId = profile?.id ?? user?.id;
        if (!ownerId) return;
        // find owner's stores
        const { data: stores } = await supabase
          .from("stores")
          .select("id")
          .eq("owner_id", ownerId);
        const storeRows = (stores ??
          []) as Database["public"]["Tables"]["stores"]["Row"][];
        const storeIds = storeRows.map((s) => s.id);
        if (!storeIds.length) return setChats([]);

        // fetch chats associated with those stores
        const { data: chatRows, error } = await supabase
          .from("chats")
          .select(
            "id, user_id, last_message, unread_count, status, expected_price, created_at, updated_at",
          )
          .in("store_id", storeIds)
          .order("updated_at", { ascending: false });
        if (error) throw error;
        const rows = (chatRows ??
          []) as Database["public"]["Tables"]["chats"]["Row"][];

        // fetch user profiles for participants
        const userIds = Array.from(
          new Set(rows.map((r) => r.user_id).filter(Boolean)),
        );
        const { data: profiles } = (await supabase
          .from("profiles")
          .select("id, name, avatar")
          .in("id", userIds as string[])) as {
          data: Database["public"]["Tables"]["profiles"]["Row"][] | null;
          error: any;
        };

        const mapped: ChatPreview[] = rows.map((r) => {
          const profile = (profiles ?? []).find((p: any) => p.id === r.user_id);
          return {
            id: r.id,
            customer: {
              name: profile?.name ?? "Хэрэглэгч",
              avatar: profile?.avatar ?? "",
            },
            lastMessage: r.last_message ?? "",
            unread: r.unread_count ?? 0,
            status: r.status,
            items: [],
            expectedPrice: r.expected_price ?? undefined,
            updatedAt: r.updated_at
              ? new Date(r.updated_at)
              : new Date(r.created_at ?? undefined),
          };
        });

        setChats(mapped);
      } catch (err) {
        console.error("Failed to load chats:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadChats();
  }, [user, profile?.id]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "negotiating">("all");

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "unread") return matchesSearch && chat.unread > 0;
    if (filter === "negotiating")
      return matchesSearch && chat.status === "negotiating";
    return matchesSearch;
  });

  const unreadCount = chats.reduce((sum, c) => sum + (c.unread || 0), 0);
  const negotiatingCount = chats.filter(
    (c) => c.status === "negotiating",
  ).length;

  if (isLoading) {
    return (
      <AppLayout>
        {/* Header Skeleton */}
        <header className="bg-card border-b border-border pt-safe px-4 pb-4">
          <div className="pt-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Search Skeleton */}
            <div className="mt-4 relative">
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
        </header>

        {/* Filter Skeleton */}
        <section className="px-4 py-4 max-w-7xl mx-auto">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </section>

        {/* Chats List Skeleton */}
        <section className="px-4 pb-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <Skeleton className="absolute -top-1 -right-1 w-6 h-6 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full mt-1" />
                    <Skeleton className="h-3 w-3/4 mt-2" />
                    <div className="mt-2 flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                  <Skeleton className="w-5 h-5 flex-shrink-0" />
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
      <header className="bg-card border-b border-border pt-safe px-4 pb-4">
        <div className="pt-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Чатууд</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Хэрэглэгчидтэй харилцах
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                {unreadCount} шинэ
              </Badge>
            )}
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Чат хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-muted border-0"
            />
          </div>
        </div>
      </header>

      {/* Filter */}
      <section className="px-4 py-4 max-w-7xl mx-auto">
        <div className="flex gap-2">
          {[
            { id: "all", label: "Бүгд" },
            { id: "unread", label: `Уншаагүй (${unreadCount})` },
            {
              id: "negotiating",
              label: `Тохиролцож байна (${negotiatingCount})`,
            },
          ].map((f) => (
            <Badge
              key={f.id}
              variant={filter === f.id ? "default" : "secondary"}
              className="cursor-pointer whitespace-nowrap px-4 py-2"
              onClick={() => setFilter(f.id as typeof filter)}>
              {f.label}
            </Badge>
          ))}
        </div>
      </section>

      {/* Chats List */}
      <section className="px-4 pb-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredChats.map((chat, index) => {
            const status = statusConfig[chat.status];

            return (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => navigate(`/owner/chats/${chat.id}`)}
                className="bg-card rounded-2xl p-4 shadow-card text-left w-full hover:shadow-elevated transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.customer.avatar}
                      alt={chat.customer.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {chat.unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {chat.unread}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground">
                        {chat.customer.name}
                      </h3>
                      <Badge
                        className={cn(status.color, "text-white text-2xs")}>
                        {status.label}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "text-sm mt-1 line-clamp-1",
                        chat.unread > 0
                          ? "text-foreground font-medium"
                          : "text-muted-foreground",
                      )}>
                      {chat.lastMessage}
                    </p>

                    {/* Items Preview */}
                    {chat.items && chat.items.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">
                          {chat.items.join(", ")}
                        </span>
                      </div>
                    )}

                    {/* Price & Time */}
                    <div className="mt-2 flex items-center justify-between">
                      {chat.expectedPrice && (
                        <span className="text-sm font-medium text-primary">
                          ~₮{chat.expectedPrice?.toLocaleString()}
                        </span>
                      )}
                      <span className="text-2xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(chat.updatedAt).toLocaleTimeString("mn-MN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {filteredChats.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-foreground">Чат байхгүй</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Одоогоор идэвхтэй чат байхгүй байна
            </p>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
