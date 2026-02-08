import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLogout } from '@/api/hooks/use-logout';
import { useUsers } from '@/api/hooks/use-users';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className='flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
      {initials}
    </div>
  );
}

function UsersTableSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='flex items-center gap-3'>
          <div className='size-9 animate-pulse rounded-full bg-muted' />
          <div className='flex-1 space-y-1.5'>
            <div className='h-3.5 w-28 animate-pulse rounded bg-muted' />
            <div className='h-3 w-40 animate-pulse rounded bg-muted' />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DefaultLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useUsers({
    enabled: !!user,
  });

  return (
    <main className='flex min-h-screen flex-col bg-background'>
      <header className='border-b border-border bg-card px-6 py-4'>
        <div className='mx-auto flex max-w-4xl items-center justify-between'>
          <h1 className='text-lg font-semibold'>Easygenerator Auth</h1>
          <div className='flex items-center gap-4'>
            {user && (
              <>
                <span className='text-sm text-muted-foreground'>
                  {user.email}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => logout.mutate()}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className='flex-1 p-6'>
        <div className='mx-auto max-w-4xl space-y-6'>
          {user ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>Welcome to the application</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <div className='space-y-1'>
                    <CardTitle>All users</CardTitle>
                    <CardDescription>
                      Registered accounts in the system
                    </CardDescription>
                  </div>
                  {users && users.length > 0 && (
                    <Badge variant='secondary'>
                      {users.length} {users.length === 1 ? 'user' : 'users'}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent>
                  {isLoading && <UsersTableSkeleton />}

                  {isError && (
                    <div className='rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive'>
                      {error instanceof Error
                        ? error.message
                        : 'Failed to load users'}
                    </div>
                  )}

                  {users && users.length === 0 && !isLoading && (
                    <p className='py-6 text-center text-sm text-muted-foreground'>
                      No users yet.
                    </p>
                  )}

                  {users && users.length > 0 && (
                    <div className='overflow-hidden rounded-lg border border-border'>
                      <table className='w-full text-sm'>
                        <thead>
                          <tr className='border-b border-border bg-muted/50'>
                            <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>
                              User
                            </th>
                            <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>
                              Email
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u, i) => (
                            <tr
                              key={u.id}
                              className={`transition-colors hover:bg-muted/40 ${
                                i < users.length - 1
                                  ? 'border-b border-border'
                                  : ''
                              }`}
                            >
                              <td className='px-4 py-3'>
                                <div className='flex items-center gap-3'>
                                  <UserAvatar name={u.name} />
                                  <span className='font-medium'>
                                    {u.name}
                                    {u.email === user.email && (
                                      <span className='ml-1.5 text-xs text-muted-foreground'>
                                        (you)
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className='px-4 py-3 text-muted-foreground'>
                                {u.email}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
