import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Send, DollarSign, Users, AlertTriangle, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { notificationsApi } from '@/api/notifications';

const BACKEND_URL = 'http://localhost:3001';

const TYPE_COLORS: Record<string, string> = {
  Bereavement: 'bg-red-100 text-red-700',
  Wedding: 'bg-purple-100 text-purple-700',
  Monthly: 'bg-blue-100 text-blue-700',
  Harambee: 'bg-[#D4AF37]/20 text-[#9A7B1A]',
  'School Fees': 'bg-green-100 text-green-700',
  Special: 'bg-gray-100 text-gray-700',
};

interface DefaulterRow {
  key: string; // `${eventId}-${memberId}` for unique identification
  memberId: string;
  memberName: string;
  memberPhone: string;
  memberJumuia: string;
  eventId: string;
  eventTitle: string;
  eventType: string;
  dueDate: string;
  amountOwed: number;
  daysOverdue: number;
}

export function DebtManagementPage() {
  const { events, eventPayments, members, addNotification } = useStore();

  const [searchText, setSearchText] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');
  const [selectedJumuiaFilter, setSelectedJumuiaFilter] = useState('all');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);

  const today = new Date();

  // Build the flat list of defaulter rows by joining pending payments with active events and members
  const defaulterRows = useMemo(() => {
    const activeEvents = events.filter(e => e.status === 'Active');
    const activeEventIds = new Set(activeEvents.map(e => e.id));
    const eventMap = new Map(activeEvents.map(e => [e.id, e]));
    const memberMap = new Map(members.map(m => [m.id, m]));

    const rows: DefaulterRow[] = [];

    for (const ep of eventPayments) {
      if (ep.status !== 'Pending') continue;
      if (!activeEventIds.has(ep.eventId)) continue;

      const event = eventMap.get(ep.eventId);
      const member = memberMap.get(ep.memberId);
      if (!event || !member) continue;

      const amountOwed = ep.amountDue - ep.amountPaid;
      const dueDate = new Date(event.dueDate);
      const diffMs = today.getTime() - dueDate.getTime();
      const daysOverdue = diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;

      rows.push({
        key: `${ep.eventId}-${ep.memberId}`,
        memberId: member.id,
        memberName: member.name,
        memberPhone: member.phone,
        memberJumuia: member.jumuia,
        eventId: event.id,
        eventTitle: event.title,
        eventType: event.type,
        dueDate: event.dueDate,
        amountOwed,
        daysOverdue,
      });
    }

    return rows;
  }, [events, eventPayments, members, today.toDateString()]);

  // Active events that have at least one pending payment (for the filter dropdown)
  const activeEventsWithDebt = useMemo(() => {
    const eventIds = new Set(defaulterRows.map(r => r.eventId));
    return events.filter(e => eventIds.has(e.id));
  }, [defaulterRows, events]);

  // Apply filters
  const filteredRows = useMemo(() => {
    let rows = defaulterRows;

    if (searchText) {
      const lower = searchText.toLowerCase();
      rows = rows.filter(r => r.memberName.toLowerCase().includes(lower));
    }

    if (selectedEventFilter !== 'all') {
      rows = rows.filter(r => r.eventId === selectedEventFilter);
    }

    if (selectedJumuiaFilter !== 'all') {
      rows = rows.filter(r => r.memberJumuia === selectedJumuiaFilter);
    }

    return rows;
  }, [defaulterRows, searchText, selectedEventFilter, selectedJumuiaFilter]);

  // Summary stats (computed from unfiltered defaulter rows)
  const stats = useMemo(() => {
    const totalOutstanding = defaulterRows.reduce((sum, r) => sum + r.amountOwed, 0);
    const uniqueMembers = new Set(defaulterRows.map(r => r.memberId)).size;
    const overdueCount = defaulterRows.filter(r => r.daysOverdue > 0).length;
    const eventsWithDebt = new Set(defaulterRows.map(r => r.eventId)).size;

    return { totalOutstanding, uniqueMembers, overdueCount, eventsWithDebt };
  }, [defaulterRows]);

  // Selection helpers
  const allFilteredSelected = filteredRows.length > 0 && filteredRows.every(r => selectedRowIds.has(r.key));

  const toggleRow = (key: string) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredRows.map(r => r.key)));
    }
  };

  // Build the reminder message for a single row
  const buildMessage = (row: DefaulterRow) =>
    `Dear ${row.memberName}, this is a reminder that your contribution of KES ${row.amountOwed.toLocaleString()} for "${row.eventTitle}" was due on ${new Date(row.dueDate).toLocaleDateString()}. Please make your payment at your earliest convenience. God bless you. \u2014 CWA St. Gabriel`;

  // Send a single reminder
  const handleSendReminder = async (row: DefaulterRow) => {
    setSendingId(row.key);
    const message = buildMessage(row);

    try {
      const res = await fetch(`${BACKEND_URL}/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'individual',
          recipients: [{ name: row.memberName, phone: row.memberPhone, balance: row.amountOwed }],
          message,
          notificationType: 'Payment Reminder',
          targetGroup: 'Custom',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send');
      }

      const payload = {
        memberId: row.memberId,
        message,
        type: 'Payment Reminder',
        targetGroup: row.memberName,
        contributionType: row.eventTitle,
        recipientCount: 1,
      };
      await notificationsApi.create(payload);
      addNotification({
        member_id: row.memberId,
        message,
        date: new Date().toISOString().split('T')[0],
        type: 'Payment Reminder',
        status: 'Sent',
        targetGroup: row.memberName,
        contributionType: row.eventTitle,
        recipientCount: 1,
      });

      toast.success(`Reminder sent to ${row.memberName}`);
    } catch {
      toast.error('WhatsApp not connected. Start the backend and scan QR code.');
    } finally {
      setSendingId(null);
    }
  };

  // Send bulk reminders
  const handleBulkSend = async () => {
    const selected = filteredRows.filter(r => selectedRowIds.has(r.key));
    if (selected.length === 0) return;

    setIsBulkSending(true);
    const message = buildMessage(selected[0]);

    try {
      const res = await fetch(`${BACKEND_URL}/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'individual',
          recipients: selected.map(r => ({ name: r.memberName, phone: r.memberPhone, balance: r.amountOwed })),
          message,
          notificationType: 'Payment Reminder',
          targetGroup: 'Defaulters',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send');
      }

      const payload = {
        message,
        type: 'Payment Reminder',
        targetGroup: 'Defaulters',
        contributionType: 'Multiple Events',
        recipientCount: selected.length,
      };
      await notificationsApi.create(payload);
      addNotification({
        member_id: 'bulk',
        message,
        date: new Date().toISOString().split('T')[0],
        type: 'Payment Reminder',
        status: 'Sent',
        targetGroup: 'Defaulters',
        contributionType: 'Multiple Events',
        recipientCount: selected.length,
      });

      toast.success(`Reminders sent to ${selected.length} members`);
      setSelectedRowIds(new Set());
    } catch {
      toast.error('WhatsApp not connected. Start the backend and scan QR code.');
    } finally {
      setIsBulkSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl text-[#1C3D5A] dark:text-white mb-2">Debt Management</h1>
          <p className="text-gray-500">Track outstanding payments and send WhatsApp reminders</p>
        </div>
        <Button
          className="bg-[#1C3D5A] hover:bg-[#2A5A7A]"
          disabled={selectedRowIds.size === 0 || isBulkSending}
          onClick={handleBulkSend}
        >
          {isBulkSending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {isBulkSending ? 'Sending...' : `Send Bulk Reminders${selectedRowIds.size > 0 ? ` (${selectedRowIds.size})` : ''}`}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">KES {stats.totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Across all active events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Defaulters</CardTitle>
            <Users className="h-4 w-4 text-[#1C3D5A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.uniqueMembers}</div>
            <p className="text-xs text-gray-500 mt-1">Members with pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Overdue Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-amber-600">{stats.overdueCount}</div>
            <p className="text-xs text-gray-500 mt-1">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Events with Debt</CardTitle>
            <Calendar className="h-4 w-4 text-[#D4AF37]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.eventsWithDebt}</div>
            <p className="text-xs text-gray-500 mt-1">Events with outstanding balances</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by member name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedEventFilter} onValueChange={setSelectedEventFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {activeEventsWithDebt.map(e => (
              <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedJumuiaFilter} onValueChange={setSelectedJumuiaFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Jumuia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jumuia</SelectItem>
            <SelectItem value="St. Peter">St. Peter</SelectItem>
            <SelectItem value="St. Paul">St. Paul</SelectItem>
            <SelectItem value="St. Joseph">St. Joseph</SelectItem>
            <SelectItem value="St. Mary">St. Mary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {filteredRows.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">All payments are up to date!</p>
          <p className="text-sm text-gray-500 mt-1">No outstanding debts found.</p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="lg:hidden space-y-4">
            {filteredRows.map(row => (
              <div key={row.key} className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                <div className="flex items-center gap-3 mb-3">
                  <Checkbox
                    checked={selectedRowIds.has(row.key)}
                    onCheckedChange={() => toggleRow(row.key)}
                  />
                  <span className="font-medium">{row.memberName}</span>
                  <Badge variant="outline" className="text-xs">{row.memberJumuia}</Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-500">Event</span>
                  <div className="flex items-center gap-2">
                    <Badge className={TYPE_COLORS[row.eventType] || 'bg-gray-100 text-gray-700'}>
                      {row.eventType}
                    </Badge>
                    <span className="text-sm">{row.eventTitle}</span>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-500">Amount Owed</span>
                  <span className="text-sm font-medium text-red-600">KES {row.amountOwed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-500">Due Date</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{new Date(row.dueDate).toLocaleDateString()}</span>
                    {row.daysOverdue > 0 && (
                      <Badge variant="destructive" className="text-xs">{row.daysOverdue}d overdue</Badge>
                    )}
                  </div>
                </div>
                <div className="pt-3">
                  <Button
                    size="sm"
                    className="w-full bg-[#1C3D5A] hover:bg-[#2A5A7A]"
                    disabled={sendingId === row.key}
                    onClick={() => handleSendReminder(row)}
                  >
                    {sendingId === row.key ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Send Reminder
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden lg:block rounded-lg border overflow-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Member</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Event</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount Owed</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Due Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRows.map(row => (
                  <tr key={row.key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedRowIds.has(row.key)}
                        onCheckedChange={() => toggleRow(row.key)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{row.memberName}</span>
                        <Badge variant="outline" className="text-xs">{row.memberJumuia}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge className={TYPE_COLORS[row.eventType] || 'bg-gray-100 text-gray-700'}>
                          {row.eventType}
                        </Badge>
                        <span className="text-sm">{row.eventTitle}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-red-600">
                      KES {row.amountOwed.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{new Date(row.dueDate).toLocaleDateString()}</span>
                        {row.daysOverdue > 0 && (
                          <Badge variant="destructive" className="text-xs">{row.daysOverdue}d overdue</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        className="bg-[#1C3D5A] hover:bg-[#2A5A7A]"
                        disabled={sendingId === row.key}
                        onClick={() => handleSendReminder(row)}
                      >
                        {sendingId === row.key ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-1" />
                        )}
                        Send Reminder
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
