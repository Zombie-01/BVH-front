import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, Package, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DealConfirmedCardProps {
  agreedPrice: number;
  storeName?: string;
  orderId?: string;
  showContinueShopping?: boolean;
  onContinueShopping?: () => void;
}

export function DealConfirmedCard({
  agreedPrice,
  storeName,
  orderId,
  showContinueShopping = true,
  onContinueShopping,
}: DealConfirmedCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Үнэ тохирлоо!</h3>
          <p className="text-white/80 text-sm">Захиалга амжилттай үүслээ</p>
        </div>
      </div>

      <div className="bg-white/10 rounded-xl p-4 mb-4">
        <p className="text-white/70 text-sm">Тохирсон үнэ</p>
        <p className="text-3xl font-bold">{agreedPrice?.toLocaleString()}₮</p>
        {storeName && <p className="text-white/80 text-sm mt-1">{storeName}</p>}
      </div>

      <div className="space-y-2">
        {orderId && (
          <Button
            variant="secondary"
            className="w-full bg-white text-green-600 hover:bg-white/90"
            onClick={() => navigate(`/orders/${orderId}`)}>
            <Package className="w-4 h-4 mr-2" />
            Захиалга харах
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        )}

        {showContinueShopping && (
          <Button
            variant="ghost"
            className="w-full text-white hover:bg-white/10"
            onClick={onContinueShopping || (() => navigate("/stores"))}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Өөр дэлгүүрээс захиалах
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
