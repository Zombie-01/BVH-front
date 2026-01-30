import { useState } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OwnerOrder {
  id: string;
  customer: {
    id?: string | null;
    name?: string | null;
    avatar?: string | null;
    phone?: string | null;
  };
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number | null;
  deliveryAddress: string | null;
  createdAt: string | null;
  driver?:
    | { id?: string | null; name?: string | null; phone?: string | null }
    | undefined;
}

interface OrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OwnerOrder | null;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  negotiating: {
    label: "Тохиролцож байна",
    color: "bg-warning",
    icon: MessageCircle,
  },
  pending: { label: "Хүлээгдэж байна", color: "bg-warning", icon: Clock },
  confirmed: { label: "Баталгаажсан", color: "bg-primary", icon: CheckCircle },
  in_progress: { label: "Хүргэж байна", color: "bg-success", icon: Truck },
  completed: { label: "Дууссан", color: "bg-muted", icon: CheckCircle },
  cancelled: { label: "Цуцлагдсан", color: "bg-destructive", icon: XCircle },
};

export function OrderDetailModal({
  open,
  onOpenChange,
  order,
  onUpdateStatus,
}: OrderDetailModalProps) {
  if (!order) return null;

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const handleStatusChange = (newStatus: OrderStatus) => {
    onUpdateStatus(order.id, newStatus);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Захиалга #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Төлөв</span>
            <Badge className={cn(status.color, "text-white gap-1")}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </Badge>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Захиалагч
            </h4>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <img
                src={order.customer.avatar}
                alt={order.customer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {order.customer.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.phone}
                </p>
              </div>
              <Button size="icon" variant="outline">
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Хүргэлтийн хаяг
            </h4>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-xl">
              {order.deliveryAddress}
            </p>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Захиалсан бараа</h4>
            <div className="bg-muted rounded-xl p-3 space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="text-muted-foreground">
                    ₮{(item.price * item.quantity)?.toLocaleString()}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between font-medium">
                <span className="text-foreground">Нийт дүн</span>
                <span className="text-primary">
                  ₮{order.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Driver Info */}
          {order.driver && (
            <div className="space-y-2">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-success" />
                Жолооч
              </h4>
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl">
                <div>
                  <p className="font-medium text-foreground">
                    {order.driver.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.driver.phone}
                  </p>
                </div>
                <Button size="icon" variant="outline">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Үйлдэл</h4>
            <div className="grid grid-cols-2 gap-2">
              {order.status === "negotiating" && (
                <>
                  <Button
                    onClick={() => handleStatusChange("confirmed")}
                    className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Батлах
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusChange("cancelled")}
                    className="w-full">
                    <XCircle className="w-4 h-4 mr-2" />
                    Цуцлах
                  </Button>
                </>
              )}
              {order.status === "confirmed" && order.driver && (
                <Button
                  onClick={() => handleStatusChange("in_progress")}
                  className="w-full col-span-2">
                  <Truck className="w-4 h-4 mr-2" />
                  Хүргэлт эхлүүлэх
                </Button>
              )}
              {order.status === "in_progress" && (
                <Button
                  onClick={() => handleStatusChange("completed")}
                  className="w-full col-span-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Дуусгах
                </Button>
              )}
            </div>
          </div>

          {/* Chat Button */}
          <Button variant="outline" className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Захиалагчтай чат
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
