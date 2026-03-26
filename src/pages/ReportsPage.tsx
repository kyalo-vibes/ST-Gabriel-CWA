import { useStore } from '../store/useStore';
import { ChartCard } from '../components/ChartCard';
import { DashboardCard } from '../components/DashboardCard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Users,
  DollarSign,
  TrendingDown,
  AlertCircle,
  Download,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { toast } from 'sonner@2.0.3';

export function ReportsPage() {
  const { reports, members, contributions, user } = useStore();
  
  const isAdmin = user?.role === 'Administrator';

  const handleDownload = (reportType: string) => {
    const originalTitle = document.title;
    document.title = `CWA St. Gabriel - ${reportType} Report - ${new Date().toLocaleDateString('en-KE')}`;
    window.print();
    document.title = originalTitle;
  };

  // Colors for charts
  const COLORS = ['#0071e3', '#34c759', '#ff9500', '#af52de', '#ff375f'];

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
          value={reports.summary.totalMembers}
          icon={Users}
          description={`${reports.summary.activeMembers} active`}
        />
        <DashboardCard
          title="Total Income"
          value={`KES ${reports.summary.totalContributions.toLocaleString()}`}
          icon={TrendingUp}
          description="All contributions"
        />
        <DashboardCard
          title="Total Expenses"
          value={`KES ${reports.summary.totalExpenses.toLocaleString()}`}
          icon={TrendingDown}
          description="Welfare & operations"
        />
        <DashboardCard
          title="Outstanding"
          value={`KES ${reports.summary.outstandingBalance.toLocaleString()}`}
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
          <AreaChart data={reports.monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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

      {/* Asymmetric Grid Layout */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Net Income Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Net Income"
            description="Profit and loss analysis"
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={reports.monthlyTrends.map((trend) => ({
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
        </div>

        {/* Contribution Types - Takes 1 column */}
        <Card className="border-border/50 bg-card hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Contribution Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.contributionTypes.map((type, index) => (
                <div key={type.type}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{type.type}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {type.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${type.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    KES {type.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
                {reports.topContributors.map((contributor, index) => (
                  <div 
                    key={contributor.member_id} 
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-sm">
                      <span className="font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{contributor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        KES {contributor.total.toLocaleString()}
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
                {reports.outstandingBalances.map((member) => (
                  <div 
                    key={member.member_id} 
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.member_id}</p>
                    </div>
                    <div className="text-destructive font-semibold ml-4">
                      KES {member.balance.toLocaleString()}
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