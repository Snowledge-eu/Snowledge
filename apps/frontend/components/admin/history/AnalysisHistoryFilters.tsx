import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { Filter, Loader2 } from "lucide-react";
import { Prompt, Community, HistoryFilters } from "../shared/types";

interface AnalysisHistoryFiltersProps {
  prompts: Prompt[];
  communities: Community[];
  filters: HistoryFilters;
  onFiltersChange: (filters: HistoryFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading: boolean;
}

export const AnalysisHistoryFilters = ({
  prompts,
  communities,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  loading,
}: AnalysisHistoryFiltersProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters & Sort
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="platform-filter">Platform</Label>
            <Select
              value={filters.platform}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, platform: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt-filter">Prompt</Label>
            <Select
              value={filters.prompt_key}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, prompt_key: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prompts</SelectItem>
                {prompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.name}>
                    {prompt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="community-filter">Community</Label>
            <Select
              value={filters.community}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, community: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Communities</SelectItem>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.name}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort-order">Sort Order</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value: "asc" | "desc") =>
                onFiltersChange({ ...filters, sortOrder: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="use-date-filter"
                checked={filters.useDateFilter}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, useDateFilter: checked })
                }
              />
              <Label htmlFor="use-date-filter">Filter by Date</Label>
            </div>
          </div>
        </div>

        {filters.useDateFilter && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="date-from">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  onFiltersChange({ ...filters, date_from: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.date_to}
                onChange={(e) =>
                  onFiltersChange({ ...filters, date_to: e.target.value })
                }
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button onClick={onApplyFilters} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Filter className="h-4 w-4 mr-2" />
            )}
            Apply Filters
          </Button>
          <Button variant="outline" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
