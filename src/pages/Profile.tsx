import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  MapPin,
  Phone,
  Shield,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { icon: User, label: "Хувийн мэдээлэл", path: "/profile/edit" },
  { icon: MapPin, label: "Хаягууд", path: "/profile/addresses" },
  { icon: CreditCard, label: "Төлбөрийн хэрэгсэл", path: "/profile/payments" },
  { icon: Bell, label: "Мэдэгдэл", path: "/profile/notifications" },
  { icon: Shield, label: "Нууцлал", path: "/profile/privacy" },
  { icon: HelpCircle, label: "Тусламж", path: "/help" },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-orange-400 pt-safe px-4 pb-8">
        <div className="pt-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Профайл</h1>
          <Button variant="outline-light" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                {user?.user_metadata?.name ||
                  user?.email?.split("@")[0] ||
                  "Хэрэглэгч"}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-white/80">
                <Phone className="w-4 h-4" />
                <span className="text-sm">
                  {user?.user_metadata?.phone ||
                    user?.email ||
                    "+976 9911 2233"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-accent/20 px-2 py-0.5 rounded-full">
                  <Star className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-medium text-white">4.9</span>
                </div>
                <span className="text-xs text-white/60">• 12 захиалга</span>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Stats */}
      <section className="px-4 -mt-4">
        <div className="bg-card rounded-2xl shadow-elevated p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">12</span>
              <p className="text-xs text-muted-foreground mt-1">Захиалга</p>
            </div>
            <div className="text-center border-x border-border">
              <span className="text-2xl font-bold text-primary">5</span>
              <p className="text-xs text-muted-foreground mt-1">Үйлчилгээ</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">4.9</span>
              <p className="text-xs text-muted-foreground mt-1">Үнэлгээ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="px-4 mt-6">
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted transition-colors border-b border-border last:border-0">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Logout */}
      <section className="px-4 mt-6 pb-6">
        <Button
          variant="destructive"
          size="lg"
          className="w-full"
          onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
          Гарах
        </Button>
      </section>
    </AppLayout>
  );
}
