import { useState } from "react";
import { motion } from "framer-motion";
import { Send, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserPriceInputProps {
  suggestedPrice: number;
  onSubmit: (price: number) => void;
  disabled?: boolean;
}

export function UserPriceInput({
  suggestedPrice,
  onSubmit,
  disabled,
}: UserPriceInputProps) {
  const [price, setPrice] = useState(suggestedPrice.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = () => {
    const numPrice = parseInt(price.replace(/,/g, ""));
    if (numPrice > 0) {
      onSubmit(numPrice);
    }
  };

  const formatPrice = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    return num ? parseInt(num).toLocaleString() : "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-primary/20 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-5 h-5 text-primary" />
        <span className="font-semibold text-foreground">
          Таны санал болгох үнэ
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        Доорх үнийг өөрчилж санал болгох боломжтой
      </p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={isEditing ? price : formatPrice(price)}
            onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Үнэ оруулах"
            className="pr-8 text-lg font-semibold"
            disabled={disabled}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            ₮
          </span>
        </div>
        <Button onClick={handleSubmit} disabled={disabled || !price}>
          <Send className="w-4 h-4 mr-2" />
          Илгээх
        </Button>
      </div>

      <div className="flex gap-2 mt-3">
        {[0.95, 0.9, 0.85].map((multiplier) => {
          const discountPrice = Math.round(suggestedPrice * multiplier);
          return (
            <Button
              key={multiplier}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setPrice(discountPrice.toString())}
              disabled={disabled}>
              {discountPrice.toLocaleString()}₮
              <span className="text-muted-foreground ml-1">
                ({Math.round((1 - multiplier) * 100)}%↓)
              </span>
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
}
