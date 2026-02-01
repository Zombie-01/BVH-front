/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Clock,
  CheckCircle,
  MessageCircle,
  MapPin,
  DollarSign,
  Calendar,
  Filter,
  ChevronRight,
  User,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

interface Job {
  id: string;
  customerName: string;
  customerAvatar: string;
  title: string;
  description: string;
  location?: string;
  status: "new" | "quoted" | "accepted" | "in_progress" | "completed";
  expectedBudget: number;
  quotedPrice?: number;
  createdAt: Date;
  scheduledDate?: Date | null;
}

// We'll fetch jobs from `orders` (type = 'service') and map to the UI model.
const statusConfig = {
  new: { label: "Шинэ", color: "bg-primary", textColor: "text-primary" },
  quoted: {
    label: "Үнэ илгээсэн",
    color: "bg-warning",
    textColor: "text-warning",
  },
  accepted: {
    label: "Батлагдсан",
    color: "bg-success",
    textColor: "text-success",
  },
  in_progress: {
    label: "Явагдаж байна",
    color: "bg-blue-500",
    textColor: "text-blue-500",
  },
  completed: {
    label: "Дууссан",
    color: "bg-muted",
    textColor: "text-muted-foreground",
  },
};

type FilterType = "all" | "new" | "active" | "completed";

export default function WorkerJobs() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredJobs = jobs.filter((job) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "new") return job.status === "new";
    if (activeFilter === "active")
      return ["quoted", "accepted", "in_progress"].includes(job.status);
    if (activeFilter === "completed") return job.status === "completed";
    return true;
  });

  const newJobsCount = jobs.filter((j) => j.status === "new").length;
  const activeJobsCount = jobs.filter((j) =>
    ["quoted", "accepted", "in_progress"].includes(j.status),
  ).length;

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        // Fetch service type orders. We include the user's profile for display.
        const { data } = (await supabase
          .from("orders")
          .select(
            `id, description, expected_price, agreed_price, total_amount, status, scheduled_date, created_at, user:profiles(id, name, avatar)`,
          )
          .eq("type", "service")) as any;

        const mapped: Job[] = (data ?? []).map((row: any) => ({
          id: row.id,
          customerName: row.user?.name ?? "-",
          customerAvatar:
            row.user?.avatar ??
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
          title: row.description?.split("\n")?.[0] ?? "Үйлчилгээ",
          description: row.description ?? "",
          location: undefined,
          status:
            row.status === "pending" || row.status === "negotiating"
              ? "new"
              : ((row.status as any) ?? "new"),
          expectedBudget: row.expected_price ?? 0,
          quotedPrice: row.agreed_price ?? undefined,
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          scheduledDate: row.scheduled_date
            ? new Date(row.scheduled_date)
            : null,
        }));

        setJobs(mapped);
      } catch (err) {
        console.error("Failed to load worker jobs:", err);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, [profile]);

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-orange-500 pt-safe px-4 pb-6 lg:rounded-b-3xl">
        <div className="pt-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Сайн байна уу 👷</p>
              <h1 className="text-2xl font-bold text-white">Миний ажлууд</h1>
            </div>
            <Button variant="outline-light" size="icon">
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-white">
                {loading ? "—" : newJobsCount}
              </span>
              <p className="text-xs text-white/70 mt-1">Шинэ</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-white">
                {loading ? "—" : activeJobsCount}
              </span>
              <p className="text-xs text-white/70 mt-1">Идэвхтэй</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-white">₮1.2M</span>
              <p className="text-xs text-white/70 mt-1">Сарын орлого</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <section className="px-4 py-4 max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "Бүгд" },
            { id: "new", label: "Шинэ", count: newJobsCount },
            { id: "active", label: "Идэвхтэй", count: activeJobsCount },
            { id: "completed", label: "Дууссан" },
          ].map((filter) => (
            <Badge
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "secondary"}
              className="cursor-pointer whitespace-nowrap px-4 py-2"
              onClick={() => setActiveFilter(filter.id as FilterType)}>
              {filter.label}
              {filter.count !== undefined && ` (${filter.count})`}
            </Badge>
          ))}
        </div>
      </section>

      {/* Jobs List */}
      <section className="px-4 pb-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.map((job, index) => {
            const status = statusConfig[job.status];

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-card rounded-2xl p-4 shadow-card">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={job.customerAvatar}
                      alt={job.customerName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {job.customerName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString("mn-MN")}
                      </p>
                    </div>
                  </div>
                  <Badge className={cn(status.color, "text-white text-xs")}>
                    {status.label}
                  </Badge>
                </div>

                {/* Content */}
                <div className="mt-3">
                  <h4 className="font-bold text-foreground">{job.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {job.description}
                  </p>
                </div>

                {/* Location */}
                <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm truncate">
                    {job.location ?? "-"}
                  </span>
                </div>

                {/* Price */}
                <div className="mt-3 flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground">Төсөв</p>
                    <span className="font-bold text-foreground">
                      ~₮{job.expectedBudget?.toLocaleString()}
                    </span>
                  </div>
                  {job.quotedPrice && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Миний үнэ</p>
                      <span className="font-bold text-primary">
                        ₮{job.quotedPrice?.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Scheduled Date */}
                {job.scheduledDate && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-foreground">
                      {new Date(job.scheduledDate).toLocaleDateString("mn-MN")}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      navigate(`/worker/chats/${job.id}`, {
                        state: {
                          type: "worker",
                          name: job.customerName,
                          serviceDescription: job.description,
                          expectedPrice: job.expectedBudget,
                          customerId: job.id,
                        },
                      })
                    }>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Чат
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      navigate(`/worker/quotes`, { state: { jobId: job.id } })
                    }>
                    {job.status === "new" ? "Үнэ илгээх" : "Дэлгэрэнгүй"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-foreground">Ажил байхгүй</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Одоогоор ажил ирээгүй байна
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-muted-foreground">
            Уншиж байна...
          </div>
        )}
      </section>
    </AppLayout>
  );
}
