import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SocialPost } from "@/lib/mockData";

const TABLE_NAMES = ["FM", "PTI"];

export interface AccountGroup {
  handle: string;
  accountName: string;
  entries: SocialPost[];
  count: number;
}

export function useAllSocialData() {
  return useQuery({
    queryKey: ["all-social-data"],
    queryFn: async () => {
      const allData: SocialPost[] = [];

      for (const tableName of TABLE_NAMES) {
        const { data, error } = await supabase.from(tableName).select("*");

        if (error) {
          console.error(`Error fetching from ${tableName}:`, error);
          continue;
        }

        const normalizeDate = (s: any) => {
          if (!s) return "";
          const str = String(s).trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
          const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
          if (match) return match[1];
          return "";
        };

        const restoreSpaces = (s: string) => {
          if (!s) return s;
          if (s.includes(" ")) return s;
          let t = s.replace(/([,;:.!?])([A-Za-z0-9"'`''""])/g, "$1 $2");
          t = t.replace(/([a-z])([A-Z])/g, "$1 $2");
          t = t.replace(/([A-Za-z])(\d)/g, "$1 $2").replace(/(\d)([A-Za-z])/g, "$1 $2");
          return t;
        };

        const transformed = (data || []).map((row: any, index: number) => {
          const rawDateFrom = row.Date_From || row.date_from || row.DateFrom || row.dateFrom || "";
          const rawDateTo = row.Date_To || row.date_to || row.DateTo || row.dateTo || "";
          const rawDatePrimary = rawDateFrom || rawDateTo || row.date || row.Date || row.created_at || "";

          const rawNarrative = row.narrative || row.Narrative || row.message || row.Message || "";

          return {
            id: row.id || row.ID || `${tableName}-${index}`,
            accountName: row.account || row.Account || row.account_name || row.Account_Name || `Account ${index}`,
            handle: row.handle || row.Handle || row.account || row.Account || `@user${index}`,
            platform: (row.platform || row.Platform || "Twitter") as any,
            location: row.location || row.Location || "Unknown",
            engagements: parseInt(row.engagement || row.Engagement || row.engagements || row.Engagements || 0),
            narrative: restoreSpaces(rawNarrative),
            geoCoordinates: row.geo_coordinates || row.Geo_Coordinates || row.coordinates || "",
            date: normalizeDate(rawDatePrimary),
            dateFrom: normalizeDate(rawDateFrom),
            dateTo: normalizeDate(rawDateTo),
            source: tableName,
          } as SocialPost;
        });

        allData.push(...transformed);
      }

      return allData;
    },
  });
}

export function useAccountGroups() {
  const { data: allData = [], isLoading, error } = useAllSocialData();

  const accountGroups: AccountGroup[] = [];
  const groupMap = new Map<string, AccountGroup>();

  allData.forEach((post) => {
    const handle = post.handle || post.accountName || "Unknown";
    
    if (!groupMap.has(handle)) {
      groupMap.set(handle, {
        handle,
        accountName: post.accountName || handle,
        entries: [],
        count: 0,
      });
    }

    const group = groupMap.get(handle)!;
    group.entries.push(post);
    group.count++;
  });

  groupMap.forEach((group) => {
    group.entries.sort((a, b) => {
      const dateA = a.dateFrom || a.date || "";
      const dateB = b.dateFrom || b.date || "";
      return dateB.localeCompare(dateA);
    });
    accountGroups.push(group);
  });

  accountGroups.sort((a, b) => b.count - a.count);

  return { accountGroups, isLoading, error };
}
