import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
  Loader2,
  Store,
  Truck,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuthMode = "login" | "signup";
type UserRole = "user" | "store_owner" | "driver" | "service_worker";
type VehicleType = "walking" | "bike" | "moped" | "mini_truck";

const roles = [
  {
    id: "user" as UserRole,
    label: "Хэрэглэгч",
    icon: User,
    description: "Бараа захиалах",
  },
  {
    id: "store_owner" as UserRole,
    label: "Дэлгүүрийн эзэн",
    icon: Store,
    description: "Бараа зарах",
  },
  {
    id: "driver" as UserRole,
    label: "Жолооч",
    icon: Truck,
    description: "Хүргэлт хийх",
  },
  {
    id: "service_worker" as UserRole,
    label: "Үйлчилгээ",
    icon: Wrench,
    description: "Засвар, угсралт",
  },
];

const vehicleTypes = [
  { id: "walking" as VehicleType, label: "Явган" },
  { id: "bike" as VehicleType, label: "Дугуй" },
  { id: "moped" as VehicleType, label: "Мопед" },
  { id: "mini_truck" as VehicleType, label: "Жижиг ачааны" },
];

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [vehicleType, setVehicleType] = useState<VehicleType>("bike");

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/home");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/home");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/`;
        const metadata: Record<string, string | null> = {
          name: name || "Хэрэглэгч",
          phone: phone || null,
          role: selectedRole,
        };

        if (selectedRole === "driver") {
          metadata.vehicle_type = vehicleType;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: metadata,
          },
        });

        if (error) throw error;
        toast.success("Бүртгэл амжилттай! Нэвтэрч байна...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Амжилттай нэвтэрлээ!");
      }
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes("User already registered")) {
        toast.error("Энэ имэйл бүртгэлтэй байна. Нэвтэрнэ үү.");
      } else if (err.message.includes("Invalid login credentials")) {
        toast.error("Имэйл эсвэл нууц үг буруу байна.");
      } else {
        toast.error(err.message || "Алдаа гарлаа");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/role-selection`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Google нэвтрэлт амжилтгүй");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {mode === "login" ? "Тавтай морил" : "Бүртгүүлэх"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Өөрийн бүртгэлээр нэвтэрнэ үү"
                : "Шинэ бүртгэл үүсгэх"}
            </p>
          </div>

          {/* Google Login */}
          <Button
            variant="outline"
            className="w-full h-12 gap-3"
            onClick={handleGoogleAuth}
            disabled={googleLoading}>
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Google-ээр нэвтрэх
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                эсвэл
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <>
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>Дүр сонгох</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}>
                          <Icon
                            className={`w-5 h-5 ${
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          <div className="text-left">
                            <p
                              className={`text-sm font-medium ${
                                isSelected ? "text-primary" : "text-foreground"
                              }`}>
                              {role.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {role.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vehicle Type for Driver */}
                {selectedRole === "driver" && (
                  <div className="space-y-2">
                    <Label>Тээврийн хэрэгсэл</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {vehicleTypes.map((vehicle) => (
                        <button
                          key={vehicle.id}
                          type="button"
                          onClick={() => setVehicleType(vehicle.id)}
                          className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                            vehicleType === vehicle.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}>
                          {vehicle.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Нэр</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Таны нэр"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Утасны дугаар</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+976 9911 2233"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Имэйл</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Нууц үг</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : mode === "login" ? (
                "Нэвтрэх"
              ) : (
                "Бүртгүүлэх"
              )}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-muted-foreground">
              {mode === "login"
                ? "Бүртгэл байхгүй юу? Бүртгүүлэх"
                : "Бүртгэлтэй юу? Нэвтрэх"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
