import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  User,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  Store,
  ServiceWorker,
  Order as AppOrder,
  OrderItem,
} from "@/types";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<AppOrder | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [worker, setWorker] = useState<ServiceWorker | null>(null);
  const [chat, setChat] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const { data: orderRow } = (await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["orders"]["Row"] | null;
        error: unknown;
      };

      if (!mounted) return;
      if (!orderRow) {
        setOrder(null);
        setLoading(false);
        return;
      }

      const { data: items } = (await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id)) as {
        data: Database["public"]["Tables"]["order_items"]["Row"][] | null;
        error: unknown;
      };

      const mappedItems: OrderItem[] = (items ?? []).map((i) => ({
        productId: i.product_id ?? "",
        productName: i.product_name,
        quantity: i.quantity,
        price: i.price,
        image: i.image ?? undefined,
      }));

      const mappedOrder: AppOrder = {
        id: orderRow.id,
        chatId: orderRow.chat_id ?? "",
        userId: orderRow.user_id ?? "",
        storeId: orderRow.store_id ?? undefined,
        workerId: orderRow.worker_id ?? undefined,
        driverId: orderRow.driver_id ?? undefined,
        type: (orderRow.type as unknown as AppOrder["type"]) ?? "delivery",
        status: orderRow.status as AppOrder["status"],
        items: mappedItems,
        expectedPrice: orderRow.expected_price ?? 0,
        agreedPrice: orderRow.agreed_price ?? undefined,
        totalAmount: orderRow.total_amount ?? 0,
        deliveryAddress: orderRow.delivery_address ?? undefined,
        serviceDescription: orderRow.service_description ?? undefined,
        createdAt: orderRow.created_at
          ? new Date(orderRow.created_at)
          : new Date(),
        confirmedAt: orderRow.confirmed_at
          ? new Date(orderRow.confirmed_at)
          : undefined,
      };

      setOrder(mappedOrder);

      if (orderRow.store_id) {
        const { data: storeRow } = (await supabase
          .from("stores")
          .select("*")
          .eq("id", orderRow.store_id)
          .maybeSingle()) as {
          data: Database["public"]["Tables"]["stores"]["Row"] | null;
          error: unknown;
        };
        if (storeRow) {
          setStore({
            id: storeRow.id,
            name: storeRow.name,
            description: storeRow.description ?? "",
            image: storeRow.image ?? "",
            rating: storeRow.rating ?? 0,
            reviewCount: storeRow.review_count ?? 0,
            category:
              (storeRow.categories && storeRow.categories[0]) || "other",
            location: storeRow.location ?? "",
            isOpen: storeRow.is_open,
            phone: storeRow.phone ?? undefined,
          });
        }
      }

      if (orderRow.worker_id) {
        const { data: workerRow } = (await supabase
          .from("service_workers")
          .select("*")
          .eq("id", orderRow.worker_id)
          .maybeSingle()) as {
          data: Database["public"]["Tables"]["service_workers"]["Row"] | null;
          error: unknown;
        };
        if (workerRow) {
          setWorker({
            id: workerRow.id,
            name: "",
            avatar: "",
            specialty: workerRow.specialty,
            rating: workerRow.rating ?? 0,
            completedJobs: workerRow.completed_jobs ?? 0,
            badges: workerRow.badges ?? [],
            hourlyRate: workerRow.hourly_rate ?? 0,
            isAvailable: workerRow.is_available,
          });
        }
      }

      if (orderRow.chat_id) setChat({ id: orderRow.chat_id });

      setLoading(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!order && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Захиалга олдсонгүй</p>
      </div>
    );
  }

  // Guard for TypeScript — if we're still loading, render nothing until order is available
  if (!order) return null;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "negotiating":
        return {
          label: "Тохиролцож байна",
          color: "bg-yellow-500",
          icon: MessageCircle,
        };
      case "pending":
        return { label: "Хүлээгдэж буй", color: "bg-yellow-500", icon: Clock };
      case "confirmed":
        return {
          label: "Баталгаажсан",
          color: "bg-blue-500",
          icon: CheckCircle,
        };
      case "in_progress":
        return { label: "Хүргэлтэнд", color: "bg-primary", icon: Truck };
      case "completed":
        return { label: "Дууссан", color: "bg-green-500", icon: CheckCircle };
      case "cancelled":
        return { label: "Цуцлагдсан", color: "bg-red-500", icon: Clock };
      default:
        return { label: status, color: "bg-gray-500", icon: Clock };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  // Timeline for delivery orders
  const deliveryTimeline = [
    { id: 1, title: "Тохиролцсон", completed: order.status !== "negotiating" },
    {
      id: 2,
      title: "Захиалга баталгаажсан",
      completed: ["confirmed", "in_progress", "completed"].includes(
        order.status,
      ),
    },
    {
      id: 3,
      title: "Жолооч авсан",
      completed: ["in_progress", "completed"].includes(order.status),
    },
    {
      id: 4,
      title: "Хүргэлтэнд гарсан",
      completed: ["in_progress", "completed"].includes(order.status),
    },
    { id: 5, title: "Хүргэгдсэн", completed: order.status === "completed" },
  ];

  // Timeline for service orders
  const serviceTimeline = [
    {
      id: 1,
      title: "Тохиролцож байна",
      completed: order.status !== "negotiating",
    },
    {
      id: 2,
      title: "Үнэ тохирсон",
      completed: ["confirmed", "in_progress", "completed"].includes(
        order.status,
      ),
    },
    {
      id: 3,
      title: "Ажил эхэлсэн",
      completed: ["in_progress", "completed"].includes(order.status),
    },
    { id: 4, title: "Дууссан", completed: order.status === "completed" },
  ];

  const timeline =
    order.type === "delivery" ? deliveryTimeline : serviceTimeline;

  const handleOpenChat = () => {
    if (chat) {
      navigate(`/chat/${chat.id}`, {
        state: {
          type: order.type === "delivery" ? "store" : "service",
          name: store?.name || worker?.name,
          storeId: store?.id,
          workerId: worker?.id,
          items: order.items,
          expectedPrice: order.expectedPrice,
          serviceDescription: order.serviceDescription,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 px-4 lg:px-6 pt-4 pb-6 lg:rounded-2xl lg:mt-6 lg:mx-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-lg">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Захиалга #{order.id}
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("mn-MN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Status Card */}
            <div className="px-4 lg:px-6 -mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${statusInfo.color} flex items-center justify-center`}>
                      <StatusIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-lg">
                        {statusInfo.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.type === "delivery" ? "Хүргэлт" : "Үйлчилгээ"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {order.agreedPrice ? (
                      <>
                        <Badge variant="default" className="bg-green-500 mb-1">
                          Тохирсон
                        </Badge>
                        <p className="text-lg md:text-xl font-bold text-foreground">
                          {order.agreedPrice?.toLocaleString()}₮
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Хүлээгдэж буй
                        </p>
                        <p className="text-lg md:text-xl font-bold text-foreground">
                          ~{order.expectedPrice?.toLocaleString()}₮
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Chat Button */}
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handleOpenChat}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Чат харах
                </Button>
              </motion.div>
            </div>

            {/* Store/Worker Info */}
            {(store || worker) && (
              <div className="px-4 lg:px-6 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <img
                      src={store?.image || worker?.avatar || ""}
                      alt={store?.name || worker?.name || ""}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {store?.name || worker?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {store ? store.location : worker?.specialty}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Service Description */}
            {order.serviceDescription && (
              <div className="px-4 lg:px-6 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Ажлын тайлбар
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.serviceDescription}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div className="px-4 lg:px-6 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Хүргэлтийн хаяг
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.deliveryAddress}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Driver Info */}
            {order.driverId && (
              <div className="px-4 lg:px-6 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.17 }}
                  className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Жолооч</p>
                      <p className="text-sm text-muted-foreground">
                        Хүргэлт хийж байна
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-1" />
                      Залгах
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="px-4 lg:px-6 mt-6">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Барааны жагсаалт
                </h2>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  {order.items.map((item, index) => (
                    <div
                      key={item.productId}
                      className={`flex items-center gap-3 p-4 ${
                        index < order.items!.length - 1
                          ? "border-b border-border"
                          : ""
                      }`}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {item.productName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {item.price?.toLocaleString()}₮
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        {(item.price * item.quantity)?.toLocaleString()}₮
                      </p>
                    </div>
                  ))}
                  <div className="p-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        Нийт дүн
                      </span>
                      <span className="font-bold text-lg text-primary">
                        {(
                          order.agreedPrice ||
                          order.totalAmount ||
                          order.expectedPrice
                        )?.toLocaleString()}
                        ₮
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Timeline & Actions */}
          <div className="lg:col-span-1 px-4 lg:px-0 mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-6 lg:mr-6 space-y-6">
              {/* Timeline */}
              <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Явц</h2>
                <div className="space-y-4">
                  {timeline.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}>
                          {step.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        {index < timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-8 ${step.completed ? "bg-primary" : "bg-muted"}`}
                          />
                        )}
                      </div>
                      <div className="pt-1">
                        <p
                          className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.title}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {order.status === "completed" && (
                <Button className="w-full" size="lg">
                  <Star className="w-5 h-5 mr-2" />
                  Үнэлгээ өгөх
                </Button>
              )}

              {order.status === "negotiating" && (
                <Button variant="destructive" className="w-full" size="lg">
                  Захиалга цуцлах
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
