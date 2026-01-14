import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Clock, FileText, Loader2, Download } from "lucide-react";
import PageLayout from "@/components/page-layout";
import { cn } from "@/lib/utils";
import { useAllSocialData } from "@/hooks/use-all-social-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SocialPost } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

interface TableGroup {
  tableName: string;
  entries: SocialPost[];
  count: number;
  totalEngagements: number;
  uniqueAccounts: number;
}

export default function Today() {
  const { data: allData = [], isLoading, error } = useAllSocialData();
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(["FM", "PTI"]));
  const { toast } = useToast();

  const { todayStr, yesterdayStr } = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      todayStr: today,
      yesterdayStr: yesterday.toISOString().split("T")[0],
    };
  }, []);

  const tableGroups = useMemo(() => {
    const rangeData = allData.filter((post) => {
      const postDate = post.dateFrom || post.date || "";
      return postDate === todayStr || postDate === yesterdayStr;
    });

    const groupMap = new Map<string, TableGroup>();

    rangeData.forEach((post) => {
      const tableName = (post as any).source || "Unknown";

      if (!groupMap.has(tableName)) {
        groupMap.set(tableName, {
          tableName,
          entries: [],
          count: 0,
          totalEngagements: 0,
          uniqueAccounts: 0,
        });
      }

      const group = groupMap.get(tableName)!;
      group.entries.push(post);
      group.count++;
      group.totalEngagements += post.engagements || 0;
    });

    groupMap.forEach((group) => {
      const uniqueHandles = new Set(group.entries.map((e) => e.handle || e.accountName));
      group.uniqueAccounts = uniqueHandles.size;
      group.entries.sort((a, b) => {
        const engA = a.engagements || 0;
        const engB = b.engagements || 0;
        return engB - engA;
      });
    });

    const tables = ["FM", "PTI"];
    return tables.map((name) => groupMap.get(name) || {
      tableName: name,
      entries: [],
      count: 0,
      totalEngagements: 0,
      uniqueAccounts: 0,
    });
  }, [allData, todayStr]);

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  };

  const totalEntries = tableGroups.reduce((sum, g) => sum + g.count, 0);

  const handleExport = () => {
    const allEntries = tableGroups.flatMap((g) => g.entries);
    const headers = ["Table", "Handle", "Account", "Platform", "Engagements", "Narrative", "Date", "Location"];
    const csvContent = [
      headers.join(","),
      ...allEntries.map((entry) => [
        `"${(entry as any).source || ""}"`,
        `"${entry.handle || ""}"`,
        `"${(entry.accountName || "").replace(/"/g, '""')}"`,
        `"${entry.platform || ""}"`,
        entry.engagements || 0,
        `"${(entry.narrative || "").replace(/"/g, '""')}"`,
        `"${entry.dateFrom || entry.date || ""}"`,
        `"${(entry.location || "").replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PulseLens_Today_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Complete", description: `Exported ${allEntries.length} entries to CSV.` });
  };

  return (
    <PageLayout title="Today">
      <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
              Today's Data
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Entries from {new Date(yesterdayStr + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
              })} - {new Date(todayStr + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })} — {totalEntries} total entries
            </p>
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            className="bg-secondary/30 border-border/50 hover:bg-secondary/50"
            disabled={totalEntries === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="glass-panel border-destructive/50">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">Failed to load data.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {tableGroups.map((group) => {
              const isExpanded = expandedTables.has(group.tableName);
              const tableColor = group.tableName === "FM" 
                ? "from-cyan-500 to-blue-600" 
                : "from-orange-500 to-red-600";

              return (
                <Card key={group.tableName} className="glass-panel border-border/50">
                  <CardHeader className="p-0">
                    <button
                      onClick={() => toggleTable(group.tableName)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 text-left rounded-t-lg transition-all duration-200",
                        "hover:bg-white/5",
                        isExpanded && "bg-primary/5"
                      )}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-primary shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <div className={cn(
                        "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0",
                        tableColor
                      )}>
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base md:text-lg">
                          {group.tableName} Table
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {group.uniqueAccounts} accounts • {group.totalEngagements.toLocaleString()} engagements
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-semibold text-primary">{group.count}</span>
                        <p className="text-xs text-muted-foreground">entries</p>
                      </div>
                    </button>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="p-0 border-t border-border/30">
                      {group.count === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-muted-foreground">No entries for today in this table.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/30">
                          {group.entries.map((entry, idx) => (
                            <div
                              key={`${entry.id}-${idx}`}
                              className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors"
                            >
                              <FileText className="w-4 h-4 shrink-0 mt-1 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-xs font-medium text-primary">
                                    {entry.handle || entry.accountName}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                                    {entry.platform}
                                  </span>
                                  {entry.engagements > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      {entry.engagements.toLocaleString()} engagements
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-foreground/90 leading-relaxed">
                                  {entry.narrative || "No narrative"}
                                </p>
                                {entry.location && entry.location !== "Unknown" && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {entry.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
