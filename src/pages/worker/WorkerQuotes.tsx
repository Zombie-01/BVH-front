/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Edit,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type ServiceJobRow = Database["public"]["Tables"]["service_jobs"]["Row"];
type ChatRow = Database["public"]["Tables"]["chats"]["Row"];

const statusConfig = {
  pending: { label: "Хүлээгдэж байна", color: "bg-warning", icon: Clock },
  accepted: { label: "Батлагдсан", color: "bg-success", icon: CheckCircle },
  rejected: { label: "Татгалзсан", color: "bg-destructive", icon: XCircle },
  expired: { label: "Хугацаа дууссан", color: "bg-muted", icon: Clock },
};

export default function WorkerQuotes() {
  const navigate = useNavigate();
  const { user, profile, serviceWorker } = useAuth();
  const [filter, setFilter] = useState<
    "all" | "pending" | "quoted" | "accepted" | "in_progress" | "completed"
  >("all");
  const [serviceJobs, setServiceJobs] = useState<ServiceJobRow[]>([]);
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [loading, setLoading] = useState(true);

  // load worker's service jobs + chats (scoped to logged-in worker)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      console.log(
        "Loading worker quotes/chats for worker_id:",
        serviceWorker?.id,
      );
      if (!serviceWorker?.id) return;
      setLoading(true);
      try {
        // fetch service jobs for this worker + chats that belong to this worker
        const [chatsRes, sjRes] = await Promise.all([
          supabase
            .from("chats")
            .select(
              `
      *,
      user:profiles!chats_user_id_fkey(id, name, avatar)
    `,
            )
            .eq("worker_id", serviceWorker.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("service_jobs")
            .select(
              `
      *,
      user:profiles!service_jobs_user_id_fkey(id, name, avatar)
    `,
            )
            .eq("worker_id", serviceWorker.id)
            .order("created_at", { ascending: false }),
        ]);

        if (!mounted) return;
        if (sjRes.data) setServiceJobs(sjRes.data as ServiceJobRow[]);
        if (chatsRes.data) setChats(chatsRes.data as ChatRow[]);
      } catch (err) {
        console.error("Failed to load quotes/chats:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [serviceWorker]);

  // realtime: update chats/service_jobs for this worker (scoped)
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`worker-quotes-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
          filter: `worker_id=eq.${profile.id}`,
        },
        (payload: any) => {
          setChats((prev) =>
            prev.some((c) => c.id === payload.new.id)
              ? prev
              : [payload.new, ...prev],
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chats",
          filter: `worker_id=eq.${profile.id}`,
        },
        (payload: any) => {
          setChats((prev) =>
            prev.map((c) => (c.id === payload.new.id ? payload.new : c)),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_jobs",
          filter: `worker_id=eq.${profile.id}`,
        },
        (payload: any) => {
          setServiceJobs((prev) =>
            prev.some((s) => s.id === payload.new.id)
              ? prev
              : [payload.new, ...prev],
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "service_jobs",
          filter: `worker_id=eq.${profile.id}`,
        },
        (payload: any) => {
          setServiceJobs((prev) =>
            prev.map((s) => (s.id === payload.new.id ? payload.new : s)),
          );
        },
      )
      .subscribe();

    return () => {
      try {
        channel.unsubscribe();
      } catch (err) {
        /* ignore */
      }
    };
  }, [profile?.id]);

  // derive UI lists
  const filteredJobs = serviceJobs.filter((job) => {
    if (filter === "all") return true;
    if (filter === "pending")
      return job.status === "pending" || job.status === "quoted";
    if (filter === "accepted")
      return job.status === "accepted" || job.status === "completed";
    return true;
  });

  const pendingCount = serviceJobs.filter(
    (s) => s.status === "pending" || s.status === "quoted",
  ).length;
  const acceptedCount = serviceJobs.filter(
    (s) => s.status === "accepted" || s.status === "completed",
  ).length;
  const totalQuoted = serviceJobs.reduce(
    (sum, s) => sum + (s.quoted_price ?? 0),
    0,
  );

  const openChat = (id: string) => navigate(`/worker/chats/${id}`);

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-card border-b border-border pt-safe px-4 pb-4">
        <div className="pt-4 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Үнийн саналууд</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Илгээсэн үнийн саналуудаа хянах
          </p>
        </div>
      </header>

      {/* Stats */}
      <section className="px-4 py-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-warning/10 rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-warning">
              {pendingCount}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Хүлээгдэж байна
            </p>
          </div>
          <div className="bg-success/10 rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-success">
              {acceptedCount}
            </span>
            <p className="text-xs text-muted-foreground mt-1">Батлагдсан</p>
          </div>
          <div className="bg-primary/10 rounded-xl p-4 text-center">
            <span className="text-xl font-bold text-primary">
              ₮{(totalQuoted / 1000).toFixed(0)}K
            </span>
            <p className="text-xs text-muted-foreground mt-1">Нийт үнэ</p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="px-4 pb-4 max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "Бүгд" },
            { id: "pending", label: "Хүлээгдэж байна" },
            { id: "accepted", label: "Батлагдсан" },
            { id: "rejected", label: "Татгалзсан" },
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

      {/* Chat requests (compact) */}
      <section className="px-4 pb-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            Чат хүсэлтүүд
          </h3>
          <p className="text-xs text-muted-foreground">
            {chats.length} идэвхтэй
          </p>
        </div>

        <div className="flex flex-col gap-2 overflow-x-auto pb-2">
          {chats.length === 0 ? (
            <div className="text-xs text-muted-foreground">Чат байхгүй</div>
          ) : (
            chats.map((c) => (
              <button
                key={c.id}
                onClick={() => openChat(c.id)}
                className="flex items-center gap-3 bg-card/50 p-3 rounded-lg min-w-[220px]">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm overflow-hidden">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">
                    {((c as any).user?.name ??
                      (c.user_id && c.user_id.substring(0, 6))) ||
                      "Хэрэглэгч"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.last_message ?? "Сүүлд илгээсэн: -"}
                  </p>
                </div>
                {c.unread_count ? (
                  <div className="bg-destructive text-white rounded-full text-xs px-2 py-1">
                    {c.unread_count}
                  </div>
                ) : null}
              </button>
            ))
          )}
        </div>
      </section>

      {/* Quotes List (service jobs / quotes) */}
      <section className="px-4 pb-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Ачааллаж байна…
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredJobs.map((job, index) => {
              const statusKey = (
                job.status === "quoted"
                  ? "pending"
                  : job.status === "in_progress" || job.status === "completed"
                    ? "accepted"
                    : job.status
              ) as keyof typeof statusConfig;
              const status = statusConfig[statusKey] ?? statusConfig.pending;
              const StatusIcon = status.icon;

              const customer = (job as any).user ?? null;

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index }}
                  className="bg-card rounded-2xl p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          customer?.avatar ??
                          `https://avatars.dicebear.com/api/initials/${encodeURIComponent(customer?.name ?? "U")}.svg`
                        }
                        alt={customer?.name ?? "user"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {customer?.name ?? "Хэрэглэгч"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {job.description ?? "Үйлчилгээ"}
                        </p>
                      </div>
                    </div>

                    <Badge
                      className={cn(status.color, "text-white text-xs gap-1")}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-muted rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">
                        Төсөв / Хүлээгдэж буй үнэ
                      </p>
                      <span className="font-bold text-foreground">
                        {job.quoted_price
                          ? `₮${job.quoted_price?.toLocaleString()}`
                          : "—"}
                      </span>
                    </div>
                    <div className="bg-primary/10 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">Миний үнэ</p>
                      <span className="font-bold text-primary">
                        {job.quoted_price
                          ? `₮${job.quoted_price?.toLocaleString()}`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {job.description && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        {job.description}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Send className="w-4 h-4" />
                      <span>
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString("mn-MN")
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Хүчинтэй: —</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openChat(job.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Чат нээх
                    </Button>
                    {job.status === "pending" ? (
                      <Button variant="destructive" size="sm">
                        Цуцлах
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm">
                        Дэлгэрэнгүй
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-foreground">
                  Үнийн санал байхгүй
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Одоогоор илгээсэн үнийн санал байхгүй байна
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
