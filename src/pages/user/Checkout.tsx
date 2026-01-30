import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { mockProducts } from "@/data/mockData";

interface CartItem {
  productId: string;
  quantity: number;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cart = [],
    storeId,
    storeName,
    totalAmount = 0,
  } = (location.state as {
    cart: CartItem[];
    storeId: string;
    storeName: string;
    totalAmount: number;
  }) || {};

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // Calculate delivery fee based on option
  const deliveryFees = {
    standard: 15000,
    express: 25000,
    pickup: 0,
  };

  const deliveryFee = deliveryFees[deliveryOption as keyof typeof deliveryFees];
  const grandTotal = totalAmount + deliveryFee;

  const cartProducts = cart
    .map((item) => {
      const product = mockProducts.find((p) => p.id === item.productId);
      return { ...item, product };
    })
    .filter((item) => item.product);

  const handlePlaceOrder = () => {
    setIsOrderPlaced(true);
  };

  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl p-8 text-center max-w-sm w-full shadow-lg border border-border">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Захиалга амжилттай!
          </h1>
          <p className="text-muted-foreground mb-6">
            Таны захиалга амжилттай баталгаажлаа. Удахгүй хүргэлт эхлэх болно.
          </p>
          <div className="bg-muted rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground">Захиалгын дугаар</p>
            <p className="text-xl font-bold text-foreground">
              #ORD-{Date.now().toString().slice(-6)}
            </p>
          </div>
          <div className="space-y-3">
            <Button className="w-full" onClick={() => navigate("/orders")}>
              Захиалга харах
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/home")}>
              Нүүр хуудас
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 lg:px-6 py-4 flex items-center gap-4 safe-area-top lg:rounded-t-2xl lg:mt-6 lg:mx-6 lg:border-x">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
            className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Захиалга баталгаажуулах
            </h1>
            <p className="text-sm text-muted-foreground">{storeName}</p>
          </div>
        </div>

        <div className="lg:mx-6 lg:border-x lg:border-b lg:border-border lg:rounded-b-2xl lg:bg-card">
          {/* Progress */}
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-12 md:w-20 h-1 mx-2 ${step > s ? "bg-primary" : "bg-muted"}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 max-w-md mx-auto">
              <span className="text-xs text-muted-foreground">Хүргэлт</span>
              <span className="text-xs text-muted-foreground">Хаяг</span>
              <span className="text-xs text-muted-foreground">
                Баталгаажуулах
              </span>
            </div>
          </div>

          {/* Step 1: Delivery Option */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 lg:px-6 pb-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Хүргэлтийн төрөл
              </h2>
              <RadioGroup
                value={deliveryOption}
                onValueChange={setDeliveryOption}
                className="space-y-3">
                <div
                  className={`bg-card lg:bg-muted/30 rounded-xl p-4 border-2 cursor-pointer transition-colors ${
                    deliveryOption === "standard"
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">
                            Энгийн хүргэлт
                          </p>
                          <p className="text-sm text-muted-foreground">
                            2-4 цагийн дотор
                          </p>
                        </div>
                        <span className="font-bold text-primary">15,000₮</span>
                      </div>
                    </Label>
                  </div>
                </div>

                <div
                  className={`bg-card lg:bg-muted/30 rounded-xl p-4 border-2 cursor-pointer transition-colors ${
                    deliveryOption === "express"
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">
                            Шуурхай хүргэлт
                          </p>
                          <p className="text-sm text-muted-foreground">
                            1 цагийн дотор
                          </p>
                        </div>
                        <span className="font-bold text-primary">25,000₮</span>
                      </div>
                    </Label>
                  </div>
                </div>

                <div
                  className={`bg-card lg:bg-muted/30 rounded-xl p-4 border-2 cursor-pointer transition-colors ${
                    deliveryOption === "pickup"
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">
                            Өөрөө авах
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Дэлгүүрээс очиж авах
                          </p>
                        </div>
                        <span className="font-bold text-green-600">Үнэгүй</span>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={() => setStep(2)}>
                Үргэлжлүүлэх
              </Button>
            </motion.div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 lg:px-6 pb-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                {deliveryOption === "pickup"
                  ? "Холбоо барих мэдээлэл"
                  : "Хүргэлтийн хаяг"}
              </h2>

              <div className="space-y-4">
                {deliveryOption !== "pickup" && (
                  <div>
                    <Label htmlFor="address">Хаяг</Label>
                    <Textarea
                      id="address"
                      placeholder="Дүүрэг, хороо, байр, тоот..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="phone">Утасны дугаар</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="99xxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Нэмэлт тайлбар (сонголтот)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Орцны код, тусгай зааварчилгаа..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={() => setStep(3)}
                disabled={!phone || (deliveryOption !== "pickup" && !address)}>
                Үргэлжлүүлэх
              </Button>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 lg:px-6 pb-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Захиалга баталгаажуулах
              </h2>

              <div className="lg:grid lg:grid-cols-2 lg:gap-6">
                <div>
                  {/* Items */}
                  <div className="bg-card lg:bg-muted/30 rounded-xl border border-border overflow-hidden mb-4">
                    <div className="p-3 bg-muted/50 border-b border-border">
                      <h3 className="font-semibold text-foreground">
                        {storeName}
                      </h3>
                    </div>
                    {cartProducts.map(({ product, quantity }) => (
                      <div
                        key={product?.id}
                        className="flex items-center gap-3 p-3 border-b border-border last:border-0">
                        <Package className="w-8 h-8 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {product?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {quantity} x {product?.price?.toLocaleString()}₮
                          </p>
                        </div>
                        <span className="font-semibold">
                          {((product?.price || 0) * quantity)?.toLocaleString()}
                          ₮
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-card lg:bg-muted/30 rounded-xl border border-border p-4 mb-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">
                          {deliveryOption === "standard"
                            ? "Энгийн хүргэлт"
                            : deliveryOption === "express"
                              ? "Шуурхай хүргэлт"
                              : "Өөрөө авах"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {deliveryOption === "standard"
                            ? "2-4 цагийн дотор"
                            : deliveryOption === "express"
                              ? "1 цагийн дотор"
                              : "Дэлгүүрээс"}
                        </p>
                      </div>
                    </div>

                    {deliveryOption !== "pickup" && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Хаяг</p>
                          <p className="text-sm text-muted-foreground">
                            {address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {/* Summary */}
                  <div className="bg-card lg:bg-muted/30 rounded-xl border border-border p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Барааны дүн</span>
                      <span className="font-medium">
                        {totalAmount?.toLocaleString()}₮
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Хүргэлтийн төлбөр
                      </span>
                      <span className="font-medium">
                        {deliveryFee?.toLocaleString()}₮
                      </span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="font-bold text-foreground">
                        Нийт дүн
                      </span>
                      <span className="font-bold text-lg text-primary">
                        {grandTotal?.toLocaleString()}₮
                      </span>
                    </div>
                  </div>

                  {/* Payment Note */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Төлбөр</p>
                        <p className="text-sm text-muted-foreground">
                          Төлбөрийг бараа хүлээж авах үед бэлнээр эсвэл
                          шилжүүлгээр төлнө.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6"
                    size="lg"
                    onClick={handlePlaceOrder}>
                    Захиалга баталгаажуулах
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
