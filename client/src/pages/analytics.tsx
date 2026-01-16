import { useState, useMemo } from "react";
import { format } from "date-fns";
import PageLayout from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { useSocialData } from "@/hooks/use-social-data";
import { Loader2, Calendar as CalendarIcon, X } from "lucide-react";
import { topics } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const AUTHOR_COLORS = ["#22d3ee", "#818cf8", "#a78bfa", "#c084fc", "#e879f9"];
const PLATFORM_COLORS: Record<string, string> = {
  Twitter: "#1DA1F2",
  X: "#000000",
  Facebook: "#4267B2",
  Instagram: "#E4405F",
  LinkedIn: "#0A66C2",
  YouTube: "#FF0000",
  TikTok: "#69C9D0",
  Reddit: "#FF4500",
  "Online News": "#10B981",
  Other: "#6B7280",
};

const normalizePlatform = (platform: string): string => {
  const lower = platform.toLowerCase().trim();
  if (lower === "twitter" || lower === "x") return "X";
  if (lower === "tiktok") return "TikTok";
  if (lower === "facebook" || lower === "fb") return "Facebook";
  if (lower === "instagram" || lower === "ig") return "Instagram";
  if (lower === "linkedin") return "LinkedIn";
  if (lower === "youtube" || lower === "yt") return "YouTube";
  if (lower === "reddit") return "Reddit";
  if (lower === "online news" || lower === "onlinenews" || lower === "online_news") return "Online News";
  return platform;
};

export default function Analytics() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  // Fetch data from both tables
  const { data: fmData = [], isLoading: fmLoading } = useSocialData("topic1");
  const { data: ptiData = [], isLoading: ptiLoading } = useSocialData("topic2");

  const isLoading = fmLoading || ptiLoading;
  const allData = [...fmData, ...ptiData];

  // Handlers to ensure `dateFrom` <= `dateTo`
  const handleSelectFrom = (d?: Date | undefined) => {
    if (!d) {
      setDateFrom(undefined);
      setFromOpen(false);
      return;
    }
    if (dateTo && d > dateTo) {
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
      setDateTo(dateFrom);
      setDateFrom(d);
    } else {
      setDateTo(d);
    }
    setToOpen(false);
  };

  // Filter data based on date range
  const dateFilteredData = useMemo(() => {
    if (!dateFrom && !dateTo) {
      return allData;
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const fromYMD = dateFrom ? toYMD(dateFrom) : null;
    const toYMD_str = dateTo ? toYMD(dateTo) : null;

    return allData.filter((post) => {
      const rawFrom = post.dateFrom || post.date || "";
      const rawTo = post.dateTo || rawFrom;

      const normalizeDate = (s: string) => {
        if (!s) return "";
        const str = String(s).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
        const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : "";
      };

      const postFrom = normalizeDate(rawFrom);
      const postTo = normalizeDate(rawTo) || postFrom;

      if (!postFrom) return false;

      if (fromYMD && toYMD_str) {
        return postFrom >= fromYMD && postTo <= toYMD_str;
      }
      if (fromYMD && !toYMD_str) {
        return postTo >= fromYMD;
      }
      if (!fromYMD && toYMD_str) {
        return postFrom <= toYMD_str;
      }
      return true;
    });
  }, [allData, dateFrom, dateTo]);

  // Calculate engagement trends for last 7 days of available data
  const engagementTrends = useMemo(() => {
    if (dateFilteredData.length === 0) return [];

    console.log("📊 Total posts for analytics:", dateFilteredData.length);

    // Get all unique dates from the data
    const allDates = new Set<string>();
    dateFilteredData.forEach(post => {
      const dateFrom = post.dateFrom || post.date || "";
      const dateTo = post.dateTo || dateFrom;
      
      if (dateFrom) allDates.add(dateFrom);
      if (dateTo && dateTo !== dateFrom) allDates.add(dateTo);
    });

    // Convert to array and sort (most recent first)
    const sortedDates = Array.from(allDates).sort((a, b) => b.localeCompare(a));
    
    console.log("📅 Available dates:", sortedDates.slice(0, 10));

    if (sortedDates.length === 0) return [];

    // Get the last 7 unique dates from the data
    const last7Dates = sortedDates.slice(0, 7).reverse(); // Reverse to show oldest to newest

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const trends = last7Dates.map(dateStr => {
      const date = new Date(dateStr + "T00:00:00");
      const dayName = dayNames[date.getDay()];
      
      // Sum engagements for posts that match this exact date
      const postsOnThisDay = dateFilteredData.filter(post => {
        const postFrom = post.dateFrom || post.date || "";
        const postTo = post.dateTo || postFrom;
        
        // Check if this date falls within the post's date range
        return postFrom <= dateStr && postTo >= dateStr;
      });

      const totalEngagement = postsOnThisDay.reduce((sum, post) => sum + (post.engagements || 0), 0);

      console.log(`📅 ${dayName} (${dateStr}): ${postsOnThisDay.length} posts, ${totalEngagement} engagements`);

      return {
        name: dayName,
        engagement: totalEngagement,
        date: dateStr
      };
    });

    console.log("📈 Engagement trends:", trends);
    return trends;
  }, [dateFilteredData]);

  // Calculate top 10 authors by engagement
  const topAuthors = useMemo(() => {
    if (dateFilteredData.length === 0) return [];

    // Sum engagements by each author
    const authorEngagements = new Map<string, number>();
    
    dateFilteredData.forEach(post => {
      const author = post.handle || post.accountName || "Unknown";
      authorEngagements.set(author, (authorEngagements.get(author) || 0) + (post.engagements || 0));
    });

    // Convert to array and sort by engagements
    const sortedAuthors = Array.from(authorEngagements.entries())
      .map(([name, engagements]) => ({ name, engagements }))
      .sort((a, b) => b.engagements - a.engagements)
      .slice(0, 10);

    return sortedAuthors;
  }, [dateFilteredData]);

  // Platform distribution (entry count)
  const platformDistribution = useMemo(() => {
    if (dateFilteredData.length === 0) return [];

    const platformCounts = new Map<string, number>();
    dateFilteredData.forEach(post => {
      const platform = normalizePlatform(post.platform || "Other");
      platformCounts.set(platform, (platformCounts.get(platform) || 0) + 1);
    });

    return Array.from(platformCounts.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: PLATFORM_COLORS[name] || PLATFORM_COLORS.Other,
      }))
      .sort((a, b) => b.value - a.value);
  }, [dateFilteredData]);

  // Engagement by platform (last 7 days of available data)
  const engagementByPlatform = useMemo(() => {
    if (allData.length === 0) return [];

    // Find the most recent date in the data
    const dates = allData
      .map(post => post.dateFrom || post.date || "")
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a));
    
    const mostRecentDate = dates[0] || "";
    if (!mostRecentDate) return [];

    // Get 7 days before the most recent date
    const recentDate = new Date(mostRecentDate + "T00:00:00");
    const weekAgo = new Date(recentDate);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    const weekData = allData.filter(post => {
      const postDate = post.dateFrom || post.date || "";
      return postDate >= weekAgoStr;
    });

    const platformEngagements = new Map<string, number>();
    weekData.forEach(post => {
      const platform = normalizePlatform(post.platform || "Other");
      platformEngagements.set(platform, (platformEngagements.get(platform) || 0) + (post.engagements || 0));
    });

    return Array.from(platformEngagements.entries())
      .map(([name, engagement]) => ({
        name,
        engagement,
        color: PLATFORM_COLORS[name] || PLATFORM_COLORS.Other,
      }))
      .sort((a, b) => b.engagement - a.engagement);
  }, [allData]);

  if (isLoading) {
    return (
      <PageLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Analytics">
      <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
              Analytics Overview
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Deep dive into engagement metrics and platform performance.
              {(dateFrom || dateTo) && (
                <span className="ml-2 text-primary">
                  {dateFrom && dateTo
                    ? `(${format(dateFrom, "MMM d")} - ${format(dateTo, "MMM d, yyyy")})`
                    : dateFrom
                    ? `(From ${format(dateFrom, "MMM d, yyyy")})`
                    : `(Up to ${format(dateTo!, "MMM d, yyyy")})`}
                </span>
              )}
            </p>
          </div>

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
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-lg md:text-xl">
                Engagement Trends (Recent Activity)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px] pr-6 pl-0 min-w-0 min-h-0">
              {engagementTrends.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No data available for the last 7 days
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementTrends}>
                    <defs>
                      <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#1e293b",
                      }}
                      itemStyle={{ color: "#e2e8f0" }}
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        "Engagements",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEngagement)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-lg md:text-xl">
                Top 10 Authors by Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] sm:h-[400px]">
              {topAuthors.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No author data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topAuthors}
                    layout="vertical"
                    margin={{ left: 60, right: 10, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                      }
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#e2e8f0"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#1e293b",
                      }}
                      itemStyle={{ color: "#e2e8f0" }}
                      formatter={(value: number) => [value.toLocaleString(), "Engagements"]}
                    />
                    <Bar dataKey="engagements" radius={[0, 4, 4, 0]} barSize={24}>
                      {topAuthors.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={AUTHOR_COLORS[index % AUTHOR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-lg md:text-xl">
                Platform Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px] pl-0 pr-6">
              {platformDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No platform data available
                </div>
              ) : (
                <div className="flex h-full items-center">
                  <div className="w-1/2 h-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius="35%"
                          outerRadius="70%"
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {platformDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#1e293b",
                          }}
                          itemStyle={{ color: "#e2e8f0" }}
                          formatter={(value: number) => [value.toLocaleString(), "Entries"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 flex flex-col gap-2 pl-4 min-w-0">
                    {platformDistribution.slice(0, 6).map((item) => {
                      const total = platformDistribution.reduce((sum, p) => sum + p.value, 0);
                      const percent = ((item.value / total) * 100).toFixed(1);
                      return (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                          <div
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-muted-foreground truncate">{item.name}</span>
                          <span className="ml-auto text-white font-medium">{percent}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-lg md:text-xl">
                Engagement by Platform (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px]">
              {engagementByPlatform.length === 0 ? (
                <div className="flex items-center justify-center pl-0 h-full text-sm text-muted-foreground">
                  No engagement data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={engagementByPlatform}
                    layout="vertical"
                    margin={{ left: 5, right: 10, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
                      }
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#e2e8f0"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#1e293b",
                      }}
                      itemStyle={{ color: "#e2e8f0" }}
                      formatter={(value: number) => [value.toLocaleString(), "Engagements"]}
                    />
                    <Bar dataKey="engagement" radius={[0, 4, 4, 0]} barSize={28}>
                      {engagementByPlatform.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}