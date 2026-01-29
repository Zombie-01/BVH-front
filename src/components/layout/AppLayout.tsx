import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useAuth } from "@/contexts/AuthContext";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

function UserFooter() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Бараа Маркет</h3>
            <p className="text-sm text-muted-foreground">
              Барилгын материал, үйлчилгээг хялбар, хурдан захиалаарай.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Холбоосууд</h4>
            <nav className="flex flex-col gap-2">
              <Link
                to="/stores"
                className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Дэлгүүрүүд
              </Link>
              <Link
                to="/services"
                className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Үйлчилгээ
              </Link>
              <Link
                to="/orders"
                className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Захиалгууд
              </Link>
              <Link
                to="/profile"
                className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Профайл
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Тусламж</h4>
            <nav className="flex flex-col gap-2">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Түгээмэл асуултууд
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Нөхцөл, журам
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Нууцлалын бодлого
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Бидний тухай
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Холбоо барих</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+976 7700 1234</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@baraamarket.mn</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Улаанбаатар, Хан-Уул дүүрэг</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Бараа Маркет. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  const { currentRole } = useAuth();
  const isRegularUser = !currentRole || currentRole === "user";

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar for non-user roles */}
      {!hideNav && !isRegularUser && <Sidebar />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Top Nav for regular users on all breakpoints (hidden on mobile where bottom nav shows) */}
        {!hideNav && isRegularUser && (
          <div className="hidden sm:block">
            <TopNav />
          </div>
        )}

        <main
          className={
            hideNav
              ? "flex-1"
              : isRegularUser
              ? "flex-1 pb-20 sm:pb-0"
              : "flex-1 pb-20 lg:pb-0"
          }>
          {children}
        </main>

        {/* Footer for regular users on tablet/desktop */}
        {!hideNav && isRegularUser && (
          <div className="hidden sm:block">
            <UserFooter />
          </div>
        )}

        {/* Mobile Bottom Nav for regular users, mobile/tablet for others */}
        {!hideNav && (
          <div className={isRegularUser ? "sm:hidden" : "lg:hidden"}>
            <BottomNav />
          </div>
        )}
      </div>
    </div>
  );
}
