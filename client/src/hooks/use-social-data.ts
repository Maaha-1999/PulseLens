import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SocialPost } from "@/lib/mockData";

// Map topic IDs to actual Supabase table names
const TABLE_MAPPING: Record<string, string> = {
  "topic1": "FM",
  "topic2": "PTI"
};

export function useSocialData(topicId: string) {
  return useQuery({
    queryKey: ["social-data", topicId],
    queryFn: async () => {
      const tableName = TABLE_MAPPING[topicId];
      if (!tableName) {
        console.log("No table mapping found for:", topicId);
        return [];
      }

      console.log(`Fetching data from table: ${tableName}`);
      const { data, error } = await supabase
        .from(tableName)
        .select("*");

      if (error) {
        console.error(`❌ Error fetching data from ${tableName}:`, error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} rows from ${tableName}`);

      if (data && data.length > 0) {
        console.log("📋 Sample row columns:", Object.keys(data[0]));
        console.log("📄 First row data:", data[0]);
      } else {
        console.warn(`⚠️ NO DATA returned from table "${tableName}"!`);
        console.warn(`
 🔍 TROUBLESHOOTING STEPS:
1. ✅ Connection works (no error)
2. ❌ Table returned 0 rows

MOST LIKELY CAUSE: Row Level Security (RLS) is blocking access

 📝 TO FIX:
1. Go to: https://iabkwkrcxpixxijozrvx.supabase.co
2. Click "Authentication" → "Policies"
3. Find table "${tableName}"
4. Click "New Policy" → "Get started quickly"
5. Choose "Enable read access for all users"
6. Click "Review" then "Save policy"

 OR disable RLS entirely:
1. Go to Table Editor
2. Click on "${tableName}" table
3. Click the settings icon
4. Toggle "Enable Row Level Security" OFF
        `);
      }

      // Normalize date string - keep YYYY-MM-DD format, extract date part from ISO strings
      const normalizeDate = (s: any) => {
        if (!s) return "";
        const str = String(s).trim();
        // If already in YYYY-MM-DD format, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
        // If it's an ISO datetime (YYYY-MM-DDTHH:MM:SS), extract just the date part
        const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) return match[1];
        return "";
      };

      // Helper to restore spaces in concatenated text
      const restoreSpaces = (s: string) => {
        if (!s) return s;
        // If text already contains spaces, assume it's fine.
        if (s.includes(" ")) return s;
        // Add a space after common punctuation if missing
        let t = s.replace(/([,;:.!?])([A-Za-z0-9"'`''""])/g, "$1 $2");
        // Insert space before capital letters that follow lower-case letters (e.g., 'AsimMunir' -> 'Asim Munir')
        t = t.replace(/([a-z\p{Ll}])([A-Z\p{Lu}])/gu, "$1 $2");
        // Insert space between a letter and a digit or digit and letter
        t = t.replace(/([A-Za-z])(\d)/g, "$1 $2").replace(/(\d)([A-Za-z])/g, "$1 $2");
        return t;
      };

      // Transform Supabase data to match SocialPost interface
      const transformed = (data || []).map((row: any, index: number) => {
        // Extract Date_From and Date_To (various column names)
        const rawDateFrom = row.Date_From || row.date_from || row.DateFrom || row.dateFrom || "";
        const rawDateTo = row.Date_To || row.date_to || row.DateTo || row.dateTo || "";
        // Use Date_From as the primary date for backwards compatibility
        const rawDatePrimary = rawDateFrom || rawDateTo || row.date || row.Date || row.created_at || "";

        const dateFromValue = normalizeDate(rawDateFrom);
        const dateToValue = normalizeDate(rawDateTo);
        const dateValue = normalizeDate(rawDatePrimary);

        console.log(`Row ${index}: Raw dates - From: "${rawDateFrom}", To: "${rawDateTo}" -> Normalized - From: "${dateFromValue}", To: "${dateToValue}"`);

        const rawNarrative = row.narrative || row.Narrative || row.message || row.Message || "";
        const narrativeValue = restoreSpaces(rawNarrative);

        const result = {
          id: row.id || row.ID || `${tableName}-${index}`,
          accountName: row.account || row.Account || row.account_name || row.Account_Name || `Account ${index}`,
          handle: row.handle || row.Handle || row.account || row.Account || `@user${index}`,
          platform: (row.platform || row.Platform || "Twitter") as any,
          location: row.location || row.Location || "Unknown",
          engagements: parseInt(row.engagement || row.Engagement || row.engagements || row.Engagements || 0),
          narrative: narrativeValue,
          geoCoordinates: row.geo_coordinates || row.Geo_Coordinates || row.coordinates || "",
          date: dateValue,
          dateFrom: dateFromValue,
          dateTo: dateToValue,
        };
        return result;
      }) as SocialPost[];

      console.log(`Transformed ${transformed.length} rows`);
      
      // Sort by ID (maintain Supabase order)
      transformed.sort((a, b) => {
        const idA = String(a.id || "");
        const idB = String(b.id || "");
        
        // If IDs are numeric, compare as numbers
        if (!isNaN(Number(idA)) && !isNaN(Number(idB))) {
          return Number(idA) - Number(idB);
        }
        
        // Otherwise compare as strings
        return idA.localeCompare(idB);
      });
      
      console.log(`Sorted ${transformed.length} rows by ID`);
      
      return transformed;
    },
  });
}