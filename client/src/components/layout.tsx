import { Link, useLocation } from "wouter";
import { LayoutDashboard, BarChart2, LogOut, Menu, X, Users, CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@assets/generated_images/a_modern_abstract_logo_for_a_data_dashboard_named_pulselens.png";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    console.log("Toggle clicked, current state:", isOpen);
    setIsOpen(!isOpen);
  };
  
  const close = () => {
    console.log("Closing menu");
    setIsOpen(false);
  };

  // Close menu when route changes
  useEffect(() => {
    close();
  }, [location]);

  const navItems = [
    { icon: LayoutDashboard, label: "All Data", href: "/" },
    { icon: BarChart2, label: "Analytics", href: "/analytics" },
    { icon: Users, label: "Accounts", href: "/accounts" },
    { icon: CalendarDays, label: "Timeline", href: "/timeline" },
    { icon: Clock, label: "Today", href: "/today" },
  ];

  const handleLogout = async () => {
    close();
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // Get user initials from email
  const getInitials = (email: string | undefined) => {
    if (!email) return "JD";
    const parts = email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Get display name from email
  const getDisplayName = (email: string | undefined) => {
    if (!email) return "User";
    const username = email.split("@")[0];
    return username.split(".").map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(" ");
  };

  console.log("Render - isOpen:", isOpen);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden h-16 border-b border-border bg-secondary/30 backdrop-blur-xl flex items-center justify-between px-4 relative z-50">
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="PulseLens Logo" className="w-7 h-7 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            PulseLens
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            console.log("BUTTON CLICKED!");
            e.preventDefault();
            e.stopPropagation();
            toggle();
          }}
          className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 z-40" : "opacity-0 pointer-events-none -z-10"
        )}
        onClick={close}
      />

      {/* Sidebar - Desktop + Mobile Overlay */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 w-64 border-r border-border bg-secondary/30 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out",
          // Desktop: always visible
          "md:translate-x-0 md:z-0",
          // Mobile: slide in from left when open, higher z-index
          isOpen ? "translate-x-0 z-50" : "-translate-x-full z-50",
          // Add top margin on mobile to account for header
          "top-16 md:top-0"
        )}
      >
        <div className="h-16 hidden md:flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="PulseLens Logo" className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              PulseLens
            </span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  onClick={close}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="glass-card p-3 rounded-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {getInitials(user?.email)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate">{getDisplayName(user?.email)}</span>
                <span className="text-[10px] text-muted-foreground truncate">Admin</span>
              </div>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full shrink-0"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Log Out</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full md:h-screen overflow-hidden relative">
        {/* Background gradient blob */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2" />

        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {children}
        </div>
      </main>
    </div>
  );
}