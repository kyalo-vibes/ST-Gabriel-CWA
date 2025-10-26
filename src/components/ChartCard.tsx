import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  description?: string;
}

export function ChartCard({ title, children, description }: ChartCardProps) {
  return (
    <Card className="border-border/50 bg-card hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
