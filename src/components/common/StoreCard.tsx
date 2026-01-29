import { Star, MapPin, Clock } from "lucide-react";
import { Store } from "@/types";
import { cn } from "@/lib/utils";

interface StoreCardProps {
  store: Store;
  variant?: "default" | "compact" | "featured";
  onClick?: () => void;
}

export function StoreCard({
  store,
  variant = "default",
  onClick,
}: StoreCardProps) {
  if (variant === "compact") {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-card touch-feedback w-full text-left">
        <img
          src={store.image}
          alt={store.name}
          className="w-14 h-14 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">
            {store.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
            <span className="text-xs text-muted-foreground">
              {store.rating} ({store.reviewCount})
            </span>
          </div>
        </div>
        <div
          className={cn(
            "px-2 py-1 rounded-full text-2xs font-medium",
            store.isOpen
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          )}>
          {store.isOpen ? "Нээлттэй" : "Хаалттай"}
        </div>
      </button>
    );
  }

  if (variant === "featured") {
    return (
      <button
        onClick={onClick}
        className="relative w-72 h-44 rounded-2xl overflow-hidden shadow-elevated touch-feedback flex-shrink-0">
        <img
          src={store.image}
          alt={store.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium mb-2",
              store.isOpen
                ? "bg-success text-success-foreground"
                : "bg-muted text-muted-foreground"
            )}>
            <Clock className="w-3 h-3" />
            {store.isOpen ? "Нээлттэй" : "Хаалттай"}
          </div>
          <h3 className="font-bold text-primary-foreground text-lg leading-tight">
            {store.name}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-primary-foreground/80">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-accent fill-accent" />
              <span className="text-xs font-medium">{store.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs truncate max-w-[120px]">
                {store.location}
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="bg-card rounded-2xl overflow-hidden shadow-card touch-feedback w-full text-left">
      <div className="relative h-32">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover"
        />
        <div
          className={cn(
            "absolute top-3 right-3 px-2 py-1 rounded-full text-2xs font-medium",
            store.isOpen
              ? "bg-success text-success-foreground"
              : "bg-muted text-muted-foreground"
          )}>
          {store.isOpen ? "Нээлттэй" : "Хаалттай"}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-foreground">{store.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
          {store.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-sm font-semibold">{store.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({store.reviewCount})
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs">{store.location}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
