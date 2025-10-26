import { useStore } from '../store/useStore';
import { DashboardCard } from '../components/DashboardCard';
import { ChartCard } from '../components/ChartCard';
import { Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#1C3D5A', '#D4AF37', '#4A90E2', '#E74C3C'];

export function DashboardPage() {
  const { members, contributions, reports } = useStore();

  const activeMembers = members.filter((m) => m.status === 'Active').length;
  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalOutstanding = members.reduce((sum, m) => sum + m.balance, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1C3D5A] dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's an overview of CWA Thome.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Members"
          value={members.length}
          icon={Users}
          description={`${activeMembers} active members`}
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="Total Contributions"
          value={`KES ${totalContributions.toLocaleString()}`}
          icon={DollarSign}
          description="All time contributions"
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="Total Expenses"
          value={`KES ${reports.summary.totalExpenses.toLocaleString()}`}
          icon={TrendingUp}
          description="Community welfare"
        />
        <DashboardCard
          title="Outstanding Balance"
          value={`KES ${totalOutstanding.toLocaleString()}`}
          icon={AlertCircle}
          description={`${members.filter((m) => m.balance > 0).length} members`}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <ChartCard
          title="Monthly Contribution Trends"
          description="Contributions over the last 10 months"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reports.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="contributions"
                stroke="#1C3D5A"
                strokeWidth={2}
                name="Contributions"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#D4AF37"
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Contribution Types"
          description="Breakdown by contribution category"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reports.contributionTypes}
                dataKey="amount"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.percentage}%`}
              >
                {reports.contributionTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Member Growth"
          description="New members per month"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reports.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="members" fill="#1C3D5A" name="Total Members" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Contributors" description="Highest contributing members">
          <div className="space-y-4">
            {reports.topContributors.map((contributor, index) => (
              <div key={contributor.member_id} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1C3D5A] text-white flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{contributor.name}</p>
                  <p className="text-xs text-gray-500">
                    KES {contributor.total.toLocaleString()}
                  </p>
                </div>
                <div className="text-[#D4AF37]">
                  ★
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
