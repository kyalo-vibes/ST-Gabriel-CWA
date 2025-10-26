import { Users } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface RecipientSummaryProps {
  count: number;
  group: string;
}

export function RecipientSummary({ count, group }: RecipientSummaryProps) {
  return (
    <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        This message will be sent to <strong>{count}</strong> {count === 1 ? 'member' : 'members'} in the <strong>{group}</strong> group.
      </AlertDescription>
    </Alert>
  );
}
