import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { contributionsApi } from '../api/contributions';
import { expensesApi } from '../api/expenses';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Coins, TrendingUp, TrendingDown, Calendar, ArrowDownCircle, ArrowUpCircle, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from '../components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

export function ContributionsPage() {
  const {
    contributions,
    members,
    addContribution,
    expenses,
    addExpense,
    setContributions,
    setExpenses,
  } = useStore();
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [memberSearchOpen, setMemberSearchOpen] = useState(false);

  useEffect(() => {
    Promise.all([contributionsApi.getAll(), expensesApi.getAll()])
      .then(([contribs, exps]) => {
        setContributions(contribs);
        setExpenses(exps);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load data'));
  }, [setContributions, setExpenses]);
  const [contributionFormData, setContributionFormData] = useState({
    member_id: '',
    amount: '',
    type: 'Monthly Contribution',
    date: new Date().toISOString().split('T')[0],
    reference: '',
  });
  const [expenseFormData, setExpenseFormData] = useState({
    description: '',
    amount: '',
    category: 'Welfare',
    date: new Date().toISOString().split('T')[0],
    reference: '',
  });

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalContributions - totalExpenses;
  
  const thisMonthContributions = contributions
    .filter((c) => {
      const contributionDate = new Date(c.date);
      const now = new Date();
      return (
        contributionDate.getMonth() === now.getMonth() &&
        contributionDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, c) => sum + c.amount, 0);

  const thisMonthExpenses = expenses
    .filter((e) => {
      const expenseDate = new Date(e.date);
      const now = new Date();
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await contributionsApi.create({
        memberId: contributionFormData.member_id,
        amount: parseFloat(contributionFormData.amount),
        type: contributionFormData.type,
        date: contributionFormData.date,
        reference: contributionFormData.reference,
      });
      addContribution({
        member_id: created.memberId ?? created.member_id,
        amount: created.amount,
        type: created.type,
        date: created.date,
        reference: created.reference,
        status: created.status,
      });
      toast.success('Contribution added successfully!');
      setIsContributionDialogOpen(false);
      setContributionFormData({
        member_id: '',
        amount: '',
        type: 'Monthly Contribution',
        date: new Date().toISOString().split('T')[0],
        reference: '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add contribution');
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await expensesApi.create({
        description: expenseFormData.description,
        amount: parseFloat(expenseFormData.amount),
        category: expenseFormData.category,
        date: expenseFormData.date,
        reference: expenseFormData.reference,
      });
      addExpense({
        description: created.description,
        amount: created.amount,
        category: created.category,
        date: created.date,
        reference: created.reference,
        status: created.status,
      });
      toast.success('Expense added successfully!');
      setIsExpenseDialogOpen(false);
      setExpenseFormData({
        description: '',
        amount: '',
        category: 'Welfare',
        date: new Date().toISOString().split('T')[0],
        reference: '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add expense');
    }
  };

  const contributionColumns = [
    {
      key: 'date',
      label: 'Date',
      render: (c: any) => new Date(c.date).toLocaleDateString(),
    },
    {
      key: 'member',
      label: 'Member',
      render: (c: any) => {
        const member = members.find((m) => m.id === c.member_id);
        if (!member) return 'Unknown';
        return (
          <div className="flex items-center gap-2">
            <span>{member.name}</span>
            <Badge variant="outline" className="text-xs">
              {member.jumuia}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'type',
      label: 'Type',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (c: any) => (
        <span className="text-green-600 font-medium">
          <ArrowUpCircle className="h-4 w-4 inline mr-1" />
          KES {c.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'reference',
      label: 'Reference',
    },
  ];

  const expenseColumns = [
    {
      key: 'date',
      label: 'Date',
      render: (e: any) => new Date(e.date).toLocaleDateString(),
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'category',
      label: 'Category',
      render: (e: any) => <Badge variant="outline">{e.category}</Badge>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (e: any) => (
        <span className="text-red-600 font-medium">
          <ArrowDownCircle className="h-4 w-4 inline mr-1" />
          KES {e.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'reference',
      label: 'Reference',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl text-[#1C3D5A] dark:text-white mb-2">Finance Management</h1>
          <p className="text-gray-500">Track contributions and expenses</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isContributionDialogOpen} onOpenChange={setIsContributionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Contribution
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Contribution</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleContributionSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="member">Member</Label>
                  <Popover open={memberSearchOpen} onOpenChange={setMemberSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={memberSearchOpen}
                        className="w-full justify-between"
                        type="button"
                      >
                        {contributionFormData.member_id
                          ? (() => {
                              const selectedMember = members.find((m) => m.id === contributionFormData.member_id);
                              return selectedMember ? (
                                <div className="flex items-center gap-2">
                                  <span>{selectedMember.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {selectedMember.jumuia}
                                  </Badge>
                                </div>
                              ) : "Search member...";
                            })()
                          : "Search member..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search member..." />
                        <CommandList>
                          <CommandEmpty>No member found.</CommandEmpty>
                          <CommandGroup>
                            {members.map((member) => (
                              <CommandItem
                                key={member.id}
                                value={`${member.name} ${member.jumuia} ${member.phone}`}
                                onSelect={() => {
                                  setContributionFormData({ ...contributionFormData, member_id: member.id });
                                  setMemberSearchOpen(false);
                                }}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{member.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {member.jumuia}
                                  </Badge>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={contributionFormData.amount}
                    onChange={(e) => setContributionFormData({ ...contributionFormData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={contributionFormData.type}
                    onValueChange={(value) => setContributionFormData({ ...contributionFormData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly Contribution">Monthly Contribution</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Welfare">Welfare</SelectItem>
                      <SelectItem value="Project">Project</SelectItem>
                      <SelectItem value="Special Contribution">Special Contribution</SelectItem>
                      <SelectItem value="Fundraising">Fundraising</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={contributionFormData.date}
                    onChange={(e) => setContributionFormData({ ...contributionFormData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    placeholder="e.g., REF001"
                    value={contributionFormData.reference}
                    onChange={(e) => setContributionFormData({ ...contributionFormData, reference: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsContributionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Add Contribution
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Medical assistance for Sister Mary"
                    value={expenseFormData.description}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount (KES)</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={expenseFormData.category}
                    onValueChange={(value) => setExpenseFormData({ ...expenseFormData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Welfare">Welfare</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Project">Project</SelectItem>
                      <SelectItem value="Administrative">Administrative</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-date">Date</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={expenseFormData.date}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-reference">Reference</Label>
                  <Input
                    id="expense-reference"
                    placeholder="e.g., EXP001"
                    value={expenseFormData.reference}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, reference: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsExpenseDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    Add Expense
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">KES {totalContributions.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">All contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Expenses</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">KES {totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">All expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Net Balance</CardTitle>
            <Coins className="h-4 w-4 text-[#D4AF37]" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              KES {netBalance.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Income - Expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-[#1C3D5A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              KES {(thisMonthContributions - thisMonthExpenses).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600">+{thisMonthContributions.toLocaleString()}</span>
              {' / '}
              <span className="text-red-600">-{thisMonthExpenses.toLocaleString()}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Contributions and Expenses */}
      <Tabs defaultValue="contributions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contributions">
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Contributions ({contributions.length})
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            Expenses ({expenses.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="contributions" className="mt-6">
          <DataTable data={contributions} columns={contributionColumns} searchKey="reference" />
        </TabsContent>
        <TabsContent value="expenses" className="mt-6">
          <DataTable data={expenses} columns={expenseColumns} searchKey="description" />
        </TabsContent>
      </Tabs>
    </div>
  );
}