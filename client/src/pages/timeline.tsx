import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Calendar, FileText, Loader2, Search, X } from "lucide-react";
import PageLayout from "@/components/page-layout";
import { cn } from "@/lib/utils";
import { useAllSocialData } from "@/hooks/use-all-social-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SocialPost } from "@/lib/mockData";

interface DateGroup {
  date: string;
  displayDate: string;
  entries: SocialPost[];
  count: number;
}

export default function Timeline() {
  const { data: allData = [], isLoading, error } = useAllSocialData();
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const dateGroups = useMemo(() => {
    const groupMap = new Map<string, DateGroup>();

    allData.forEach((post) => {
      const dateKey = post.dateFrom || post.date || "Unknown";
      
      if (!groupMap.has(dateKey)) {
        const displayDate = dateKey !== "Unknown" 
          ? new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })
          : "Unknown Date";

        groupMap.set(dateKey, {
          date: dateKey,
          displayDate,
          entries: [],
          count: 0,
        });
      }

      const group = groupMap.get(dateKey)!;
      group.entries.push(post);
      group.count++;
    });

    const groups = Array.from(groupMap.values());
    groups.sort((a, b) => b.date.localeCompare(a.date));

    return groups;
  }, [allData]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return dateGroups;
    const query = searchQuery.toLowerCase();
    return dateGroups.filter(
      (group) =>
        group.date.includes(query) ||
        group.displayDate.toLowerCase().includes(query)
    );
  }, [dateGroups, searchQuery]);

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const getDateSummary = (entries: SocialPost[]) => {
    if (entries.length === 0) return null;

    const totalEngagements = entries.reduce((sum, e) => sum + (e.engagements || 0), 0);
    
    const uniqueAccounts = new Set(entries.map((e) => e.handle || e.accountName));
    
    const platforms = new Map<string, number>();
    entries.forEach((e) => {
      const p = e.platform || "Unknown";
      platforms.set(p, (platforms.get(p) || 0) + 1);
    });
    const topPlatforms = Array.from(platforms.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    return { totalEngagements, uniqueAccounts: uniqueAccounts.size, topPlatforms };
  };

  return (
    <PageLayout title="Timeline">
      <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
              Timeline
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Browse all entries organized by date from both data sources.
              {searchQuery && (
                <span className="ml-2 text-primary">
                  ({filteredGroups.length} of {dateGroups.length} dates)
                </span>
              )}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 bg-secondary/30 border-border/50"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-secondary/50"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
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
        ) : filteredGroups.length === 0 ? (
          <Card className="glass-panel border-border/50">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? `No dates matching "${searchQuery}"` : "No data found."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredGroups.map((group) => {
              const isExpanded = expandedDates.has(group.date);
              const summary = getDateSummary(group.entries);
              return (
                <Card key={group.date} className="glass-panel border-border/50">
                  <CardHeader className="p-0">
                    <button
                      onClick={() => toggleDate(group.date)}
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base md:text-lg truncate">
                          {group.displayDate}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {group.date}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-semibold text-primary">{group.count}</span>
                        <p className="text-xs text-muted-foreground">entries</p>
                      </div>
                    </button>
                  </CardHeader>

                  {summary && (
                    <div className="px-4 py-3 bg-secondary/20 border-t border-border/30">
                      <div className="flex flex-wrap gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Accounts: </span>
                          <span className="text-foreground">{summary.uniqueAccounts}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Engagements: </span>
                          <span className="text-foreground">{summary.totalEngagements.toLocaleString()}</span>
                        </div>
                        {summary.topPlatforms.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Platforms: </span>
                            <span className="text-foreground">{summary.topPlatforms.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isExpanded && (
                    <CardContent className="p-0 border-t border-border/30">
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
