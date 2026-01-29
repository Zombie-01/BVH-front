import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Store,
  Truck,
  Wrench,
  ChevronRight,
  HardHat,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type UserRole = "user" | "store_owner" | "driver" | "service_worker";

const roles = [
  {
    id: "user" as UserRole,
    title: "Хэрэглэгч",
    description: "Бараа захиалах, үйлчилгээ авах",
    icon: User,
    color: "bg-primary",
  },
  {
    id: "store_owner" as UserRole,
    title: "Дэлгүүрийн эзэн",
    description: "Бараа зарах, захиалга хүлээн авах",
    icon: Store,
    color: "bg-secondary",
  },
  {
    id: "driver" as UserRole,
    title: "Жолооч",
    description: "Бараа хүргэлт хийх",
    icon: Truck,
    color: "bg-success",
  },
  {
    id: "service_worker" as UserRole,
    title: "Үйлчилгээний ажилтан",
    description: "Угсралт, засвар хийх",
    icon: Wrench,
    color: "bg-warning",
  },
];

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isLoading, currentRole, switchRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    // Pre-select current role if exists
    if (currentRole) {
      setSelectedRole(currentRole);
    }
  }, [currentRole]);

  const handleContinue = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      await switchRole(selectedRole);
      navigate("/home");
    } catch (error) {
      toast.error("Дүр сонгоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-orange-400 pt-safe px-6 pb-12">
        <div className="pt-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <HardHat className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-white">
            Барилгын Үйлчилгээний Хаб
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 mt-2">
            Таны дүрийг сонгоно уу
          </motion.p>
        </div>
      </div>

      {/* Role Cards */}
      <div className="flex-1 px-4 -mt-6">
        <div className="space-y-3 max-w-md mx-auto">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-transparent bg-card shadow-card hover:shadow-md"
                }`}>
                <div
                  className={`w-14 h-14 rounded-xl ${role.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-foreground">{role.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {role.description}
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  }`}>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 bg-white rounded-full"
                    />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-4 pb-safe max-w-md mx-auto w-full">
        <Button
          variant="hero"
          size="xl"
          className="w-full"
          disabled={!selectedRole || loading}
          onClick={handleContinue}>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Үргэлжлүүлэх
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
