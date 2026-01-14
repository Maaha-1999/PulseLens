import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, FileSpreadsheet, RefreshCw, CheckCircle2 } from "lucide-react";

export default function DataSources() {
  return (
    <Layout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Data Sources</h1>
          <p className="text-muted-foreground">Manage connections to Supabase and external data feeds.</p>
        </div>

        <div className="grid gap-6">
          {/* Supabase Connection */}
          <Card className="glass-panel border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  Supabase Database
                </CardTitle>
                <CardDescription>Primary data warehouse for social narratives</CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between text-sm border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Last Sync</span>
                  <span className="font-mono">Just now</span>
                </div>
                <div className="flex justify-between text-sm border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Total Records</span>
                  <span className="font-mono">12,450</span>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="outline" size="sm" className="bg-secondary/30 border-border/50">
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Sync Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Excel Import */}
          <Card className="glass-panel border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  Excel Workbook Import
                </CardTitle>
                <CardDescription>Automated daily import script (Python)</CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Active
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-4">
                <div className="p-3 bg-black/20 rounded-md border border-border/50 font-mono text-xs text-muted-foreground">
                  04:00 AM - Scheduled Job: Import "Daily_Narratives.xlsx"<br/>
                  04:01 AM - Processing Sheet 1: "Sustainability"<br/>
                  04:01 AM - Processing Sheet 2: "AI Tech"<br/>
                  04:02 AM - Success: 142 records added to Supabase
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
