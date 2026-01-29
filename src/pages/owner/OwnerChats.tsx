import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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

interface ChatPreview {
  id: string;
  customer: {
    name: string;
    avatar: string;
  };
  lastMessage: string;
  unread: number;
  status: "negotiating" | "agreed" | "completed";
  items?: string[];
  expectedPrice?: number;
  updatedAt: Date;
}

const mockChats: ChatPreview[] = [
  {
    id: "1",
    customer: {
      name: "Батболд Д.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    },
    lastMessage: "Энэ барааны үнийг бага зэрэг хямдруулах боломжтой юу?",
    unread: 3,
    status: "negotiating",
    items: ["Цемент ПЦ-400 x10", "Элс x2"],
    expectedPrice: 355000,
    updatedAt: new Date("2024-01-17T10:30:00"),
  },
  {
    id: "2",
    customer: {
      name: "Мөнхжин С.",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    },
    lastMessage: "Хүргэлт хэзээ ирэх вэ?",
    unread: 1,
    status: "agreed",
    items: ["Кабель ВВГ 3x2.5 x100м"],
    expectedPrice: 350000,
    updatedAt: new Date("2024-01-17T09:15:00"),
  },
  {
    id: "3",
    customer: {
      name: "Оюунтөгс Б.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    },
    lastMessage: "Баярлалаа, бараа ирлээ.",
    unread: 0,
    status: "completed",
    items: ["Арматур 12мм x20м"],
    expectedPrice: 90000,
    updatedAt: new Date("2024-01-16T16:00:00"),
  },
  {
    id: "4",
    customer: {
      name: "Болд Т.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    },
    lastMessage: "Ойлголоо, баярлалаа!",
    unread: 0,
    status: "negotiating",
    items: ["Тоосго x1000ш"],
    expectedPrice: 450000,
    updatedAt: new Date("2024-01-16T14:30:00"),
  },
];

const statusConfig = {
  negotiating: { label: "Тохиролцож байна", color: "bg-warning" },
  agreed: { label: "Тохирсон", color: "bg-success" },
  completed: { label: "Дууссан", color: "bg-muted" },
};

export default function OwnerChats() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "negotiating">("all");

  const filteredChats = mockChats.filter((chat) => {
    const matchesSearch =
      chat.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "unread") return matchesSearch && chat.unread > 0;
    if (filter === "negotiating")
      return matchesSearch && chat.status === "negotiating";
    return matchesSearch;
  });

  const unreadCount = mockChats.reduce((sum, c) => sum + c.unread, 0);
  const negotiatingCount = mockChats.filter(
    (c) => c.status === "negotiating"
  ).length;

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
                          : "text-muted-foreground"
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
                          ~₮{chat.expectedPrice.toLocaleString()}
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
