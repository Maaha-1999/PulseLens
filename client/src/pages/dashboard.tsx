import { useState, useMemo } from "react";
import { format } from "date-fns";
import PageLayout from "@/components/page-layout";
import StatsCards from "@/components/stats-cards";
import DataTable from "@/components/data-table";
import { topics } from "@/lib/mockData";
import { useSocialData } from "@/hooks/use-social-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Calendar as CalendarIcon, X, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [activeTopic, setActiveTopic] = useState(topics[0].id);
  const [filter, setFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  
  const { data: rawData = [], isLoading, error } = useSocialData(activeTopic);
  const currentTopicName = topics.find(t => t.id === activeTopic)?.name;

  // Handlers to ensure `dateFrom` <= `dateTo`. If user selects inverted range, swap values.
  const handleSelectFrom = (d?: Date | undefined) => {
    if (!d) {
      setDateFrom(undefined);
      setFromOpen(false);
      return;
    }
    if (dateTo && d > dateTo) {
      // swap
      setDateFrom(dateTo);
      setDateTo(d);
    } else {
      setDateFrom(d);
    }
    setFromOpen(false);
  };

  const handleSelectTo = (d?: Date | undefined) => {
    if (!d) {
      setDateTo(undefined);
      setToOpen(false);
      return;
    }
    if (dateFrom && d < dateFrom) {
      // swap
      setDateTo(dateFrom);
      setDateFrom(d);
    } else {
      setDateTo(d);
    }
    setToOpen(false);
  };

  // Filter data based on Date Range (for Stats)
  const dateFilteredData = useMemo(() => {
    console.log(`Raw data count: ${rawData.length}`);

    if (!dateFrom && !dateTo) {
      console.log("No date range selected, showing all data");
      return rawData;
    }

    // Convert Date objects to YYYY-MM-DD strings
    const pad = (n: number) => String(n).padStart(2, "0");
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const fromYMD = dateFrom ? toYMD(dateFrom) : null;
    const toYMD_str = dateTo ? toYMD(dateTo) : null;

    console.log(`📅 Filtering for range: ${fromYMD || "(none)"} to ${toYMD_str || "(none)"}`);

    const filtered = rawData.filter((post) => {
      // Get the raw date strings from post
      const rawFrom = post.dateFrom || post.date || "";
      const rawTo = post.dateTo || rawFrom;

      // Normalize dates - extract YYYY-MM-DD only
      const normalizeDate = (s: string) => {
        if (!s) return "";
        const str = String(s).trim();
        // If already YYYY-MM-DD, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
        // Extract YYYY-MM-DD from datetime strings
        const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : "";
      };

      const postFrom = normalizeDate(rawFrom);
      const postTo = normalizeDate(rawTo) || postFrom;

      if (!postFrom) {
        return false; // Skip posts with no valid date
      }

      console.log(`  Post: ${postFrom} to ${postTo}`);

      // Both dates selected: post must be COMPLETELY within the filter range
      if (fromYMD && toYMD_str) {
        const passes = postFrom >= fromYMD && postTo <= toYMD_str;
        console.log(`    Filter: ${fromYMD} to ${toYMD_str} -> ${passes ? '✅' : '❌'}`);
        return passes;
      }

      // Only "from" selected: post must end on or after fromYMD
      if (fromYMD && !toYMD_str) {
        const passes = postTo >= fromYMD;
        console.log(`    From ${fromYMD} onwards -> ${passes ? '✅' : '❌'}`);
        return passes;
      }

      // Only "to" selected: post must start on or before toYMD
      if (!fromYMD && toYMD_str) {
        const passes = postFrom <= toYMD_str;
        console.log(`    Up to ${toYMD_str} -> ${passes ? '✅' : '❌'}`);
        return passes;
      }

      return true;
    });

    console.log(`✅ Total filtered: ${filtered.length} posts`);
    return filtered;
  }, [rawData, dateFrom, dateTo]);

  // Filter data based on Date AND Text Search (for Table & Export)
  const fullyFilteredData = useMemo(() => {
    const lowerFilter = filter.toLowerCase();
    return dateFilteredData.filter((post) => 
      (post.accountName || "").toLowerCase().includes(lowerFilter) ||
      (post.handle || "").toLowerCase().includes(lowerFilter) ||
      (post.narrative || "").toLowerCase().includes(lowerFilter)
    );
  }, [dateFilteredData, filter]);

  const handleExport = () => {
    // Define CSV headers
    const headers = ["ID", "Account Name", "Handle", "Platform", "Location", "Geo Coordinates", "Engagements", "Narrative", "Date From", "Date To"];
    
    // Convert data to CSV format
    const csvContent = [
      headers.join(","),
      ...fullyFilteredData.map(row => [
        row.id,
        `"${(row.accountName || "").replace(/"/g, '""')}"`,
        row.handle || "",
        row.platform || "",
        `"${(row.location || "").replace(/"/g, '""')}"`,
        `"${row.geoCoordinates || ""}"`,
        row.engagements || 0,
        `"${(row.narrative || "").replace(/"/g, '""')}"`,
        row.dateFrom || "",
        row.dateTo || ""
      ].join(","))
    ].join("\n");

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PulseLens_Report_${currentTopicName}_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageLayout title="All Data">
      <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Real-time narrative tracking for{" "}
              <span className="text-primary font-medium">{currentTopicName}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-col sm:flex-row gap-2">
              <Popover open={fromOpen} onOpenChange={setFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal bg-secondary/30 border-border/50 hover:bg-secondary/50 w-full sm:w-auto",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {dateFrom ? `From: ${format(dateFrom, "PPP")}` : "Date From"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  {fromOpen && (
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={handleSelectFrom}
                      initialFocus
                    />
                  )}
                </PopoverContent>
              </Popover>

              {dateFrom && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDateFrom(undefined)}
                  className="h-9 w-9 hover:bg-secondary/50 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <Popover open={toOpen} onOpenChange={setToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal bg-secondary/30 border-border/50 hover:bg-secondary/50 w-full sm:w-auto",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {dateTo ? `To: ${format(dateTo, "PPP")}` : "Date To"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  {toOpen && (
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={handleSelectTo}
                      initialFocus
                    />
                  )}
                </PopoverContent>
              </Popover>

              {dateTo && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDateTo(undefined)}
                  className="h-9 w-9 hover:bg-secondary/50 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Button
              onClick={handleExport}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(34,211,238,0.3)] w-full sm:w-auto"
              disabled={isLoading || rawData.length === 0}
            >
              <Download className="w-4 h-4 mr-2 shrink-0" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Topic Tabs */}
        <Tabs
          value={activeTopic}
          onValueChange={(val) => {
            setActiveTopic(val);
          }}
          className="w-full"
        >
          <TabsList className="bg-secondary/40 border border-border/50 p-1 h-auto flex-wrap">
            {topics.map((topic) => (
              <TabsTrigger
                key={topic.id}
                value={topic.id}
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none py-2 px-3 sm:px-4 transition-all text-xs sm:text-sm"
              >
                {topic.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="glass-panel rounded-xl p-4 md:p-6 border-destructive/50 text-center">
            <p className="text-destructive mb-2 text-sm md:text-base">
              Failed to load data from Supabase.
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              Please check your connection and try again.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Overview - Only show when a date/from-to is selected */}
            {(dateFrom || dateTo) && (
              <section>
                <StatsCards data={dateFilteredData} />
              </section>
            )}

            {/* Main Data Table - Uses data filtered by DATE and TEXT */}
            <section className="glass-panel rounded-xl p-4 md:p-6 border-border/50">
              <div className="mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-white">
                  Detailed Narratives
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {rawData.length === 0 ? (
                    "No data available. Check your Supabase connection and table setup."
                  ) : dateFrom || dateTo ? (
                    dateFrom && dateTo ? (
                      `Showing ${fullyFilteredData.length} narratives for ${format(
                        dateFrom,
                        "PPP"
                      )} - ${format(dateTo, "PPP")}`
                    ) : dateFrom ? (
                      `Showing ${fullyFilteredData.length} narratives from ${format(
                        dateFrom,
                        "PPP"
                      )}`
                    ) : (
                      `Showing ${fullyFilteredData.length} narratives up to ${format(
                        dateTo!,
                        "PPP"
                      )}`
                    )
                  ) : (
                    `Showing all ${fullyFilteredData.length} narratives. Select a date range to filter.`
                  )}
                </p>
              </div>
              <DataTable
                data={fullyFilteredData}
                filter={filter}
                setFilter={setFilter}
              />
            </section>
          </>
        )}
      </div>
    </PageLayout>
  );
}