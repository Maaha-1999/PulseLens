import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, User, FileText, Loader2, Search, X } from "lucide-react";
import PageLayout from "@/components/page-layout";
import { cn } from "@/lib/utils";
import { useAccountGroups } from "@/hooks/use-all-social-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Accounts() {
  const { accountGroups, isLoading, error } = useAccountGroups();
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accountGroups;
    const query = searchQuery.toLowerCase();
    return accountGroups.filter(
      (group) =>
        group.handle.toLowerCase().includes(query) ||
        group.accountName.toLowerCase().includes(query)
    );
  }, [accountGroups, searchQuery]);

  const toggleAccount = (handle: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) {
        next.delete(handle);
      } else {
        next.add(handle);
      }
      return next;
    });
  };

  const getAccountSummary = (entries: typeof accountGroups[0]["entries"]) => {
    if (entries.length === 0) return null;

    const dates = entries
      .map((e) => e.dateFrom || e.date || "")
      .filter(Boolean)
      .sort();
    const dateRange = dates.length > 0 
      ? dates.length > 1 
        ? `${dates[0]} to ${dates[dates.length - 1]}`
        : dates[0]
      : "No dates";

    const totalEngagements = entries.reduce((sum, e) => sum + (e.engagements || 0), 0);

    const narratives = entries
      .map((e) => e.narrative || "")
      .filter(Boolean);
    
    const wordFreq = new Map<string, number>();
    const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "as", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "shall", "can", "need", "dare", "ought", "used", "that", "this", "these", "those", "with", "from", "by", "about", "into", "through", "during", "before", "after", "above", "below", "between", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "just", "also", "now", "him", "his", "her", "he", "she", "it", "its", "they", "them", "their", "who", "which", "what", "whose"]);
    
    narratives.forEach((narrative) => {
      const words = narrative.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
      words.forEach((word) => {
        if (word.length > 3 && !stopWords.has(word)) {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
      });
    });

    const topKeywords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    return { dateRange, totalEngagements, topKeywords };
  };

  return (
    <PageLayout title="Accounts">
      <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
              Accounts
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Browse all entries organized by account handle from both data sources.
              {searchQuery && (
                <span className="ml-2 text-primary">
                  ({filteredAccounts.length} of {accountGroups.length} accounts)
                </span>
              )}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by handle..."
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
              <p className="text-destructive">Failed to load accounts data.</p>
            </CardContent>
          </Card>
        ) : filteredAccounts.length === 0 ? (
          <Card className="glass-panel border-border/50">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? `No accounts matching "${searchQuery}"` : "No accounts found."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAccounts.map((group) => {
              const isExpanded = expandedAccounts.has(group.handle);
              const summary = getAccountSummary(group.entries);
              return (
                <Card key={group.handle} className="glass-panel border-border/50">
                  <CardHeader className="p-0">
                    <button
                      onClick={() => toggleAccount(group.handle)}
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base md:text-lg truncate">
                          {group.handle}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {group.accountName !== group.handle && group.accountName}
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
                          <span className="text-muted-foreground">Activity: </span>
                          <span className="text-foreground">{summary.dateRange}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Engagements: </span>
                          <span className="text-foreground">{summary.totalEngagements.toLocaleString()}</span>
                        </div>
                      </div>
                      {summary.topKeywords.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Key themes: </span>
                          <div className="inline-flex flex-wrap gap-1.5 mt-1">
                            {summary.topKeywords.map((keyword) => (
                              <span
                                key={keyword}
                                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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
                                <span className="text-xs text-primary font-medium">
                                  {entry.dateFrom || entry.date || "No date"}
                                  {entry.dateTo && entry.dateTo !== entry.dateFrom && ` - ${entry.dateTo}`}
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
