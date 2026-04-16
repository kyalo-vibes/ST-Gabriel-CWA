import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { reportsApi } from '@/api/reports';
import { ChartCard } from '../components/ChartCard';
import { DashboardCard } from '../components/DashboardCard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Users,
  TrendingDown,
  AlertCircle,
  Download,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { toast } from 'sonner@2.0.3';

interface Summary {
  totalMembers: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  activeEvents: number;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  contributions: number;
}

interface TopContributor {
  member: { id: string; name: string; jumuia: string };
  totalContributed: number;
}

interface OutstandingMember {
  member: { id: string; name: string; jumuia: string };
  totalOwed: number;
  events: unknown[];
}

export function ReportsPage() {
  const { user } = useStore();
  const isAdmin = user?.role === 'Administrator';

  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [outstanding, setOutstanding] = useState<OutstandingMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsApi.getSummary(),
      reportsApi.getMonthlyTrends(),
      reportsApi.getTopContributors(),
      reportsApi.getOutstanding(),
    ])
      .then(([s, trends, top, out]) => {
        setSummary(s);
        setMonthlyTrends(trends.map((t: MonthlyTrend) => ({ ...t, contributions: t.income })));
        setTopContributors(top);
        setOutstanding(out);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = (reportType: string) => {
    const originalTitle = document.title;
    document.title = `CWA St. Gabriel - ${reportType} Report - ${new Date().toLocaleDateString('en-KE')}`;
    window.print();
    document.title = originalTitle;
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading reports...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl tracking-tight mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights for CWA Thome
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => handleDownload('Financial')}
          className="shadow-sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Members"
          value={summary?.totalMembers ?? 0}
          icon={Users}
          description={`${summary?.activeEvents ?? 0} active events`}
        />
        <DashboardCard
          title="Total Income"
          value={`KES ${(summary?.totalIncome ?? 0).toLocaleString()}`}
          icon={TrendingUp}
          description="All contributions"
        />
        <DashboardCard
          title="Total Expenses"
          value={`KES ${(summary?.totalExpenses ?? 0).toLocaleString()}`}
          icon={TrendingDown}
          description="Welfare & operations"
        />
        <DashboardCard
          title="Outstanding"
          value={`KES ${(summary?.balance ?? 0).toLocaleString()}`}
          icon={AlertCircle}
          description="Pending balances"
        />
      </div>

      {/* Hero Chart - Full Width Financial Overview */}
      <ChartCard
        title="Financial Overview"
        description="Income and expenses trend over time"
      >
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff375f" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ff375f" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis
              dataKey="month"
              stroke="#86868b"
              style={{ fontSize: '12px' }}
              tickLine={false}
            />
            <YAxis
              stroke="#86868b"
              style={{ fontSize: '12px' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                padding: '12px',
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
            <Area
              type="monotone"
              dataKey="contributions"
              stroke="#0071e3"
              strokeWidth={3}
              fill="url(#colorIncome)"
              name="Income"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#ff375f"
              strokeWidth={3}
              fill="url(#colorExpense)"
              name="Expenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Monthly Net Income */}
      <ChartCard
        title="Monthly Net Income"
        description="Profit and loss analysis"
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={monthlyTrends.map((trend) => ({
              ...trend,
              net: trend.contributions - trend.expenses,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis
              dataKey="month"
              stroke="#86868b"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#86868b"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                padding: '12px',
              }}
            />
            <Legend />
            <Bar
              dataKey="net"
              fill="#0071e3"
              name="Net Income"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Top Contributors and Outstanding Balances - Admin Only */}
      {isAdmin && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Top Contributors */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topContributors.map((contributor, index) => (
                  <div
                    key={contributor.member.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-sm">
                      <span className="font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{contributor.member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        KES {contributor.totalContributed.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Balances */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                Outstanding Balances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {outstanding.map((row) => (
                  <div
                    key={row.member.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{row.member.name}</p>
                      <p className="text-xs text-muted-foreground">{row.member.jumuia}</p>
                    </div>
                    <div className="text-destructive font-semibold ml-4">
                      KES {row.totalOwed.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
