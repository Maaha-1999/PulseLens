import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Shield, User } from "lucide-react";

export default function Settings() {
  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-muted-foreground">Manage your dashboard preferences and account settings.</p>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Display Name</Label>
                <div className="p-2 rounded-md bg-secondary/30 border border-border/50 text-sm text-muted-foreground">
                  John Doe
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <div className="p-2 rounded-md bg-secondary/30 border border-border/50 text-sm text-muted-foreground">
                  admin@pulselens.com
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a daily summary of narrative changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Critical Alerts</Label>
                  <p className="text-sm text-muted-foreground">Notify when engagement spikes &gt; 50%</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                System
              </CardTitle>
              <CardDescription>Application configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Force dark theme (Recommended)</p>
                </div>
                <Switch defaultChecked disabled />
              </div>
              <div className="flex justify-end">
                <Button variant="destructive" size="sm">Sign Out</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
