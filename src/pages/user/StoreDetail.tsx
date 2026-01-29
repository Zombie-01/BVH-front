import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  MessageCircle,
  Plus,
  Minus,
  ShoppingCart,
  Phone,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockStores, mockProducts } from "@/data/mockData";
import { OrderItem } from "@/types";

interface CartItem {
  productId: string;
  quantity: number;
}

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);

  const store = mockStores.find((s) => s.id === id);
  const products = mockProducts.filter((p) => p.storeId === id);

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Дэлгүүр олдсонгүй</p>
      </div>
    );
  }

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter((item) => item.productId !== productId);
    });
  };

  const getCartQuantity = (productId: string) => {
    return cart.find((item) => item.productId === productId)?.quantity || 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const handleCheckout = () => {
    if (cart.length > 0) {
      // Create order items with images
      const orderItems: OrderItem[] = cart.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
          image: product.image,
        };
      });

      // Navigate to chat with products
      navigate(`/chat/new-${store.id}`, {
        state: {
          type: "store",
          name: store.name,
          storeId: store.id,
          items: orderItems,
          expectedPrice: totalAmount,
        },
      });
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/stores/${id}/products/${productId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Desktop/Tablet Layout */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Store Info */}
          <div className="lg:col-span-2">
            {/* Header Image */}
            <div className="relative h-56 md:h-72 lg:h-80 lg:rounded-2xl lg:overflow-hidden lg:mt-6 lg:mx-6">
              <img
                src={store.image}
                alt={store.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>

              {/* Chat Button */}
              <button
                onClick={() =>
                  navigate(`/chat/new-${store.id}`, {
                    state: {
                      type: "store",
                      name: store.name,
                      storeId: store.id,
                      items: [],
                      expectedPrice: 0,
                    },
                  })
                }
                className="absolute top-4 right-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>

            {/* Store Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 lg:px-6 -mt-8 relative z-10">
              <div className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">
                      {store.name}
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base mt-1">
                      {store.description}
                    </p>
                  </div>
                  <Badge variant={store.isOpen ? "default" : "secondary"}>
                    {store.isOpen ? "Нээлттэй" : "Хаалттай"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{store.rating}</span>
                    <span className="text-muted-foreground text-sm">
                      ({store.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{store.location}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Залгах
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      navigate(`/chat/new-${store.id}`, {
                        state: {
                          type: "store",
                          name: store.name,
                          storeId: store.id,
                          items: [],
                          expectedPrice: 0,
                        },
                      })
                    }>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Чат
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Products */}
            <div className="px-4 lg:px-6 mt-6">
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">
                Бүтээгдэхүүн ({products.length})
              </h2>

              {products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Бүтээгдэхүүн байхгүй байна
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {products.map((product, index) => {
                    const quantity = getCartQuantity(product.id);

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card rounded-xl p-3 border border-border flex gap-3">
                        <button
                          onClick={() => handleProductClick(product.id)}
                          className="relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                            <ChevronRight className="w-5 h-5 text-white opacity-0 hover:opacity-100" />
                          </div>
                        </button>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => handleProductClick(product.id)}
                            className="text-left">
                            <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                          </button>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <span className="font-bold text-primary">
                                {product.price.toLocaleString()}₮
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">
                                /{product.unit}
                              </span>
                            </div>
                            {!product.inStock ? (
                              <Badge variant="secondary">Дууссан</Badge>
                            ) : quantity > 0 ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => removeFromCart(product.id)}
                                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-semibold w-6 text-center">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => addToCart(product.id)}
                                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => addToCart(product.id)}>
                                <Plus className="w-4 h-4 mr-1" />
                                Нэмэх
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Cart Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 mt-6 mr-6">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
                <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Сагс
                </h3>

                {totalItems === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Сагс хоосон байна
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                      {cart.map((item) => {
                        const product = products.find(
                          (p) => p.id === item.productId
                        );
                        if (!product) return null;
                        return (
                          <div
                            key={item.productId}
                            className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} x{" "}
                                {product.price.toLocaleString()}₮
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-muted-foreground">
                          {totalItems} бараа
                        </span>
                        <span className="font-bold text-xl text-primary">
                          {totalAmount.toLocaleString()}₮
                        </span>
                      </div>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCheckout}>
                        Захиалга өгөх
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Footer */}
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-bottom lg:hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">{totalItems} бараа</span>
            </div>
            <span className="font-bold text-lg">
              {totalAmount.toLocaleString()}₮
            </span>
          </div>
          <Button className="w-full" size="lg" onClick={handleCheckout}>
            Захиалга өгөх
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default StoreDetail;
