import { useState } from "react";
import { SocialPost } from "@/lib/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Twitter, Instagram, Linkedin, MapPin, Globe } from "lucide-react";

interface DataTableProps {
  data: SocialPost[];
  filter: string;
  setFilter: (value: string) => void;
}

export default function DataTable({ 
  data, 
  filter, 
  setFilter, 
}: DataTableProps) {
  const [visibleColumns, setVisibleColumns] = useState({
    accountName: true,
    handle: true,
    platform: true,
    location: true,
    geoCoordinates: true,
    engagements: true,
    narrative: true,
    dateFrom: true,
    dateTo: true,
  });
  const [selectedNarrative, setSelectedNarrative] = useState<{ narrative: string; accountName: string; handle: string } | null>(null);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Twitter": return <Twitter className="w-4 h-4 text-sky-400" />;
      case "Facebook": return null;
      case "Instagram": return <Instagram className="w-4 h-4 text-pink-500" />;
      case "LinkedIn": return <Linkedin className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter accounts, handles..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 bg-secondary/30 border-border/50 focus:border-primary/50 transition-colors text-sm"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto h-9 bg-secondary/30 border-border/50">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-secondary/90 backdrop-blur-xl border-border/50">
            {Object.keys(visibleColumns).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                className="capitalize text-sm"
                checked={visibleColumns[key as keyof typeof visibleColumns]}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, [key]: checked }))
                }
              >
                {key.replace(/([A-Z])/g, " $1").trim()}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border border-border/50 bg-secondary/20 overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-secondary/40">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[80px] text-xs sm:text-sm whitespace-nowrap">ID</TableHead>
              {visibleColumns.accountName && (
                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Account</TableHead>
              )}
              {visibleColumns.handle && (
                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Handle</TableHead>
              )}
              {visibleColumns.platform && (
                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Platform</TableHead>
              )}
              {visibleColumns.location && (
                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Location</TableHead>
              )}
              {visibleColumns.geoCoordinates && (
                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Geo</TableHead>
              )}
              {visibleColumns.engagements && (
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">
                  Engagements
                </TableHead>
              )}
              {visibleColumns.narrative && (
                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Narrative</TableHead>
              )}
              {visibleColumns.dateFrom && (
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">
                  Date From
                </TableHead>
              )}
              {visibleColumns.dateTo && (
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">
                  Date To
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-sm">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((post) => (
                <TableRow
                  key={post.id}
                  className="hover:bg-white/5 border-border/50 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {post.id}
                  </TableCell>

                  {visibleColumns.accountName && (
                    <TableCell className="font-medium text-foreground text-xs sm:text-sm whitespace-nowrap">
                      {post.accountName}
                    </TableCell>
                  )}

                  {visibleColumns.handle && (
                    <TableCell className="text-muted-foreground font-mono text-xs whitespace-nowrap">
                      {post.handle}
                    </TableCell>
                  )}

                  {visibleColumns.platform && (
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {getPlatformIcon(post.platform)}
                        <span className="text-xs">{post.platform}</span>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.location && (
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="text-xs truncate max-w-[120px]">
                          {post.location}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.geoCoordinates && (
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Globe className="w-3 h-3 shrink-0" />
                        <span className="text-xs font-mono">{post.geoCoordinates}</span>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.engagements && (
                    <TableCell className="text-right whitespace-nowrap">
                      <Badge
                        variant="secondary"
                        className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20 font-mono text-xs"
                      >
                        {post.engagements.toLocaleString()}
                      </Badge>
                    </TableCell>
                  )}

                  {visibleColumns.narrative && (
                    <TableCell className="min-w-[200px]">
                      <p 
                        className="text-xs text-muted-foreground line-clamp-2 whitespace-normal break-words cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => setSelectedNarrative({ 
                          narrative: post.narrative, 
                          accountName: post.accountName, 
                          handle: post.handle 
                        })}
                        title="Click to view full narrative"
                      >
                        {post.narrative}
                      </p>
                    </TableCell>
                  )}

                  {visibleColumns.dateFrom && (
                    <TableCell className="text-right text-xs text-muted-foreground font-mono whitespace-nowrap">
                      {(post as any).dateFrom || post.date || "-"}
                    </TableCell>
                  )}

                  {visibleColumns.dateTo && (
                    <TableCell className="text-right text-xs text-muted-foreground font-mono whitespace-nowrap">
                      {(post as any).dateTo || "-"}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedNarrative} onOpenChange={() => setSelectedNarrative(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {selectedNarrative?.accountName} ({selectedNarrative?.handle})
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {selectedNarrative?.narrative}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
