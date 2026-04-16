import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, X, Phone, Mail, Users } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { membersApi } from '../../api/members';
import { toast } from 'sonner@2.0.3';
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
} from '../ui/alert-dialog';

export function PendingApprovalsCard() {
  const { members, updateMember, deleteMember } = useStore();

  const pendingMembers = members.filter(m => m.approvalStatus === 'Pending');

  const handleApprove = async (memberId: string, memberName: string) => {
    try {
      await membersApi.approve(memberId);
      updateMember(memberId, { approvalStatus: 'Approved', status: 'Active' });
      toast.success(`${memberName} has been approved!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve member');
    }
  };

  const handleReject = async (memberId: string, memberName: string) => {
    try {
      await membersApi.remove(memberId);
      deleteMember(memberId);
      toast.info(`${memberName}'s application has been rejected.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject application');
    }
  };

  if (pendingMembers.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            Pending Approvals
          </CardTitle>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">
            {pendingMembers.length} {pendingMembers.length === 1 ? 'Request' : 'Requests'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingMembers.map((member) => (
          <div
            key={member.id}
            className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{member.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {member.jumuia}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-3 w-3" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-3 w-3" />
                    <span>{member.email}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Applied on {new Date(member.join_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleApprove(member.id, member.name)}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" className="flex-1">
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Member Application?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject {member.name}'s application? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleReject(member.id, member.name)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reject Application
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
