import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User, Settings, LogOut, Star, Phone } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import EditProfileModal from "@/components/modals/EditProfileModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, logout, userRole, isLoading, profile, refreshProfile } =
    useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const editPathForRole = (role: string | undefined) => {
    if (role === "store_owner") return "/owner/dashboard";
    if (role === "driver") return "/profile/edit";
    if (role === "service_worker") return "/profile/edit";
    return "/profile/edit";
  };

  const roleLabel = (role: string | undefined) => {
    if (role === "store_owner") return "Дэлгүүр эрхлэгч";
    if (role === "driver") return "Тээвэрчин";
    if (role === "service_worker") return "Үйлчилгээ эрхлэгч";
    return "Хэрэглэгч";
  };

  const [isEditing, setIsEditing] = useState(false);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [storeImage, setStoreImage] = useState<string | null>(null);
  const [ordersCount, setOrdersCount] = useState<number | null>(null);
  const [servicesCount, setServicesCount] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    // Load stats (orders, store/service counts) — profile comes from context
    async function loadStats() {
      if (!user) return;
      setIsFetching(true);
      try {
        // orders count (customer orders)
        const { count: ordersCnt } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        setOrdersCount(ordersCnt ?? 0);

        // role-specific data: store rating/products or service worker rating/completed jobs
        if (userRole?.role === "store_owner") {
          const storeRes = await supabase
            .from("stores")
            .select("id, name, rating, review_count, image")
            .eq("owner_id", user.id)
            .maybeSingle();
          const store = storeRes.data as
            | import("@/integrations/supabase/types").Database["public"]["Tables"]["stores"]["Row"]
            | null;
          if (store && store.id) {
            setRating(store.rating ?? null);
            setStoreName(store.name ?? null);
            setStoreImage(store.image ?? null);
            const { count: prodCnt } = await supabase
              .from("products")
              .select("id", { count: "exact", head: true })
              .eq("store_id", store.id);
            setServicesCount(prodCnt ?? 0);
          }
        } else if (userRole?.role === "service_worker") {
          const workerRes = await supabase
            .from("service_workers")
            .select("rating, completed_jobs")
            .eq("profile_id", user.id)
            .maybeSingle();
          const worker = workerRes.data as
            | import("@/integrations/supabase/types").Database["public"]["Tables"]["service_workers"]["Row"]
            | null;
          if (worker) {
            setRating(worker.rating ?? null);
            setServicesCount(worker.completed_jobs ?? 0);
          }
        } else {
          setRating(null);
        }
      } catch (err) {
        console.error("Failed to load profile/stats:", err);
      } finally {
        setIsFetching(false);
      }
    }

    loadStats();
  }, [user, userRole?.role]);

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-orange-400 pt-safe px-4 pb-8">
        <div className="pt-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Профайл</h1>
          <Button
            variant="outline-light"
            size="icon"
            onClick={handleEdit}
            aria-label="Профайлыг засах">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
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
                  {(profile?.phone ?? user?.user_metadata?.phone) ||
                    user?.email ||
                    "+976 9911 2233"}
                </span>
              </div>
              {isLoading && (
                <div className="mt-2 text-sm text-white/70">
                  Ачааллаж байна…
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-accent/20 px-2 py-0.5 rounded-full">
                  <Star className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-medium text-white">
                    {rating ?? "—"}
                  </span>
                </div>
                <div className="text-xs text-white/60">
                  <div>• {ordersCount ?? "—"} захиалга</div>
                  {storeName && (
                    <div className="text-xs text-white/60">{storeName}</div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Button onClick={handleEdit}>Засах</Button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Stats (dynamic) */}
      <section className="px-4 -mt-4">
        <div className="bg-card rounded-2xl shadow-elevated p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">
                {ordersCount ?? (isFetching ? "…" : "—")}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Захиалга</p>
            </div>
            <div className="text-center border-x border-border">
              <span className="text-2xl font-bold text-primary">
                {servicesCount ?? (isFetching ? "…" : "—")}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Үйлчилгээ</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">
                {rating ?? (isFetching ? "…" : "—")}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Үнэлгээ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-specific editable details */}
      <section className="px-4 mt-6">
        <div className="bg-card rounded-2xl shadow-card p-4">
          <h3 className="text-lg font-medium text-foreground mb-3">
            Профайл мэдээлэл
          </h3>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Роль</p>
                <p className="font-medium text-foreground">
                  {roleLabel(userRole?.role)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("mn-MN")
                    : ""}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Нэр</p>
              <p className="font-medium text-foreground">
                {(profile?.name ?? user?.user_metadata?.name) ||
                  user?.email?.split("@")[0]}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Утас</p>
              <p className="font-medium text-foreground">
                {(profile?.phone ?? user?.user_metadata?.phone) || user?.email}
              </p>
            </div>

            {userRole?.role === "driver" && (
              <div>
                <p className="text-xs text-muted-foreground">Тээврийн төрөл</p>
                <p className="font-medium text-foreground">
                  {userRole.vehicle_type ?? "—"}
                </p>
              </div>
            )}

            {userRole?.role === "store_owner" && (
              <div>
                <p className="text-xs text-muted-foreground">Дэлгүүр эрхлэгч</p>
                <p className="font-medium text-foreground">
                  Дэлгүүрийн мэдээлэл засах бол "Засах" товчыг дарна уу
                </p>
              </div>
            )}

            {userRole?.role === "service_worker" && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Үйлчилгээ эрхлэгч
                </p>
                <p className="font-medium text-foreground">
                  Үйлчилгээ, үнийн мэдээллийг засах бол "Засах" товч
                </p>
              </div>
            )}

            <div className="pt-4">
              <Button variant="ghost" onClick={handleEdit}>
                Профайлыг засах
              </Button>
            </div>
            <EditProfileModal
              open={isEditing}
              onOpenChange={(open) => setIsEditing(open)}
              userId={user?.id ?? ""}
              userRole={userRole?.role}
              initialData={{
                name: profile?.name ?? user?.user_metadata?.name ?? null,
                phone: profile?.phone ?? user?.user_metadata?.phone ?? null,
                vehicle_type:
                  profile?.vehicle_type ?? userRole?.vehicle_type ?? null,
              }}
              onSaved={async (updated) => {
                // refresh central profile state
                await refreshProfile();
                // update display name in the UI quickly
                toast({
                  title: "Амжилт",
                  description: "Профайл шинэчилэгдлээ",
                });
              }}
            />
          </div>
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
