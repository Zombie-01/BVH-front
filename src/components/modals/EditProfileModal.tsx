import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userRole?: string | null;
  initialData?: Partial<Database["public"]["Tables"]["profiles"]["Row"]> | null;
  onSaved: (
    updated: Database["public"]["Tables"]["profiles"]["Row"] | null,
  ) => void;
}

export default function EditProfileModal({
  open,
  onOpenChange,
  userId,
  userRole,
  initialData,
  onSaved,
}: EditProfileModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState(initialData?.name ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [vehicleType, setVehicleType] = useState(
    initialData?.vehicle_type ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialData?.avatar ?? null,
  );

  // Store / worker specific
  const [store, setStore] = useState<Partial<
    Database["public"]["Tables"]["stores"]["Row"]
  > | null>(null);
  const [worker, setWorker] = useState<Partial<
    Database["public"]["Tables"]["service_workers"]["Row"]
  > | null>(null);
  const [storeImageFile, setStoreImageFile] = useState<File | null>(null);
  const [storeImageUrl, setStoreImageUrl] = useState<string | null>(null);

  // File input refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const storeImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(initialData?.name ?? "");
    setPhone(initialData?.phone ?? "");
    setVehicleType(initialData?.vehicle_type ?? "");
    setAvatarUrl(initialData?.avatar ?? null);

    // load role-specific related records
    async function loadRelated() {
      if (userRole === "store_owner") {
        try {
          const { data } = await supabase
            .from("stores")
            .select("id, name, description, phone, image, logo")
            .eq("owner_id", userId)
            .maybeSingle();
          setStore(data ?? null);
          const storeRow = data as
            | Database["public"]["Tables"]["stores"]["Row"]
            | null;
          setStore(storeRow ?? null);
          if (storeRow && storeRow.image) {
            setStoreImageFile(null);
            setStoreImageUrl(storeRow.image);
          }
        } catch (e) {
          console.error("Failed to load store:", e);
        }
      } else if (userRole === "service_worker") {
        try {
          const { data } = await supabase
            .from("service_workers")
            .select("id, specialty, description, hourly_rate")
            .eq("profile_id", userId)
            .maybeSingle();
          setWorker(data ?? null);
        } catch (e) {
          console.error("Failed to load worker:", e);
        }
      }
    }

    if (open) loadRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, open]);

  const uploadToStorage = async (
    file: File,
    bucket: string,
    folder: string,
  ) => {
    const path = `${folder}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      });
    if (error) throw error;
    const urlRes = supabase.storage.from(bucket).getPublicUrl(path);
    return urlRes.data?.publicUrl ?? null;
  };

  const handleAvatarChange = (f: File | null) => {
    setAvatarFile(f);
    if (!f) return setAvatarUrl(initialData?.avatar ?? null);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleStoreImageChange = (f: File | null) => {
    setStoreImageFile(f);
    if (!f) return setStoreImageUrl(store?.image ?? null);
    const reader = new FileReader();
    reader.onloadend = () => setStoreImageUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      const profilePayload: Database["public"]["Tables"]["profiles"]["Update"] =
        {
          name: name || null,
          phone: phone || null,
        };

      // upload avatar if new file
      if (avatarFile) {
        try {
          const publicUrl = await uploadToStorage(
            avatarFile,
            "avatars",
            userId,
          );
          profilePayload.avatar = (publicUrl ?? null) as
            | Database["public"]["Tables"]["profiles"]["Row"]["avatar"]
            | null;
        } catch (err) {
          console.warn("Avatar upload failed:", err);
          toast({
            title: "Анхаар",
            description: "Аватар аплоуд амжилтгүй боллоо",
          });
        }
      }

      // Update profile
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .update(profilePayload as unknown as never)
        .eq("id", userId)
        .select()
        .maybeSingle();
      if (profileErr) throw profileErr;

      // Prepare merged result container
      const merged:
        | (Database["public"]["Tables"]["profiles"]["Row"] & {
            store?: Database["public"]["Tables"]["stores"]["Row"];
            worker?: Database["public"]["Tables"]["service_workers"]["Row"];
          })
        | null = profileData ?? null;

      // Role-specific updates
      if (userRole === "store_owner" && store) {
        const storePayload: Database["public"]["Tables"]["stores"]["Update"] = {
          name: store.name ?? null,
          description: store.description ?? null,
          phone: store.phone ?? null,
        };
        // upload store image if provided
        if (storeImageFile) {
          try {
            const storeImgUrl = await uploadToStorage(
              storeImageFile,
              "store-images",
              userId,
            );
            storePayload.image = (storeImgUrl ?? null) as
              | Database["public"]["Tables"]["stores"]["Row"]["image"]
              | null;
          } catch (err) {
            console.warn("Store image upload failed:", err);
            toast({
              title: "Анхаар",
              description: "Дэлгүүр зургын аплоуд амжилтгүй боллоо",
            });
          }
        }

        const { data: storeData, error: storeErr } = await supabase
          .from("stores")
          .update(storePayload as unknown as never)
          .eq("owner_id", userId)
          .select()
          .maybeSingle();
        if (storeErr) throw storeErr;
        // attach store fields to returned profile if available
        if (storeData && merged) merged.store = storeData;
      }

      let workerData:
        | Database["public"]["Tables"]["service_workers"]["Row"]
        | null = null;
      if (userRole === "service_worker" && worker) {
        const workerPayload: Database["public"]["Tables"]["service_workers"]["Update"] =
          {
            specialty: worker.specialty ?? null,
            description: worker.description ?? null,
            hourly_rate: worker.hourly_rate ?? null,
          };
        const workerRes = await supabase
          .from("service_workers")
          .update(workerPayload as unknown as never)
          .eq("profile_id", userId)
          .select()
          .maybeSingle();
        if (workerRes.error) throw workerRes.error;
        workerData = workerRes.data ?? null;
        if (workerData && merged) merged.worker = workerData;
      }

      toast({ title: "Амжилт", description: "Профайл амжилттай хадгалагдлаа" });
      onSaved(merged ?? null);
      onOpenChange(false);
    } catch (err) {
      console.error("Update profile failed:", err);
      const message =
        err && (err as Error).message
          ? (err as Error).message
          : "Профайл хадгалахад алдаа гарлаа";
      toast({ title: "Алдаа", description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const vehicleOptions = ["walking", "bike", "moped", "mini_truck"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-sm md:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Профайлыг засах</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Avatar */}
          <div>
            <Label className="block mb-2">Аватар</Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl bg-muted overflow-hidden hover:opacity-80 transition flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">
                    А
                  </div>
                )}
              </button>
              <div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleAvatarChange(e.target.files?.[0] ?? null)
                  }
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}>
                  Сонгох
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Нэр</Label>
            <Input
              id="name"
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)}
              placeholder="Нэр"
            />
          </div>

          <div>
            <Label htmlFor="phone">Утас</Label>
            <Input
              id="phone"
              value={phone ?? ""}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Утас"
            />
          </div>

          {userRole === "driver" && (
            <div>
              <Label htmlFor="vehicle">Тээврийн төрөл</Label>
              <Select
                onValueChange={(v) => setVehicleType(v)}
                defaultValue={vehicleType ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Тээврийн төрөл" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleOptions.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {userRole === "store_owner" && (
            <div className="space-y-3 pt-2 border-t">
              <Label className="block font-semibold">Дэлгүүр мэдээлэл</Label>
              <div>
                <Label htmlFor="store-name" className="text-sm">
                  Дэлгүүрийн нэр
                </Label>
                <Input
                  id="store-name"
                  value={store?.name ?? ""}
                  onChange={(e) =>
                    setStore({ ...(store ?? {}), name: e.target.value })
                  }
                  placeholder="Дэлгүүрийн нэр"
                />
              </div>
              <div>
                <Label htmlFor="store-phone" className="text-sm">
                  Дэлгүүрийн утас
                </Label>
                <Input
                  id="store-phone"
                  value={store?.phone ?? ""}
                  onChange={(e) =>
                    setStore({ ...(store ?? {}), phone: e.target.value })
                  }
                  placeholder="Дэлгүүрийн утас"
                />
              </div>
              <div>
                <Label htmlFor="store-desc" className="text-sm">
                  Тайлбар
                </Label>
                <Textarea
                  id="store-desc"
                  value={store?.description ?? ""}
                  onChange={(e) =>
                    setStore({ ...(store ?? {}), description: e.target.value })
                  }
                  placeholder="Тайлбар"
                />
              </div>

              <div className="pt-2">
                <Label className="block mb-2 font-semibold">
                  Дэлгүүр зураг
                </Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    type="button"
                    onClick={() => storeImageInputRef.current?.click()}
                    className="w-24 h-24 rounded-lg bg-muted overflow-hidden hover:opacity-80 transition flex-shrink-0">
                    {storeImageUrl ? (
                      <img
                        src={storeImageUrl}
                        alt="store"
                        className="w-full h-full object-cover"
                      />
                    ) : store?.image ? (
                      <img
                        src={store.image}
                        alt="store"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">
                        З
                      </div>
                    )}
                  </button>
                  <div>
                    <input
                      ref={storeImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleStoreImageChange(e.target.files?.[0] ?? null)
                      }
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => storeImageInputRef.current?.click()}>
                      Сонгох
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {userRole === "service_worker" && (
            <div className="space-y-3 pt-2 border-t">
              <Label className="block font-semibold">Үйлчилгээ мэдээлэл</Label>
              <div>
                <Label htmlFor="specialty" className="text-sm">
                  Мэргэжил
                </Label>
                <Input
                  id="specialty"
                  value={worker?.specialty ?? ""}
                  onChange={(e) =>
                    setWorker({ ...(worker ?? {}), specialty: e.target.value })
                  }
                  placeholder="Мэргэжил"
                />
              </div>
              <div>
                <Label htmlFor="hourly-rate" className="text-sm">
                  ₮ цагийн үнэ
                </Label>
                <Input
                  id="hourly-rate"
                  value={
                    worker?.hourly_rate !== null &&
                    worker?.hourly_rate !== undefined
                      ? String(worker.hourly_rate)
                      : ""
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    setWorker({
                      ...(worker ?? {}),
                      hourly_rate: v === "" ? null : Number(v),
                    });
                  }}
                  placeholder="0"
                  type="number"
                />
              </div>
              <div>
                <Label htmlFor="worker-desc" className="text-sm">
                  Тайлбар
                </Label>
                <Textarea
                  id="worker-desc"
                  value={worker?.description ?? ""}
                  onChange={(e) =>
                    setWorker({
                      ...(worker ?? {}),
                      description: e.target.value,
                    })
                  }
                  placeholder="Тайлбар"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              type="button"
              className="w-full sm:w-auto">
              Болих
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto">
              {isSaving ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
