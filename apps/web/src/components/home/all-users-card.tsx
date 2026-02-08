import { useUsers } from '@/api/hooks/use-users';
import { UsersTableSkeleton } from '@/components/users-table-skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UsersTable, type UserRow } from './users-table';

type AllUsersCardProps = {
  enabled: boolean;
  currentUserEmail: string;
};

export function AllUsersCard({ enabled, currentUserEmail }: AllUsersCardProps) {
  const { data: users, isLoading, isError, error } = useUsers({ enabled });

  return (
    <Card>
      <CardHeader className='flex min-w-0 flex-row items-center justify-between gap-2 md:items-center'>
        <div className='min-w-0 flex-1 space-y-1'>
          <CardTitle className='truncate' title='All users'>
            All users
          </CardTitle>
          <CardDescription>Registered accounts in the system.</CardDescription>
        </div>
        {users && users.length > 0 && (
          <Badge variant='secondary' className='h-fit shrink-0'>
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        {isLoading && <UsersTableSkeleton />}

        {isError && (
          <div className='rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive'>
            {error instanceof Error ? error.message : 'Failed to load users'}
          </div>
        )}

        {users && users.length === 0 && !isLoading && (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            No users yet.
          </p>
        )}

        {users && users.length > 0 && (
          <UsersTable
            users={users as UserRow[]}
            currentUserEmail={currentUserEmail}
          />
        )}
      </CardContent>
    </Card>
  );
}
