import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { api } from "@/lib/api";

type UserRole = "user" | "store_owner" | "driver" | "service_worker";
type VehicleType = "walking" | "bike" | "moped" | "mini_truck";

interface UserRoleData {
  id: string;
  role: UserRole;
  vehicle_type: VehicleType | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRoleData | null;
  currentRole: UserRole | null;
  profile:
    | import("@/integrations/supabase/types").Database["public"]["Tables"]["profiles"]["Row"]
    | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRoleData | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<
    | import("@/integrations/supabase/types").Database["public"]["Tables"]["profiles"]["Row"]
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const roleToPath = (role: UserRole | null) => {
    if (role === "store_owner") return "/owner/dashboard";
    if (role === "driver") return "/driver/tasks";
    if (role === "service_worker") return "/worker/jobs";
    return "/home";
  };

  const safeRedirect = (target: string) => {
    try {
      // Use sessionStorage to mark that we've redirected to this target in this tab/session.
      // This avoids time-based delays and ensures only a single hard reload to the target per tab.
      if (typeof window === "undefined") return;
      const already = sessionStorage.getItem("roleRedirectedTarget") || "";
      if (already === target) return; // already redirected to this target in this session
      sessionStorage.setItem("roleRedirectedTarget", target);

      // Hard reload to the target route
      window.location.replace(target);
    } catch (err) {
      console.error("Redirect failed:", err);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = (await supabase
        .from("profiles")
        .select(
          "id, name, phone, role, vehicle_type, avatar, created_at, updated_at",
        )
        .eq("id", userId)
        .maybeSingle()) as {
        data: Database["public"]["Tables"]["profiles"]["Row"] | null;
        error: any;
      };

      if (error) throw error;

      if (data) {
        setProfile(data as any);
        const roleData: UserRoleData = {
          id: data.id,
          role: data.role as UserRole,
          vehicle_type: data.vehicle_type as VehicleType | null,
          created_at: data.created_at ?? "",
        };
        setUserRole(roleData);
        setCurrentRole(roleData.role as UserRole);
        return data as typeof profile;
      }

      setProfile(null);
      setUserRole(null);
      setCurrentRole(null);
      return null;
    } catch (err) {
      console.error("Error fetching profile:", err);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Update API auth token
      if (session?.access_token) {
        api.setAuthToken(session.access_token);
      } else {
        api.setAuthToken(null);
      }

      // Fetch profile when user logs in and redirect if appropriate
      if (session?.user) {
        fetchProfile(session.user.id).then((data) => {
          const role = data?.role ?? null;
          const target = roleToPath(role);
          const current = window.location.pathname;
          const redirected =
            typeof window !== "undefined"
              ? sessionStorage.getItem("roleRedirectedTarget")
              : null;
          // Redirect only if not already on the target (or a child path) and not already redirected to this target in this session
          if (
            !current.startsWith(target) &&
            (event === "SIGNED_IN" || current === "/" || current === "/auth") &&
            redirected !== target
          ) {
            safeRedirect(target);
          }
        });
      } else {
        setUserRole(null);
        setCurrentRole(null);
        setProfile(null);
      }

      setIsLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.access_token) {
        api.setAuthToken(session.access_token);
      }

      if (session?.user) {
        fetchProfile(session.user.id).then((data) => {
          const role = data?.role ?? null;
          const target = roleToPath(role);
          const current = window.location.pathname;
          const redirected =
            typeof window !== "undefined"
              ? sessionStorage.getItem("roleRedirectedTarget")
              : null;
          if (
            !current.startsWith(target) &&
            (current === "/" || current === "/auth") &&
            redirected !== target
          ) {
            safeRedirect(target);
          }
        });
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setCurrentRole(null);
    setProfile(null);
    api.setAuthToken(null);

    // Clear redirect flag on logout so future logins can redirect again
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("roleRedirectedTarget");
    }
  };

  const refreshUserRole = async () => {
    if (user) {
      const data = await fetchProfile(user.id);
      // Redirect on role changes (if not already on matching path)
      const role = data?.role ?? null;
      const target = roleToPath(role);
      const redirected =
        typeof window !== "undefined"
          ? sessionStorage.getItem("roleRedirectedTarget")
          : null;
      if (
        !window.location.pathname.startsWith(target) &&
        redirected !== target
      ) {
        safeRedirect(target);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        currentRole,
        profile,
        isAuthenticated: !!user,
        isLoading,
        logout,
        refreshUserRole,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
