import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { reportsApi } from '../api/reports';
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

interface Summary {
  totalMembers: number;
  activeMembers: number;
  totalContributions: number;
  totalExpenses: number;
  totalOutstanding: number;
  membersWithDebt: number;
}

export function DashboardPage() {
  const { reports } = useStore();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState(reports.monthlyTrends);
  const [topContributors, setTopContributors] = useState(reports.topContributors);

  useEffect(() => {
    Promise.all([
      reportsApi.getSummary(),
      reportsApi.getMonthlyTrends(),
      reportsApi.getTopContributors(),
    ])
      .then(([s, trends, top]) => {
        setSummary({
          totalMembers: s.totalMembers ?? 0,
          activeMembers: s.activeMembers ?? s.totalMembers ?? 0,
          totalContributions: s.totalContributions ?? s.totalIncome ?? 0,
          totalExpenses: s.totalExpenses ?? 0,
          totalOutstanding: s.totalOutstanding ?? s.balance ?? 0,
          membersWithDebt: s.membersWithDebt ?? 0,
        });
        setMonthlyTrends(
          trends.map((t: any) => ({
            month: t.month,
            contributions: t.contributions ?? t.income ?? 0,
            expenses: t.expenses ?? 0,
            members: t.members ?? 0,
          })),
        );
        setTopContributors(
          top.map((r: any) => ({
            member_id: r.member_id ?? r.member?.id ?? '',
            name: r.name ?? r.member?.name ?? '',
            total: r.total ?? r.totalContributed ?? 0,
          })),
        );
      })
      .catch(() => {
        // fall through — static store data shown as fallback
      });
  }, []);

  const totalMembers = summary?.totalMembers ?? reports.summary.totalMembers;
  const activeMembers = summary?.activeMembers ?? reports.summary.activeMembers;
  const totalContributions = summary?.totalContributions ?? reports.summary.totalContributions;
  const totalExpenses = summary?.totalExpenses ?? reports.summary.totalExpenses;
  const totalOutstanding = summary?.totalOutstanding ?? reports.summary.outstandingBalance;
  const membersWithDebt = summary?.membersWithDebt ?? 0;

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
          value={totalMembers}
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
          value={`KES ${totalExpenses.toLocaleString()}`}
          icon={TrendingUp}
          description="Community welfare"
        />
        <DashboardCard
          title="Outstanding Balance"
          value={`KES ${totalOutstanding.toLocaleString()}`}
          icon={AlertCircle}
          description={`${membersWithDebt} members`}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <ChartCard
          title="Monthly Contribution Trends"
          description="Contributions over the last 10 months"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
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
            <BarChart data={monthlyTrends}>
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
            {topContributors.map((contributor, index) => (
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
