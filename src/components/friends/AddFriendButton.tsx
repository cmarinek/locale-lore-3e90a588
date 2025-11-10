import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserMinus, Check, X } from 'lucide-react';
import { useFriendship } from '@/hooks/useFriendship';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AddFriendButtonProps {
  userId: string;
}

export function AddFriendButton({ userId }: AddFriendButtonProps) {
  const {
    isFriend,
    isPending,
    isIncoming,
    isOutgoing,
    isBlocked,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    blockUser,
    isActioning,
  } = useFriendship(userId);

  if (isBlocked) {
    return (
      <Button variant="destructive" disabled size="sm">
        Blocked
      </Button>
    );
  }

  if (isFriend) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isActioning}>
            <UserCheck className="w-4 h-4 mr-2" />
            Friends
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => removeFriend()}>
            <UserMinus className="w-4 h-4 mr-2" />
            Remove Friend
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => blockUser()} className="text-destructive">
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isIncoming) {
    return (
      <div className="flex gap-2">
        <Button variant="default" size="sm" onClick={() => acceptRequest()} disabled={isActioning}>
          <Check className="w-4 h-4 mr-2" />
          Accept Request
        </Button>
        <Button variant="outline" size="sm" onClick={() => rejectRequest()} disabled={isActioning}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (isOutgoing) {
    return (
      <Button variant="outline" size="sm" disabled>
        Request Sent
      </Button>
    );
  }

  return (
    <Button variant="default" size="sm" onClick={() => sendRequest()} disabled={isActioning}>
      <UserPlus className="w-4 h-4 mr-2" />
      Add Friend
    </Button>
  );
}
