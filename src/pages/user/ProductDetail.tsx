import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, ShoppingCart, Share, Heart, Star, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockProducts, mockStores } from '@/data/mockData';

const ProductDetail = () => {
  const { storeId, productId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const product = mockProducts.find(p => p.id === productId && p.storeId === storeId);
  const store = mockStores.find(s => s.id === storeId);
  
  if (!product || !store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Бүтээгдэхүүн олдсонгүй</p>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  const handleAddToCart = () => {
    // Navigate to chat with product info
    navigate(`/chat/new-${store.id}`, {
      state: {
        type: 'store',
        name: store.name,
        storeId: store.id,
        items: [{
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          price: product.price,
          image: product.image,
        }],
        expectedPrice: totalPrice,
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:p-6">
          {/* Left - Image */}
          <div className="relative h-72 md:h-96 lg:h-[500px] bg-muted lg:rounded-2xl lg:overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {/* Back Button */}
            <button 
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg safe-area-top"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            
            {/* Actions */}
            <div className="absolute top-4 right-4 flex gap-2 safe-area-top">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                  isFavorite ? 'bg-red-500' : 'bg-white/90'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'text-white fill-white' : 'text-foreground'}`} />
              </button>
              <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                <Share className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Stock Badge */}
            <div className="absolute bottom-4 left-4">
              <Badge variant={product.inStock ? 'default' : 'destructive'}>
                {product.inStock ? 'Нөөцөд байгаа' : 'Дууссан'}
              </Badge>
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="lg:py-4">
            {/* Product Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 lg:px-0 -mt-6 lg:mt-0 relative z-10"
            >
              <div className="bg-card rounded-2xl p-4 md:p-6 shadow-lg lg:shadow-none border border-border lg:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">{product.name}</h1>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-2xl md:text-3xl font-bold text-primary">{product.price.toLocaleString()}₮</span>
                    <span className="text-sm text-muted-foreground ml-1">/{product.unit}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Store Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="px-4 lg:px-0 mt-4"
            >
              <button 
                onClick={() => navigate(`/stores/${store.id}`)}
                className="w-full bg-card rounded-xl p-3 md:p-4 border border-border flex items-center gap-3 hover:bg-muted transition-colors"
              >
                <img src={store.image} alt={store.name} className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover" />
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground">{store.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-muted-foreground">{store.rating} • {store.location}</span>
                  </div>
                </div>
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </motion.div>

            {/* Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="px-4 lg:px-0 mt-4"
            >
              <h2 className="font-bold text-foreground mb-2">Тайлбар</h2>
              <p className="text-muted-foreground text-sm md:text-base">{product.description}</p>
            </motion.div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="px-4 lg:px-0 mt-4"
              >
                <h2 className="font-bold text-foreground mb-3">Техникийн үзүүлэлт</h2>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  {product.specifications.map((spec, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-3 md:p-4 ${
                        index < product.specifications!.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <span className="text-muted-foreground text-sm">{spec.label}</span>
                      <span className="font-medium text-foreground text-sm">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Desktop Purchase Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="hidden lg:block px-0 mt-6"
            >
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-3 bg-muted rounded-full p-1">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm text-muted-foreground">Нийт үнэ</p>
                    <p className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()}₮</p>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  size="lg" 
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Захиалга өгөх
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Mobile Footer */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-bottom lg:hidden"
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-3 bg-muted rounded-full p-1">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-lg w-8 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 text-right">
            <p className="text-sm text-muted-foreground">Нийт үнэ</p>
            <p className="text-xl font-bold text-primary">{totalPrice.toLocaleString()}₮</p>
          </div>
        </div>
        <Button 
          className="w-full" 
          size="lg" 
          disabled={!product.inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Захиалга өгөх
        </Button>
      </motion.div>
    </div>
  );
};

export default ProductDetail;
