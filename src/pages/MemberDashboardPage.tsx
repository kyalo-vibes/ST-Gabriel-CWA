import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useStore } from '../store/useStore';
import { Users, Coins, TrendingUp, Calendar, DollarSign, User } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

export function MemberDashboardPage() {
  const { user, members, contributions } = useStore();
  
  // Find current member's data
  const currentMember = members.find(m => m.email === user?.email);
  
  if (!currentMember) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Member data not found</p>
        </div>
      </div>
    );
  }

  // Get member's contributions
  const memberContributions = contributions.filter(c => c.member_id === currentMember.id);
  
  // Calculate stats
  const totalMembers = members.filter(m => m.status === 'Active').length;
  const totalOrgContributions = members.reduce((sum, m) => sum + m.total_contributed, 0);
  const avgContribution = totalOrgContributions / totalMembers;
  const memberPercentile = currentMember.total_contributed > avgContribution ? 
    Math.round((currentMember.total_contributed / avgContribution) * 100) : 
    Math.round((currentMember.total_contributed / avgContribution) * 100);

  // Recent contributions (last 5)
  const recentContributions = memberContributions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl text-[#1C3D5A] dark:text-white">Welcome, {currentMember.name.split(' ')[0]}!</h1>
        <p className="text-gray-600 dark:text-gray-400">Here's an overview of your CWA membership and contributions</p>
      </div>

      {/* Personal Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Contributions</CardTitle>
            <Coins className="h-4 w-4 text-[#D4AF37]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">KES {currentMember.total_contributed.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Lifetime contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">KES {currentMember.balance.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {currentMember.balance > 0 ? 'Outstanding balance' : 'No balance'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Member Since</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{new Date(currentMember.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
            <p className="text-xs text-gray-500 mt-1">Join date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Contribution Rank</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#1C3D5A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{memberPercentile}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {currentMember.total_contributed > avgContribution ? 'Above average' : 'Of average'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Member Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Full Name</label>
              <p className="font-medium">{currentMember.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{currentMember.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <p className="font-medium">{currentMember.phone}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Jumuia</label>
              <p className="font-medium">{currentMember.jumuia}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={currentMember.status === 'Active' ? 'default' : 'secondary'}>
                  {currentMember.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Contributions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentContributions.length > 0 ? (
              <div className="space-y-3">
                {recentContributions.map((contribution) => (
                  <div 
                    key={contribution.id} 
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{contribution.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {new Date(contribution.date).toLocaleDateString()}
                        </Badge>
                      </div>
                      {contribution.reference && (
                        <p className="text-sm text-gray-500 mt-1">Ref: {contribution.reference}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        KES {contribution.amount.toLocaleString()}
                      </p>
                      <Badge variant={contribution.status === 'Confirmed' ? 'default' : 'secondary'} className="text-xs mt-1">
                        {contribution.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Coins className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No contributions recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Organization Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organization Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-500">Total Members</label>
              <p className="text-2xl font-medium mt-1">{totalMembers}</p>
              <Progress value={100} className="mt-2 h-2" />
              <p className="text-xs text-gray-500 mt-1">Active members in our community</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Total Contributions</label>
              <p className="text-2xl font-medium mt-1">KES {totalOrgContributions.toLocaleString()}</p>
              <Progress value={75} className="mt-2 h-2" />
              <p className="text-xs text-gray-500 mt-1">Collective contributions</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Average Contribution</label>
              <p className="text-2xl font-medium mt-1">KES {Math.round(avgContribution).toLocaleString()}</p>
              <Progress 
                value={Math.min((currentMember.total_contributed / avgContribution) * 100, 100)} 
                className="mt-2 h-2" 
              />
              <p className="text-xs text-gray-500 mt-1">
                You're at {memberPercentile}% of average
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats by Contribution Type */}
      <Card>
        <CardHeader>
          <CardTitle>My Contributions by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Monthly', 'Special', 'Project', 'Event'].map((type) => {
              const typeContributions = memberContributions.filter(c => c.type === type);
              const typeTotal = typeContributions.reduce((sum, c) => sum + c.amount, 0);
              const percentage = currentMember.total_contributed > 0 
                ? (typeTotal / currentMember.total_contributed) * 100 
                : 0;
              
              if (typeTotal === 0) return null;
              
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{type}</span>
                    <span className="text-sm text-gray-600">KES {typeTotal.toLocaleString()}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of your total</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
