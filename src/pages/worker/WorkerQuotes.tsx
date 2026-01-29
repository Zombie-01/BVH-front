import { useState } from "react";
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

interface Quote {
  id: string;
  jobTitle: string;
  customerName: string;
  customerAvatar: string;
  quotedPrice: number;
  customerBudget: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  sentAt: Date;
  expiresAt: Date;
  notes?: string;
}

const mockQuotes: Quote[] = [
  {
    id: "1",
    jobTitle: "Гал тогооны цахилгаан",
    customerName: "Оюунтөгс Б.",
    customerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    quotedPrice: 180000,
    customerBudget: 200000,
    status: "pending",
    sentAt: new Date("2024-01-15"),
    expiresAt: new Date("2024-01-22"),
    notes: "Материалын зардал багтсан",
  },
  {
    id: "2",
    jobTitle: "Байшингийн утас шинэчлэх",
    customerName: "Энхбаяр Г.",
    customerAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    quotedPrice: 450000,
    customerBudget: 500000,
    status: "accepted",
    sentAt: new Date("2024-01-14"),
    expiresAt: new Date("2024-01-21"),
    notes: "2 өдөрт дуусгана",
  },
  {
    id: "3",
    jobTitle: "LED гэрэлтүүлэг суурилуулах",
    customerName: "Мөнхжин С.",
    customerAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    quotedPrice: 100000,
    customerBudget: 120000,
    status: "accepted",
    sentAt: new Date("2024-01-13"),
    expiresAt: new Date("2024-01-20"),
  },
  {
    id: "4",
    jobTitle: "Оффисын цахилгаан засвар",
    customerName: "Болд Т.",
    customerAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    quotedPrice: 250000,
    customerBudget: 200000,
    status: "rejected",
    sentAt: new Date("2024-01-10"),
    expiresAt: new Date("2024-01-17"),
    notes: "Үнэ өндөр гэж татгалзсан",
  },
];

const statusConfig = {
  pending: { label: "Хүлээгдэж байна", color: "bg-warning", icon: Clock },
  accepted: { label: "Батлагдсан", color: "bg-success", icon: CheckCircle },
  rejected: { label: "Татгалзсан", color: "bg-destructive", icon: XCircle },
  expired: { label: "Хугацаа дууссан", color: "bg-muted", icon: Clock },
};

export default function WorkerQuotes() {
  const [filter, setFilter] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("all");

  const filteredQuotes = mockQuotes.filter((quote) => {
    if (filter === "all") return true;
    return quote.status === filter;
  });

  const pendingCount = mockQuotes.filter((q) => q.status === "pending").length;
  const acceptedCount = mockQuotes.filter(
    (q) => q.status === "accepted"
  ).length;
  const totalQuoted = mockQuotes.reduce((sum, q) => sum + q.quotedPrice, 0);

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

      {/* Quotes List */}
      <section className="px-4 pb-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredQuotes.map((quote, index) => {
            const status = statusConfig[quote.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-card rounded-2xl p-4 shadow-card">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={quote.customerAvatar}
                      alt={quote.customerName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {quote.customerName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {quote.jobTitle}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={cn(status.color, "text-white text-xs gap-1")}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </Badge>
                </div>

                {/* Price Comparison */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">
                      Хэрэглэгчийн төсөв
                    </p>
                    <span className="font-bold text-foreground">
                      ₮{quote.customerBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-primary/10 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Миний үнэ</p>
                    <span className="font-bold text-primary">
                      ₮{quote.quotedPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {quote.notes && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                    <p className="text-sm text-muted-foreground">
                      {quote.notes}
                    </p>
                  </div>
                )}

                {/* Dates */}
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Send className="w-4 h-4" />
                    <span>
                      {new Date(quote.sentAt).toLocaleDateString("mn-MN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Хүчинтэй:{" "}
                      {new Date(quote.expiresAt).toLocaleDateString("mn-MN")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {quote.status === "pending" && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Засах
                    </Button>
                    <Button variant="destructive" size="sm">
                      Цуцлах
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-foreground">
              Үнийн санал байхгүй
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Одоогоор илгээсэн үнийн санал байхгүй байна
            </p>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
