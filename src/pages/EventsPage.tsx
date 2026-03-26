import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, CalendarDays, DollarSign, Users, Clock, Eye, Bell } from 'lucide-react';
import { CreateEventModal } from '../components/events/CreateEventModal';
import { NotificationModal } from '../components/notifications/NotificationModal';

const TYPE_COLORS: Record<string, string> = {
  Bereavement: 'bg-red-100 text-red-700',
  Wedding: 'bg-purple-100 text-purple-700',
  Monthly: 'bg-blue-100 text-blue-700',
  Harambee: 'bg-[#D4AF37]/20 text-[#9A7B1A]',
  'School Fees': 'bg-green-100 text-green-700',
  Special: 'bg-gray-100 text-gray-700',
};

export function EventsPage() {
  const { events, eventPayments, members } = useStore();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Compute stats for each event
  const eventStats = useMemo(() => {
    return events.map(event => {
      const payments = eventPayments.filter(ep => ep.eventId === event.id);
      const targetedCount = members.filter(m => {
        if (m.approvalStatus !== 'Approved') return false;
        if (event.targetJumuia === 'All') return true;
        return m.jumuia === event.targetJumuia;
      }).length;
      const totalExpected = targetedCount * event.amountPerMember;
      const totalCollected = payments
        .filter(ep => ep.status === 'Paid')
        .reduce((sum, ep) => sum + ep.amountPaid, 0);
      const paidCount = payments.filter(ep => ep.status === 'Paid').length;
      const pendingCount = payments.filter(ep => ep.status === 'Pending').length;
      const percentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

      return { event, payments, targetedCount, totalExpected, totalCollected, paidCount, pendingCount, percentage };
    });
  }, [events, eventPayments, members]);

  // Filter by tab
  const filteredStats = eventStats.filter(s => {
    if (activeTab === 'active') return s.event.status === 'Active';
    if (activeTab === 'closed') return s.event.status === 'Closed';
    return true;
  });

  // Summary card totals (active events only)
  const activeStats = eventStats.filter(s => s.event.status === 'Active');
  const activeCount = activeStats.length;
  const totalExpectedAll = activeStats.reduce((sum, s) => sum + s.totalExpected, 0);
  const totalCollectedAll = activeStats.reduce((sum, s) => sum + s.totalCollected, 0);
  const pendingMembersAll = activeStats.reduce((sum, s) => sum + s.pendingCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl text-[#1C3D5A] dark:text-white mb-2">Events</h1>
          <p className="text-gray-500">Manage contribution events and track payments</p>
        </div>
        <Button className="bg-[#1C3D5A] hover:bg-[#2A5A7A]" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-[#1C3D5A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeCount}</div>
            <p className="text-xs text-gray-500 mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Expected</CardTitle>
            <DollarSign className="h-4 w-4 text-[#D4AF37]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">KES {totalExpectedAll.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">From active events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">KES {totalCollectedAll.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">From active events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Members</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{pendingMembersAll}</div>
            <p className="text-xs text-gray-500 mt-1">Across active events</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({eventStats.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({eventStats.filter(s => s.event.status === 'Active').length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({eventStats.filter(s => s.event.status === 'Closed').length})</TabsTrigger>
        </TabsList>

        {/* Shared content for all tabs */}
        {['all', 'active', 'closed'].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {filteredStats.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events found.</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {filteredStats.map(({ event, totalExpected, totalCollected, paidCount, targetedCount, percentage }) => (
                  <Card key={event.id} className="hover:border-[#1C3D5A] transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Badge className={TYPE_COLORS[event.type] || 'bg-gray-100 text-gray-700'}>
                          {event.type}
                        </Badge>
                        <Badge variant={event.status === 'Active' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
                      {event.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <span className="ml-1 font-medium">KES {event.amountPerMember.toLocaleString()} / member</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Due:</span>
                          <span className="ml-1 font-medium">{new Date(event.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Target:</span>
                          <span className="ml-1 font-medium">{event.targetJumuia === 'All' ? 'All Jumuias' : event.targetJumuia}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>KES {totalCollected.toLocaleString()} collected of KES {totalExpected.toLocaleString()}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{paidCount} / {targetedCount} paid</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setIsNotifyOpen(true)}
                        >
                          <Bell className="h-4 w-4 mr-1" />
                          Notify Members
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Modals */}
      <CreateEventModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <NotificationModal open={isNotifyOpen} onOpenChange={setIsNotifyOpen} />
    </div>
  );
}
