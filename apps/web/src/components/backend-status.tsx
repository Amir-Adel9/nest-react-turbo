import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function BackendStatus() {
  const [data, setData] = useState<{ message: string; status: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // We call /api which Vite will proxy to NestJS
    fetch('/api')
      .then((res) => {
        if (!res.ok) throw new Error('Backend not reachable');
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className='flex min-h-screen items-center justify-center p-8'>
      <Card className='w-full max-w-2xl'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-semibold'>
            Senior Task: Frontend Skeleton
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className='pt-6'>
          {error && (
            <div className='flex flex-col items-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-6'>
              <AlertCircle className='h-8 w-8 text-destructive' />
              <p className='text-destructive font-medium'>Error: {error}</p>
            </div>
          )}

          {data ? (
            <section className='flex flex-col items-center gap-4 rounded-lg border border-border bg-muted/50 p-6'>
              <div className='flex items-center gap-2'>
                <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
                <p className='text-center'>
                  Backend says:{' '}
                  <strong className='font-semibold'>{data.message}</strong>
                </p>
              </div>
              <Badge variant='secondary' className='mt-2'>
                Status: {data.status}
              </Badge>
            </section>
          ) : (
            !error && (
              <div className='flex flex-col items-center gap-4 rounded-lg border border-border bg-muted/50 p-6'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                <p className='text-muted-foreground'>
                  Attempting to connect to NestJS...
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </main>
  );
}
