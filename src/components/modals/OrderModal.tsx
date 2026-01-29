import { useState, useEffect } from "react";
import { X, Plus, Minus, User, MapPin, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "@/types";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderCustomer {
  name: string;
  phone: string;
  avatar?: string;
}

interface OrderFormData {
  customer: OrderCustomer;
  items: OrderItem[];
  status: OrderStatus;
  deliveryAddress: string;
  notes?: string;
}

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (order: OrderFormData) => void;
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "negotiating", label: "Тохиролцож байна" },
  { value: "pending", label: "Хүлээгдэж байна" },
  { value: "confirmed", label: "Баталгаажсан" },
  { value: "in_progress", label: "Хүргэж байна" },
];

export function OrderModal({ open, onOpenChange, onSave }: OrderModalProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customer: {
      name: "",
      phone: "",
    },
    items: [{ name: "", quantity: 1, price: 0 }],
    status: "pending",
    deliveryAddress: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        customer: { name: "", phone: "" },
        items: [{ name: "", quantity: 1, price: 0 }],
        status: "pending",
        deliveryAddress: "",
        notes: "",
      });
    }
  }, [open]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", quantity: 1, price: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Шинэ захиалга үүсгэх</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="w-4 h-4 text-primary" />
              Захиалагчийн мэдээлэл
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="customerName">Нэр</Label>
                <Input
                  id="customerName"
                  value={formData.customer.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customer: { ...formData.customer, name: e.target.value },
                    })
                  }
                  placeholder="Захиалагчийн нэр"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Утас</Label>
                <Input
                  id="customerPhone"
                  value={formData.customer.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customer: { ...formData.customer, phone: e.target.value },
                    })
                  }
                  placeholder="99001122"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              Хүргэлтийн хаяг
            </div>
            <Textarea
              value={formData.deliveryAddress}
              onChange={(e) =>
                setFormData({ ...formData, deliveryAddress: e.target.value })
              }
              placeholder="Дүүрэг, хороо, байр, орц, давхар..."
              rows={2}
              required
            />
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Package className="w-4 h-4 text-primary" />
                Бараанууд
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-1" />
                Бараа нэмэх
              </Button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="p-3 bg-muted rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Бараа #{index + 1}
                    </span>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-destructive"
                        onClick={() => handleRemoveItem(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                      }
                      placeholder="Барааны нэр"
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Тоо ширхэг</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() =>
                              handleItemChange(
                                index,
                                "quantity",
                                Math.max(1, item.quantity - 1)
                              )
                            }>
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="text-center w-16"
                            min={1}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() =>
                              handleItemChange(
                                index,
                                "quantity",
                                item.quantity + 1
                              )
                            }>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Нэгж үнэ (₮)</Label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "price",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      Дүн:{" "}
                      <span className="font-medium text-foreground">
                        ₮{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Төлөв</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as OrderStatus })
              }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Нэмэлт тэмдэглэл</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Тэмдэглэл..."
              rows={2}
            />
          </div>

          {/* Total */}
          <div className="p-4 bg-primary/10 rounded-xl flex items-center justify-between">
            <span className="font-medium text-foreground">Нийт дүн:</span>
            <span className="text-2xl font-bold text-primary">
              ₮{calculateTotal().toLocaleString()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}>
              Цуцлах
            </Button>
            <Button type="submit" className="flex-1">
              Захиалга үүсгэх
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
