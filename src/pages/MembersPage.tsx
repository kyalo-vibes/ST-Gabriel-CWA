import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { membersApi } from '../api/members';
import { DataTable } from '../components/DataTable';
import { FilterPanel } from '../components/filters/FilterPanel';
import { FilterTagList } from '../components/filters/FilterTagList';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { PendingApprovalsCard } from '../components/members/PendingApprovalsCard';
import { AddMemberModal } from '../components/members/AddMemberModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

export function MembersPage() {
  const { members, deleteMember, activeFilters, setMembers } = useStore();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    membersApi
      .getAll()
      .then(setMembers)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load members'))
      .finally(() => setLoading(false));
  }, [setMembers]);

  // Apply active filters - exclude pending members from main list
  const getFilteredMembers = () => {
    let filtered = members.filter(m => m.approvalStatus !== 'Pending');

    if (activeFilters) {
      if (activeFilters.status && activeFilters.status.length > 0) {
        filtered = filtered.filter(m => activeFilters.status!.includes(m.status));
      }

      if (activeFilters.jumuia && activeFilters.jumuia.length > 0) {
        filtered = filtered.filter(m => activeFilters.jumuia!.includes(m.jumuia));
      }

      if (activeFilters.minBalance !== undefined) {
        filtered = filtered.filter(m => m.balance >= activeFilters.minBalance!);
      }

      if (activeFilters.maxBalance !== undefined) {
        filtered = filtered.filter(m => m.balance <= activeFilters.maxBalance!);
      }

      if (activeFilters.joinDateFrom) {
        filtered = filtered.filter(m => new Date(m.join_date) >= new Date(activeFilters.joinDateFrom!));
      }

      if (activeFilters.joinDateTo) {
        filtered = filtered.filter(m => new Date(m.join_date) <= new Date(activeFilters.joinDateTo!));
      }
    }

    return filtered;
  };

  const filteredMembers = getFilteredMembers();

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    try {
      await membersApi.remove(memberId);
      deleteMember(memberId);
      toast.success(`${memberName} has been removed.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'jumuia',
      label: 'Jumuia',
      render: (member: any) => (
        <Badge variant="outline">{member.jumuia}</Badge>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'status',
      label: 'Status',
      render: (member: any) => (
        <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
          {member.status}
        </Badge>
      ),
    },
    {
      key: 'join_date',
      label: 'Join Date',
      render: (member: any) => new Date(member.join_date).toLocaleDateString(),
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (member: any) => (
        <span className={member.balance > 0 ? 'text-red-600' : 'text-green-600'}>
          KES {member.balance.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (member: any) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Member?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {member.name} from the system? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMember(member.id, member.name);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ];

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl text-[#1C3D5A] dark:text-white mb-2">Members</h1>
          <p className="text-gray-500">
            Manage CWA members and their information
            {activeFilters && Object.keys(activeFilters).length > 0 && (
              <span className="ml-2 text-blue-600">
                ({filteredMembers.length} of {members.filter(m => m.approvalStatus !== 'Pending').length} shown)
              </span>
            )}
          </p>
        </div>
        <Button 
          className="bg-[#1C3D5A] hover:bg-[#2A5A7A]"
          onClick={() => setIsDialogOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Pending Approvals Card */}
      <PendingApprovalsCard />

      {/* Filter Panel */}
      <FilterPanel />

      {/* Active Filter Tags */}
      <FilterTagList />

      <DataTable
        data={filteredMembers}
        columns={columns}
        searchKey="name"
        onRowClick={(member) => navigate(`/members/${member.id}`)}
      />

      {/* Add Member Modal */}
      <AddMemberModal open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}