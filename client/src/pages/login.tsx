import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import logoImage from "@assets/generated_images/a_modern_abstract_logo_for_a_data_dashboard_named_pulselens.png";

export default function Login() {
  const { user, signIn, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (user && !loading) {
    return <Redirect to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Authentication Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      // Redirect will happen automatically via AuthContext
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2" />

      <Card className="w-full max-w-md mx-4 glass-panel border-border/50 relative z-10">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img 
              src={logoImage} 
              alt="PulseLens Logo" 
              className="w-16 h-16 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.5)]" 
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-purple-500">
                Welcome to PulseLens
              </span>
            </CardTitle>
            <CardDescription className="mt-2">
              Sign in to access your dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pulselens.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-secondary/30 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-secondary/30 border-border/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Access is restricted to authorized users only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}