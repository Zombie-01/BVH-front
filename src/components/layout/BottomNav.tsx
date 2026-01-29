import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Store,
  Wrench,
  ClipboardList,
  User,
  LayoutDashboard,
  Package,
  MessageCircle,
  Map,
  CheckCircle,
  DollarSign,
  FileText,
  Star,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navConfigs: Record<string, NavItem[]> = {
  user: [
    { icon: Home, label: "Нүүр", path: "/home" },
    { icon: Store, label: "Дэлгүүрүүд", path: "/stores" },
    { icon: Wrench, label: "Үйлчилгээ", path: "/services" },
    { icon: ClipboardList, label: "Захиалгууд", path: "/orders" },
    { icon: User, label: "Профайл", path: "/profile" },
  ],
  store_owner: [
    { icon: LayoutDashboard, label: "Самбар", path: "/owner/dashboard" },
    { icon: Package, label: "Бараа", path: "/owner/products" },
    { icon: ClipboardList, label: "Захиалгууд", path: "/owner/orders" },
    { icon: MessageCircle, label: "Чат", path: "/owner/chats" },
    { icon: User, label: "Профайл", path: "/profile" },
  ],
  driver: [
    { icon: ClipboardList, label: "Ажлууд", path: "/driver/tasks" },
    { icon: Map, label: "Газрын зураг", path: "/driver/map" },
    { icon: CheckCircle, label: "Дууссан", path: "/driver/completed" },
    { icon: DollarSign, label: "Орлого", path: "/driver/earnings" },
    { icon: User, label: "Профайл", path: "/profile" },
  ],
  service_worker: [
    { icon: ClipboardList, label: "Ажлууд", path: "/worker/jobs" },
    { icon: FileText, label: "Үнийн санал", path: "/worker/quotes" },
    { icon: CheckCircle, label: "Үе шат", path: "/worker/milestones" },
    { icon: Star, label: "Үнэлгээ", path: "/worker/ratings" },
    { icon: User, label: "Профайл", path: "/profile" },
  ],
};

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentRole } = useAuth();

  const items = navConfigs[currentRole || "user"] || navConfigs.user;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/home" &&
              item.path !== "/profile" &&
              location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 touch-feedback relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-2xs font-medium transition-colors duration-200",
                  isActive && "font-semibold"
                )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
