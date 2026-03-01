/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

const periods = [
  { id: "today", label: "Өнөөдөр" },
  { id: "week", label: "7 хоног" },
  { id: "month", label: "Сар" },
];

export default function DriverEarnings() {
  const { profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  type EarningsSummary = {
    total_earnings: number;
    completed_deliveries: number;
    average_per_delivery: number;
    earnings_by_day: { date: string; amount: number; deliveries: number }[];
  };

  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<
    {
      id: string;
      type: "earning" | "bonus" | "withdrawal";
      description: string;
      amount: number;
      time: string;
    }[]
  >([]);
  const [totalDeliveries, setTotalDeliveries] = useState<number | null>(null);
  const [completionRate, setCompletionRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const getEarnings = () => (summary ? summary.total_earnings : 0);

  useEffect(() => {
    let mounted = true;
    const periodToRange = (p: string) => {
      const now = new Date();
      if (p === "today") {
        const start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        return { start, end: now };
      }
      if (p === "week") {
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start, end: now };
      }
      if (p === "month") {
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start, end: now };
      }
      return { start: new Date(0), end: now };
    };

    const load = async () => {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const { start, end } = periodToRange(selectedPeriod);

        // fetch delivery tasks (delivered) with order totals within range
        const { data } = (await supabase
          .from("delivery_tasks")
          .select("*, order:orders(id, total_amount, user_id)")
          .eq("driver_id", profile.id)
          .eq("status", "delivered")
          .gte("updated_at", start.toISOString())
          .lte("updated_at", end.toISOString())
          .order("updated_at", { ascending: false })) as {
          data: Array<
            Database["public"]["Tables"]["delivery_tasks"]["Row"] & {
              order?: Partial<
                Database["public"]["Tables"]["orders"]["Row"]
              > | null;
            }
          > | null;
          error: unknown;
        };

        const rows = data ?? [];
        // summary
        const total = rows.reduce(
          (s, r) => s + (r.order?.total_amount ?? 0),
          0,
        );
        const deliveries = rows.length;
        const avg = deliveries ? Math.round(total / deliveries) : 0;
        const byDayMap: Record<string, { amount: number; deliveries: number }> =
          {};
        rows.forEach((r) => {
          const d = new Date(
            r.updated_at ?? r.created_at ?? Date.now(),
          ).toLocaleDateString("mn-MN");
          if (!byDayMap[d]) byDayMap[d] = { amount: 0, deliveries: 0 };
          byDayMap[d].amount += r.order?.total_amount ?? 0;
          byDayMap[d].deliveries += 1;
        });

        const earnings_by_day = Object.entries(byDayMap).map(([date, v]) => ({
          date,
          amount: v.amount,
          deliveries: v.deliveries,
        }));

        if (mounted)
          setSummary({
            total_earnings: total,
            completed_deliveries: deliveries,
            average_per_delivery: avg,
            earnings_by_day,
          });

        // recent transactions — last 20 delivered orders for driver (across all time)
        const { data: txRows } = (await supabase
          .from("delivery_tasks")
          .select("*, order:orders(id, total_amount)")
          .eq("driver_id", profile.id)
          .eq("status", "delivered")
          .order("updated_at", { ascending: false })
          .limit(20)) as { data: Array<any> | null; error: unknown };

        const mappedTx = (txRows ?? []).map((r: any) => ({
          id: r.id,
          type: "earning" as const,
          description: `Хүргэлт #${r.order_id ?? r.order?.id ?? r.id}`,
          amount: r.order?.total_amount ?? 0,
          time: r.updated_at
            ? new Date(r.updated_at).toLocaleTimeString("mn-MN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        }));

        if (mounted) setTransactions(mappedTx);

        // compute all-time totals for the driver (used by stat cards)
        try {
          const { count: deliveredCount } = await supabase
            .from("delivery_tasks")
            .select("id", { count: "exact", head: true })
            .eq("driver_id", profile.id)
            .eq("status", "delivered");

          const { count: totalCount } = await supabase
            .from("delivery_tasks")
            .select("id", { count: "exact", head: true })
            .eq("driver_id", profile.id);

          if (mounted) {
            setTotalDeliveries(deliveredCount ?? 0);
            setCompletionRate(
              typeof totalCount === "number" && totalCount > 0
                ? Math.round(((deliveredCount ?? 0) / totalCount) * 100)
                : 0,
            );
          }
        } catch (err) {
          // non-fatal — leave stat cards as null
          console.warn("Failed to load driver totals:", err);
        }
      } catch (err) {
        console.error("Failed to load driver earnings:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const channel = profile?.id
      ? supabase
          .channel(`driver-earnings-${profile.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "delivery_tasks",
              filter: `driver_id=eq.${profile.id}`,
            },
            (payload: any) => load(),
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "delivery_tasks",
              filter: `driver_id=eq.${profile.id}`,
            },
            (payload: any) => load(),
          )
          .subscribe()
      : null;

    return () => {
      mounted = false;
      try {
        channel?.unsubscribe();
      } catch (e) {
        /* ignore */
      }
    };
  }, [profile?.id, selectedPeriod]);

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-orange-400 pt-safe px-4 pb-8">
        <div className="pt-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Орлого</h1>
          <Button variant="outline-light" size="sm">
            <Wallet className="w-4 h-4" />
            Зарлага
          </Button>
        </div>

        {/* Period Selector */}
        <div className="mt-4 flex gap-2 bg-white/10 rounded-xl p-1">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period.id
                  ? "bg-white text-primary"
                  : "text-white/80 hover:text-white"
              }`}>
              {period.label}
            </button>
          ))}
        </div>

        {/* Earnings Display */}
        <motion.div
          key={selectedPeriod}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center">
          <p className="text-white/70 text-sm">Нийт орлого</p>
          <h2 className="text-4xl font-bold text-white mt-1">
            ₮{getEarnings()?.toLocaleString()}
          </h2>
          <div className="flex items-center justify-center gap-1 mt-2 text-white/80">
            <ArrowUpRight className="w-4 h-4 text-accent" />
            <span className="text-sm">+12% өмнөх хугацаанаас</span>
          </div>
        </motion.div>
      </header>

      {/* Stats Cards */}
      <section className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 shadow-elevated">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {totalDeliveries ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">Нийт хүргэлт</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-elevated">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {completionRate != null ? `${completionRate}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Гүйцэтгэл</p>
          </div>
        </div>
      </section>

      {/* Transactions */}
      <section className="px-4 mt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Гүйлгээнүүд</h3>
          <Button variant="ghost" size="sm">
            Бүгд
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-card">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  transaction.type === "earning"
                    ? "bg-success/10"
                    : transaction.type === "bonus"
                      ? "bg-accent/10"
                      : "bg-destructive/10"
                }`}>
                {transaction.type === "withdrawal" ? (
                  <ArrowDownRight className="w-5 h-5 text-destructive" />
                ) : (
                  <ArrowUpRight
                    className={`w-5 h-5 ${
                      transaction.type === "bonus"
                        ? "text-accent"
                        : "text-success"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {transaction.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.time}
                </p>
              </div>
              <span
                className={`font-bold ${
                  transaction.amount > 0 ? "text-success" : "text-destructive"
                }`}>
                {transaction.amount > 0 ? "+" : ""}₮
                {Math.abs(transaction.amount)?.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
