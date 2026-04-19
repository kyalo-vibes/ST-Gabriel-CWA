import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi } from '@/api/events';
import type { ContributionEvent, EventPayment } from '../data/events';

type ApiPayment = EventPayment & {
  member?: { id: string; name: string; phone: string; jumuia: string };
};
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { ArrowLeft, Bell, Lock, Check, Search, Users, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { NotificationModal } from '../components/notifications/NotificationModal';

const TYPE_COLORS: Record<string, string> = {
  Bereavement: 'bg-red-100 text-red-700',
  Wedding: 'bg-purple-100 text-purple-700',
  Monthly: 'bg-blue-100 text-blue-700',
  Harambee: 'bg-[#D4AF37]/20 text-[#9A7B1A]',
  'School Fees': 'bg-green-100 text-green-700',
  Special: 'bg-gray-100 text-gray-700',
};

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [event, setEvent] = useState<ContributionEvent | null>(null);
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingPaidIds, setMarkingPaidIds] = useState<Set<string>>(new Set());
  const [closingEvent, setClosingEvent] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([eventsApi.getOne(id), eventsApi.getPayments(id)])
      .then(([evt, pmts]) => {
        setEvent(evt);
        setPayments(pmts);
      })
      .catch(err => toast.error(err instanceof Error ? err.message : 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

  const stats = useMemo(() => {
    if (!event) return null;

    const targetedCount = payments.length;
    const totalExpected = targetedCount * event.amountPerMember;
    const totalCollected = payments
      .filter(ep => ep.status === 'Paid')
      .reduce((sum, ep) => sum + ep.amountPaid, 0);
    const paidCount = payments.filter(ep => ep.status === 'Paid').length;
    const pendingCount = payments.filter(ep => ep.status === 'Pending').length;
    const percentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    return { targetedCount, totalExpected, totalCollected, paidCount, pendingCount, percentage };
  }, [event, payments]);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading event...</div>;
  }

  if (!event || !stats) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/events')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Event not found.</p>
          <p className="text-sm mt-2">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Enrich payments with member data from API-included relation
  const enrichedPayments = payments.map(ep => ({
    ...ep,
    memberName: ep.member?.name ?? 'Unknown',
    memberJumuia: ep.member?.jumuia ?? '',
  }));

  const filteredPayments = searchTerm
    ? enrichedPayments.filter(ep => ep.memberName.toLowerCase().includes(searchTerm.toLowerCase()))
    : enrichedPayments;

  const handleMarkPaid = async (memberId: string, memberName: string) => {
    if (!id) return;
    setMarkingPaidIds(prev => new Set(prev).add(memberId));
    try {
      await eventsApi.markPaid(id, memberId);
      const updated = await eventsApi.getPayments(id);
      setPayments(updated);
      toast.success(`${memberName} marked as paid!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark payment');
    } finally {
      setMarkingPaidIds(prev => { const s = new Set(prev); s.delete(memberId); return s; });
    }
  };

  const handleCloseEvent = async () => {
    if (!id) return;
    setClosingEvent(true);
    try {
      const updated = await eventsApi.update(id, { status: 'CLOSED' });
      setEvent(updated);
      toast.success('Event has been closed.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to close event');
    } finally {
      setClosingEvent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate('/events')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Button>

      {/* Event header card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={TYPE_COLORS[event.type] || 'bg-gray-100 text-gray-700'}>
                  {event.type}
                </Badge>
                <Badge variant={event.status === 'Active' ? 'default' : 'secondary'}>
                  {event.status}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              {event.description && (
                <p className="text-sm text-gray-500">{event.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsNotifyOpen(true)}>
                <Bell className="h-4 w-4 mr-2" />
                Notify Pending
              </Button>
              {event.status === 'Active' && (
                <Button variant="outline" disabled={closingEvent} className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleCloseEvent}>
                  <Lock className="h-4 w-4 mr-2" />
                  Close Event
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block">Amount per Member</span>
              <span className="font-medium">KES {event.amountPerMember.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Due Date</span>
              <span className="font-medium">{new Date(event.dueDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Target Jumuia</span>
              <span className="font-medium">{event.targetJumuia === 'All' ? 'All Jumuias' : event.targetJumuia}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Created</span>
              <span className="font-medium">{new Date(event.createdDate).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <span className="text-lg font-medium">
              KES {stats.totalCollected.toLocaleString()} / KES {stats.totalExpected.toLocaleString()} collected
            </span>
            <span className="text-2xl font-bold text-[#1C3D5A]">{stats.percentage}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-gray-500">{stats.paidCount} of {stats.targetedCount} members paid</p>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by member name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Mobile card view */}
          <div className="lg:hidden space-y-4">
            {filteredPayments.map(ep => (
              <div key={ep.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-500">Member</span>
                  <span className="text-sm font-medium">{ep.memberName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-500">Jumuia</span>
                  <Badge variant="outline" className="text-xs">{ep.memberJumuia}</Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-500">Amount Due</span>
                  <span className="text-sm">KES {ep.amountDue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-500">Amount Paid</span>
                  <span className="text-sm">KES {ep.amountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge variant={ep.status === 'Paid' ? 'default' : 'destructive'}>
                    {ep.status}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-500">Date Paid</span>
                  <span className="text-sm">{ep.paidDate ? new Date(ep.paidDate).toLocaleDateString() : '-'}</span>
                </div>
                {ep.status === 'Pending' && event.status === 'Active' && (
                  <div className="pt-3">
                    <Button
                      size="sm"
                      disabled={markingPaidIds.has(ep.memberId)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleMarkPaid(ep.memberId, ep.memberName)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark as Paid
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden lg:block rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Member Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Jumuia</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount Due</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount Paid</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date Paid</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayments.map(ep => (
                  <tr key={ep.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm font-medium">{ep.memberName}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="outline" className="text-xs">{ep.memberJumuia}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">KES {ep.amountDue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">KES {ep.amountPaid.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={ep.status === 'Paid' ? 'default' : 'destructive'}>
                        {ep.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{ep.paidDate ? new Date(ep.paidDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {ep.status === 'Pending' && event.status === 'Active' ? (
                        <Button
                          size="sm"
                          disabled={markingPaidIds.has(ep.memberId)}
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleMarkPaid(ep.memberId, ep.memberName)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark as Paid
                        </Button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Members</CardTitle>
                <Users className="h-4 w-4 text-[#1C3D5A]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.targetedCount}</div>
                <p className="text-xs text-gray-500 mt-1">Targeted by this event</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Paid</CardTitle>
                <Check className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-green-600">{stats.paidCount}</div>
                <p className="text-xs text-gray-500 mt-1">Members have paid</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <Clock className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-red-600">{stats.pendingCount}</div>
                <p className="text-xs text-gray-500 mt-1">Members haven't paid</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Collected</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-green-600">KES {stats.totalCollected.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Amount received</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Outstanding</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-red-600">KES {(stats.totalExpected - stats.totalCollected).toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Amount remaining</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Expected</CardTitle>
                <DollarSign className="h-4 w-4 text-[#D4AF37]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">KES {stats.totalExpected.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Full target amount</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Notification Modal */}
      <NotificationModal open={isNotifyOpen} onOpenChange={setIsNotifyOpen} />
    </div>
  );
}
