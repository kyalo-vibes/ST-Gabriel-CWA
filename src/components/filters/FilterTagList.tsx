import { Badge } from '../ui/badge';
import { X, Coins } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function FilterTagList() {
  const { activeFilters, clearFilters } = useStore();

  if (!activeFilters || Object.keys(activeFilters).length === 0) {
    return null;
  }

  const tags: { label: string; key: string }[] = [];

  if (activeFilters.status && activeFilters.status.length > 0) {
    tags.push({ label: `Status: ${activeFilters.status.join(', ')}`, key: 'status' });
  }

  if (activeFilters.jumuia && activeFilters.jumuia.length > 0) {
    tags.push({ label: `Jumuia: ${activeFilters.jumuia.join(', ')}`, key: 'jumuia' });
  }

  if (activeFilters.minBalance) {
    tags.push({ label: `Min Balance: KES ${activeFilters.minBalance.toLocaleString()}`, key: 'minBalance' });
  }

  if (activeFilters.maxBalance) {
    tags.push({ label: `Max Balance: KES ${activeFilters.maxBalance.toLocaleString()}`, key: 'maxBalance' });
  }

  if (activeFilters.joinDateFrom) {
    tags.push({ label: `From: ${new Date(activeFilters.joinDateFrom).toLocaleDateString()}`, key: 'joinDateFrom' });
  }

  if (activeFilters.joinDateTo) {
    tags.push({ label: `To: ${new Date(activeFilters.joinDateTo).toLocaleDateString()}`, key: 'joinDateTo' });
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
      <span className="text-sm text-blue-800 dark:text-blue-200">Filtered by:</span>
      {tags.map((tag) => (
        <Badge key={tag.key} variant="secondary" className="gap-1">
          {tag.label}
        </Badge>
      ))}
      <button
        onClick={clearFilters}
        className="ml-auto text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center gap-1"
      >
        <X className="h-3 w-3" />
        Clear all
      </button>
    </div>
  );
}