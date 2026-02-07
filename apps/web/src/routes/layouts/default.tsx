import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/api/hooks/use-logout';

export function DefaultLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <main className='flex min-h-screen flex-col'>
      <header className='border-b border-border px-6 py-4'>
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
        <div className='mx-auto max-w-4xl'>
          {user ? (
            <div className='rounded-lg border border-border bg-card p-6'>
              <h2 className='text-xl font-semibold'>Welcome, {user.name}</h2>
              <p className='mt-2 text-muted-foreground'>You are logged in.</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
