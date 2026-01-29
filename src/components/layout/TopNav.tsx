import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Store,
  Wrench,
  ClipboardList,
  User,
  Menu,
  HardHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { path: "/home", label: "Нүүр", icon: Home },
  { path: "/stores", label: "Дэлгүүрүүд", icon: Store },
  { path: "/services", label: "Үйлчилгээ", icon: Wrench },
  { path: "/orders", label: "Захиалгууд", icon: ClipboardList },
  { path: "/profile", label: "Профайл", icon: User },
];

export function TopNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <HardHat className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl hidden sm:inline">
            Барилга Hub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/home" &&
                item.path !== "/profile" &&
                location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Tablet Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <HardHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Барилга Hub</span>
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/home" &&
                    item.path !== "/profile" &&
                    location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
