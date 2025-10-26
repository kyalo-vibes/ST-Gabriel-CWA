import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Filter, X, Save } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner@2.0.3';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface FilterPanelProps {
  onFilterChange?: () => void;
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const { activeFilters, setActiveFilters, clearFilters, saveFilter } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  const [localFilters, setLocalFilters] = useState(activeFilters || {});

  const handleStatusChange = (status: string, checked: boolean) => {
    const current = localFilters.status || [];
    const updated = checked
      ? [...current, status]
      : current.filter((s) => s !== status);
    
    setLocalFilters({ ...localFilters, status: updated });
  };

  const handleJumuiaChange = (jumuia: string, checked: boolean) => {
    const current = localFilters.jumuia || [];
    const updated = checked
      ? [...current, jumuia]
      : current.filter((j) => j !== jumuia);
    
    setLocalFilters({ ...localFilters, jumuia: updated });
  };

  const applyFilters = () => {
    setActiveFilters(localFilters);
    onFilterChange?.();
    toast.success('Filters applied');
  };

  const resetFilters = () => {
    setLocalFilters({});
    clearFilters();
    onFilterChange?.();
    toast.info('Filters cleared');
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast.error('Please enter a filter name');
      return;
    }
    saveFilter(filterName, localFilters);
    toast.success(`Filter saved as "${filterName}"`);
    setFilterName('');
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Members
              </CardTitle>
              <Button variant="ghost" size="sm">
                {isOpen ? 'Hide' : 'Show'}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={localFilters.status?.includes('Active')}
                    onCheckedChange={(checked) => handleStatusChange('Active', !!checked)}
                  />
                  <label htmlFor="active" className="text-sm cursor-pointer">
                    Active
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inactive"
                    checked={localFilters.status?.includes('Inactive')}
                    onCheckedChange={(checked) => handleStatusChange('Inactive', !!checked)}
                  />
                  <label htmlFor="inactive" className="text-sm cursor-pointer">
                    Inactive
                  </label>
                </div>
              </div>
            </div>

            {/* Jumuia Filter */}
            <div className="space-y-2">
              <Label>Jumuia</Label>
              <div className="space-y-2">
                {['St. Peter', 'St. Paul', 'St. Joseph', 'St. Mary'].map((jumuia) => (
                  <div key={jumuia} className="flex items-center space-x-2">
                    <Checkbox
                      id={`jumuia-${jumuia}`}
                      checked={localFilters.jumuia?.includes(jumuia)}
                      onCheckedChange={(checked) => handleJumuiaChange(jumuia, !!checked)}
                    />
                    <label htmlFor={`jumuia-${jumuia}`} className="text-sm cursor-pointer">
                      {jumuia}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Balance Range */}
            <div className="space-y-2">
              <Label>Balance Range (KES)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minBalance || ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        minBalance: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxBalance || ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        maxBalance: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Join Date Range */}
            <div className="space-y-2">
              <Label>Join Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="date"
                    value={localFilters.joinDateFrom || ''}
                    onChange={(e) =>
                      setLocalFilters({ ...localFilters, joinDateFrom: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={localFilters.joinDateTo || ''}
                    onChange={(e) =>
                      setLocalFilters({ ...localFilters, joinDateTo: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Save Filter */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Save Filter as Custom Group</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Filter name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveFilter}
                  disabled={!filterName.trim()}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button onClick={applyFilters} className="flex-1 bg-[#1C3D5A] hover:bg-[#2A5A7A]">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}