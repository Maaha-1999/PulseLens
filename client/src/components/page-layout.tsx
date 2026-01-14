import { Link } from "wouter";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/generated_images/a_modern_abstract_logo_for_a_data_dashboard_named_pulselens.png";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function PageLayout({ children, title }: PageLayoutProps) {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out", description: "You have been signed out." });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="PulseLens" className="h-8 w-8 rounded-lg" />
              <span className="text-lg font-semibold text-white">{title}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
