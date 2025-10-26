import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Phone, Mail, Calendar, Users } from 'lucide-react';
import { DataTable } from '../components/DataTable';

export function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMemberById, getContributionsByMember, members, notifications } = useStore();

  const member = getMemberById(id || '');
  const memberContributions = getContributionsByMember(id || '');
  const memberNotifications = notifications.filter((n) => n.member_id === id);

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl mb-4">Member not found</h2>
        <Button onClick={() => navigate('/members')}>Back to Members</Button>
      </div>
    );
  }

  const contributionColumns = [
    {
      key: 'date',
      label: 'Date',
      render: (c: any) => new Date(c.date).toLocaleDateString(),
    },
    {
      key: 'type',
      label: 'Type',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (c: any) => `KES ${c.amount.toLocaleString()}`,
    },
    {
      key: 'reference',
      label: 'Reference',
    },
    {
      key: 'status',
      label: 'Status',
      render: (c: any) => <Badge variant="default">{c.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/members')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl text-[#1C3D5A] dark:text-white">{member.name}</h1>
          <p className="text-gray-500">Member Details</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {member.jumuia}
                </Badge>
                <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                  {member.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{member.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{member.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                Joined {new Date(member.join_date).toLocaleDateString()}
              </span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Total Contributed</span>
                <span className="text-green-600">
                  KES {member.total_contributed.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Outstanding Balance</span>
                <span className="text-red-600">
                  KES {member.balance.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <Tabs defaultValue="contributions" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contributions">Contributions</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="contributions" className="space-y-4">
                {memberContributions.length > 0 ? (
                  <DataTable
                    data={memberContributions}
                    columns={contributionColumns}
                    itemsPerPage={5}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No contributions yet
                  </div>
                )}
              </TabsContent>
              <TabsContent value="notifications" className="space-y-4">
                {memberNotifications.length > 0 ? (
                  <div className="space-y-3">
                    {memberNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">{notification.type}</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No notifications sent
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}