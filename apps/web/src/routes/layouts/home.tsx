import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/api/hooks/use-logout';

type HomeLayoutProps = {
  children: React.ReactNode;
};

export function HomeLayout({ children }: HomeLayoutProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <main className='flex min-h-screen flex-col bg-background'>
      <header className='border-b border-border bg-card px-4 py-3 sm:px-6 sm:py-4'>
        <div className='mx-auto max-w-4xl'>
          {/* Mobile: row 1 = title | logout, row 2 = email */}
          <div className='flex min-w-0 flex-col gap-2 sm:hidden'>
            <div className='flex min-w-0 items-center justify-between gap-2'>
              <h1
                className='truncate text-lg font-semibold'
                title='Easygenerator Auth'
              >
                Easygenerator Auth
              </h1>
              {user && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => logout.mutate()}
                  className='shrink-0'
                >
                  Logout
                </Button>
              )}
            </div>
            {user && (
              <span
                className='truncate text-xs text-muted-foreground'
                title={user.email}
              >
                {user.email}
              </span>
            )}
          </div>
          {/* Desktop: title left, email + logout right */}
          <div className='hidden sm:flex sm:min-w-0 sm:items-center sm:justify-between'>
            <h1
              className='min-w-0 truncate text-lg font-semibold'
              title='Easygenerator Auth'
            >
              Easygenerator Auth
            </h1>
            {user && (
              <div className='flex min-w-0 items-center gap-3'>
                <span
                  className='truncate text-sm text-muted-foreground'
                  title={user.email}
                >
                  {user.email}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => logout.mutate()}
                  className='shrink-0'
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className='flex-1 p-4 sm:p-6'>
        <div className='mx-auto max-w-4xl space-y-6'>{children}</div>
      </section>
    </main>
  );
}
