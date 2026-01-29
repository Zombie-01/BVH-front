import { Star, Briefcase, Award } from "lucide-react";
import { ServiceWorker } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ServiceWorkerCardProps {
  worker: ServiceWorker;
  variant?: "default" | "compact";
  onClick?: () => void;
}

export function ServiceWorkerCard({
  worker,
  variant = "default",
  onClick,
}: ServiceWorkerCardProps) {
  if (variant === "compact") {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-card touch-feedback w-full text-left">
        <div className="relative">
          <img
            src={worker.avatar}
            alt={worker.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
          />
          {worker.isAvailable && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-card" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">
            {worker.name}
          </h4>
          <p className="text-xs text-muted-foreground">{worker.specialty}</p>
          <div className="flex items-center gap-2 mt-1">
            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
            <span className="text-xs font-medium">{worker.rating}</span>
            <span className="text-xs text-muted-foreground">
              • {worker.completedJobs} ажил
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-primary">
            ₮{worker.hourlyRate.toLocaleString()}
          </span>
          <span className="text-2xs text-muted-foreground block">/цаг</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="bg-card rounded-2xl p-4 shadow-card touch-feedback w-full text-left">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <img
            src={worker.avatar}
            alt={worker.name}
            className="w-20 h-20 rounded-2xl object-cover"
          />
          {worker.isAvailable && (
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-success text-success-foreground text-2xs font-medium rounded-full">
              Чөлөөтэй
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-lg">{worker.name}</h3>
          <p className="text-sm text-muted-foreground">{worker.specialty}</p>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-sm font-semibold">{worker.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm">{worker.completedJobs} ажил</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-primary">
            ₮{worker.hourlyRate.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground block">/цаг</span>
        </div>
      </div>

      {worker.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {worker.badges.slice(0, 3).map((badge, index) => (
            <Badge key={index} variant="secondary" className="gap-1 text-xs">
              <Award className="w-3 h-3 text-accent" />
              {badge}
            </Badge>
          ))}
        </div>
      )}
    </button>
  );
}
