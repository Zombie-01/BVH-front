import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Edit2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PriceProposalCardProps {
  proposedPrice: number;
  currentPrice?: number;
  senderRole: "user" | "store" | "worker";
  viewerRole: "user" | "store" | "worker";
  onAccept?: (price: number) => void;
  onReject?: () => void;
  onCounter?: (price: number) => void;
  status?: "pending" | "accepted" | "rejected";
}

export function PriceProposalCard({
  proposedPrice,
  currentPrice,
  senderRole,
  viewerRole,
  onAccept,
  onReject,
  onCounter,
  status = "pending",
}: PriceProposalCardProps) {
  const [showCounter, setShowCounter] = useState(false);
  const [counterPrice, setCounterPrice] = useState(proposedPrice.toString());

  const isMyProposal = senderRole === viewerRole;
  const canRespond = !isMyProposal && status === "pending";

  const handleCounter = () => {
    const price = parseInt(counterPrice.replace(/,/g, ""));
    if (price > 0 && onCounter) {
      onCounter(price);
      setShowCounter(false);
    }
  };

  if (status === "accepted") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-500/10 border-2 border-green-500 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-green-600">
          <Check className="w-5 h-5" />
          <span className="font-semibold">Үнэ тохирсон</span>
        </div>
        <p className="text-2xl font-bold text-green-600 mt-2">
          {proposedPrice?.toLocaleString()}₮
        </p>
      </motion.div>
    );
  }

  if (status === "rejected") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 opacity-60">
        <div className="flex items-center gap-2 text-destructive">
          <X className="w-5 h-5" />
          <span className="font-medium line-through">
            {proposedPrice?.toLocaleString()}₮
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Татгалзсан</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 ${
        isMyProposal
          ? "bg-primary/10 border-2 border-primary ml-auto"
          : "bg-card border-2 border-primary"
      }`}>
      <p className="text-sm text-muted-foreground mb-2">
        {isMyProposal ? "Таны үнийн санал" : "Үнийн санал ирлээ"}
      </p>

      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-primary">
          {proposedPrice?.toLocaleString()}₮
        </p>
        {currentPrice && currentPrice !== proposedPrice && (
          <span className="text-sm text-muted-foreground line-through">
            {currentPrice?.toLocaleString()}₮
          </span>
        )}
      </div>

      {canRespond && !showCounter && (
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAccept?.(proposedPrice)}>
            <Check className="w-4 h-4 mr-1" />
            Зөвшөөрөх
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCounter(true)}>
            <Edit2 className="w-4 h-4 mr-1" />
            Өөрчлөх
          </Button>
          <Button size="sm" variant="ghost" onClick={onReject}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {showCounter && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              value={counterPrice}
              onChange={(e) =>
                setCounterPrice(e.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="Шинэ үнэ"
              className="flex-1"
            />
            <span className="flex items-center text-muted-foreground">₮</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleCounter}>
              <Send className="w-4 h-4 mr-1" />
              Илгээх
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCounter(false)}>
              Болих
            </Button>
          </div>
        </motion.div>
      )}

      {isMyProposal && status === "pending" && (
        <p className="text-sm text-muted-foreground mt-3">Хүлээгдэж байна...</p>
      )}
    </motion.div>
  );
}
