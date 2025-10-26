import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useStore } from '../store/useStore';
import { User, Mail, Phone, MapPin, Calendar, Activity } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export function MemberProfilePage() {
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
  
  // Group contributions by year
  const contributionsByYear = memberContributions.reduce((acc, contribution) => {
    const year = new Date(contribution.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(contribution);
    return acc;
  }, {} as Record<number, typeof memberContributions>);

  const years = Object.keys(contributionsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl text-[#1C3D5A] dark:text-white">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your membership information</p>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#1C3D5A] to-[#D4AF37] flex items-center justify-center">
                <span className="text-white text-3xl">{currentMember.name.charAt(0)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
                <p className="font-medium mt-1">{currentMember.name}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <p className="font-medium mt-1">{currentMember.email}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <p className="font-medium mt-1">{currentMember.phone}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Jumuia
                </label>
                <p className="font-medium mt-1">{currentMember.jumuia}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </label>
                <p className="font-medium mt-1">
                  {new Date(currentMember.join_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Status
                </label>
                <div className="mt-1">
                  <Badge variant={currentMember.status === 'Active' ? 'default' : 'secondary'}>
                    {currentMember.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contribution History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contribution History</CardTitle>
          </CardHeader>
          <CardContent>
            {years.length > 0 ? (
              <div className="space-y-6">
                {years.map((year) => {
                  const yearContributions = contributionsByYear[Number(year)];
                  const yearTotal = yearContributions.reduce((sum, c) => sum + c.amount, 0);
                  
                  return (
                    <div key={year} className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b">
                        <h3 className="text-lg font-medium">{year}</h3>
                        <span className="text-sm text-gray-600">
                          Total: KES {yearTotal.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {yearContributions
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((contribution) => (
                            <div
                              key={contribution.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{contribution.type}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {new Date(contribution.date).toLocaleDateString()}
                                  </Badge>
                                </div>
                                {contribution.reference && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Reference: {contribution.reference}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-green-600">
                                  KES {contribution.amount.toLocaleString()}
                                </p>
                                <Badge
                                  variant={contribution.status === 'Confirmed' ? 'default' : 'secondary'}
                                  className="text-xs mt-1"
                                >
                                  {contribution.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No contributions recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Total Contributions</p>
              <p className="text-2xl font-medium text-[#1C3D5A] dark:text-white">
                KES {currentMember.total_contributed.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Outstanding Balance</p>
              <p className="text-2xl font-medium text-[#1C3D5A] dark:text-white">
                KES {currentMember.balance.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
              <p className="text-2xl font-medium text-[#1C3D5A] dark:text-white">
                {memberContributions.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
