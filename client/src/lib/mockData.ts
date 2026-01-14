import { format, subDays } from "date-fns";

export interface SocialPost {
  id: string;
  accountName: string;
  handle: string;
  platform: "Twitter" | "Facebook" | "Instagram" | "LinkedIn";
  location: string;
  engagements: number;
  narrative: string;
  geoCoordinates: string;
  date: string;
  dateFrom?: string;
  dateTo?: string;
}

const PLATFORMS = ["Twitter", "Facebook", "Instagram", "LinkedIn"] as const;
const LOCATIONS = ["New York, USA", "London, UK", "Tokyo, Japan", "Berlin, Germany", "Sydney, Australia", "Toronto, Canada", "Paris, France"];

// Helper to generate random data
const generateData = (topic: string, count: number): SocialPost[] => {
  return Array.from({ length: count }).map((_, i) => {
    const date = subDays(new Date(), Math.floor(Math.random() * 30));
    return {
      id: `${topic}-${i}`,
      accountName: `User ${Math.floor(Math.random() * 100)}`,
      handle: `@user_${Math.floor(Math.random() * 100)}`,
      platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
      location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      engagements: Math.floor(Math.random() * 5000) + 50,
      narrative: `Discussion about ${topic} trends and impact on local communities. key takeaways include...`,
      geoCoordinates: `${(Math.random() * 180 - 90).toFixed(4)}, ${(Math.random() * 360 - 180).toFixed(4)}`,
      date: format(date, "yyyy-MM-dd"),
    };
  });
};

export const topic1Data = generateData("Sustainability", 50);
export const topic2Data = generateData("AI Technology", 50);

export const topics = [
  { id: "topic1", name: "AM-WW" },
  { id: "topic2", name: "CPTI" },
];
