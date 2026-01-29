import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  LayoutDashboard,
  Package,
  MessageCircle,
  Map,
  CheckCircle,
  DollarSign,
  FileText,
  Star,
  ClipboardList,
  HardHat,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navConfigs: Record<string, NavItem[]> = {
  store_owner: [
    {
      icon: LayoutDashboard,
      label: "Хяналтын самбар",
      path: "/owner/dashboard",
    },
    { icon: Package, label: "Бүтээгдэхүүн", path: "/owner/products" },
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

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentRole, user } = useAuth();

  // Don't show sidebar for regular users
  if (!currentRole || currentRole === "user") {
    return null;
  }

  const items = navConfigs[currentRole] || [];

  if (items.length === 0) return null;

  const getRoleName = () => {
    switch (currentRole) {
      case "store_owner":
        return "Дэлгүүрийн эзэн";
      case "driver":
        return "Жолооч";
      case "service_worker":
        return "Үйлчилгээний ажилтан";
      default:
        return "Хэрэглэгч";
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/home" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center">
            <HardHat className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground text-lg">
              Барилга Hub
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              {getRoleName()}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}>
              {isActive && (
                <motion.div
                  layoutId="activeSidebar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary-foreground rounded-r-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 bg-sidebar-accent rounded-xl">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center">
            <User className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sidebar-foreground truncate">
              {user?.user_metadata?.name ||
                user?.email?.split("@")[0] ||
                "Хэрэглэгч"}
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              {getRoleName()}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
