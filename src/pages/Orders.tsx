import { useState } from "react";
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
import { mockOrders } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";

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
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredOrders = mockOrders.filter((order) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") {
      return ["negotiating", "pending", "confirmed", "in_progress"].includes(
        order.status
      );
    }
    if (activeFilter === "completed") {
      return ["completed", "cancelled"].includes(order.status);
    }
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
          <h1 className="text-2xl font-bold text-foreground">
            Миний захиалгууд
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Бүх захиалга болон хүргэлтүүд
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex gap-2">
          <Badge
            variant={activeFilter === "all" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setActiveFilter("all")}>
            Бүгд ({mockOrders.length})
          </Badge>
          <Badge
            variant={activeFilter === "active" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setActiveFilter("active")}>
            Идэвхтэй (
            {
              mockOrders.filter((o) =>
                ["negotiating", "pending", "confirmed", "in_progress"].includes(
                  o.status
                )
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
              mockOrders.filter((o) =>
                ["completed", "cancelled"].includes(o.status)
              ).length
            }
            )
          </Badge>
        </div>
      </header>

      {/* Orders List */}
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
                      status.color
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
                          )
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
                    "text-white"
                  )}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </div>
                <div className="text-right">
                  {order.agreedPrice ? (
                    <span className="font-bold text-foreground">
                      {order.agreedPrice.toLocaleString()}₮
                    </span>
                  ) : (
                    <span className="font-bold text-muted-foreground">
                      ~{order.expectedPrice.toLocaleString()}₮
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
            <h3 className="font-semibold text-foreground">Захиалга байхгүй</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Та одоогоор захиалга хийгээгүй байна
            </p>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
