import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";

type UserRole = "user" | "store_owner" | "driver" | "service_worker";
type VehicleType = "walking" | "bike" | "moped" | "mini_truck";

interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  vehicle_type: VehicleType | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRoleData | null;
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  switchRole: (role: UserRole, vehicleType?: VehicleType) => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRoleData | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserRole(data as UserRoleData);
        setCurrentRole(data.role as UserRole);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
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

      // Fetch user role when user logs in
      if (session?.user) {
        setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 0);
      } else {
        setUserRole(null);
        setCurrentRole(null);
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
        fetchUserRole(session.user.id);
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
    api.setAuthToken(null);
  };

  const switchRole = async (role: UserRole, vehicleType?: VehicleType) => {
    if (!user) return;

    try {
      const updateData: { role: UserRole; vehicle_type?: VehicleType | null } =
        { role };

      if (role === "driver" && vehicleType) {
        updateData.vehicle_type = vehicleType;
      } else if (role !== "driver") {
        updateData.vehicle_type = null;
      }

      const { error } = await supabase
        .from("user_roles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      setCurrentRole(role);
      if (userRole) {
        setUserRole({
          ...userRole,
          role,
          vehicle_type: updateData.vehicle_type ?? null,
        });
      }
    } catch (error) {
      console.error("Error switching role:", error);
      throw error;
    }
  };

  const refreshUserRole = async () => {
    if (user) {
      await fetchUserRole(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        currentRole,
        isAuthenticated: !!user,
        isLoading,
        logout,
        switchRole,
        refreshUserRole,
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
