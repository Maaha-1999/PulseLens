import { Link } from "wouter";
import { LayoutDashboard, BarChart2, Users, CalendarDays, Clock, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/generated_images/a_modern_abstract_logo_for_a_data_dashboard_named_pulselens.png";

const navItems = [
  { 
    icon: Clock, 
    label: "Today", 
    href: "/today",
    description: "View recent entries from yesterday and today",
    color: "from-indigo-500 to-violet-600"
  },
  { 
    icon: LayoutDashboard, 
    label: "All Data", 
    href: "/all-data",
    description: "View all entries from both data sources with filtering",
    color: "from-cyan-500 to-blue-600"
  },
  { 
    icon: BarChart2, 
    label: "Analytics", 
    href: "/analytics",
    description: "Analyze engagement metrics and platform distribution",
    color: "from-purple-500 to-pink-600"
  },
  { 
    icon: Users, 
    label: "Accounts", 
    href: "/accounts",
    description: "Browse entries organized by account handle",
    color: "from-green-500 to-emerald-600"
  },
  { 
    icon: CalendarDays, 
    label: "Timeline", 
    href: "/timeline",
    description: "Explore data organized by date",
    color: "from-orange-500 to-red-600"
  },
];

export default function Home() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out", description: "You have been signed out." });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="PulseLens" className="h-10 w-10 rounded-lg" />
            <h1 className="text-xl font-bold text-white">PulseLens</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.email}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 hover:text-blue-500 hover:cursor-pointer">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Welcome to PulseLens
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Track and analyze social media narratives from multiple data sources. 
            Choose a view below to get started.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <Card className="glass-panel border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group h-[180px]">
                <CardContent className="p-6 flex flex-col items-center text-center h-full justify-center">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
