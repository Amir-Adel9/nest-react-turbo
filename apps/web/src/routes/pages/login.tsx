import { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { LoginForm, type LoginFormRef } from '@/components/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { InfoIcon } from 'lucide-react';
import { toast } from 'sonner';

const DEMO_EMAIL = 'admin@example.com';
const DEMO_PASSWORD = 'admin123!';

function DemoCredential({
  value,
  label,
  onFill,
}: {
  value: string;
  label: string;
  onFill: (value: string) => void;
}) {
  const handleClick = () => {
    onFill(value);
    void navigator.clipboard.writeText(value);
    toast.success('Filled');
  };
  return (
    <code
      role='button'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className='cursor-pointer rounded bg-primary/10 px-1 py-0.5 font-mono text-[11px] transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/50'
      title={`Fill ${label}`}
    >
      {value}
    </code>
  );
}

export function LoginPage() {
  const loginFormRef = useRef<LoginFormRef>(null);

  return (
    <main className='flex min-h-screen items-center justify-center bg-muted/40 p-4 sm:p-6'>
      <Card className='w-full max-w-[400px] shadow-sm'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-semibold tracking-tight'>
            Welcome back
          </CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className='space-y-5'>
          <div className='flex items-start gap-3 rounded-lg border border-primary/10 bg-primary/5 p-3'>
            <InfoIcon className='mt-0.5 h-4 w-4 shrink-0 text-primary/70' />
            <div className='space-y-0.5 text-xs'>
              <p className='font-medium text-foreground'>Demo credentials</p>
              <p className='text-muted-foreground'>
                <DemoCredential
                  value={DEMO_EMAIL}
                  label='email'
                  onFill={(v) => loginFormRef.current?.fillEmail(v)}
                />
                {' / '}
                <DemoCredential
                  value={DEMO_PASSWORD}
                  label='password'
                  onFill={(v) => loginFormRef.current?.fillPassword(v)}
                />
              </p>
            </div>
          </div>
          <LoginForm ref={loginFormRef} />
        </CardContent>
        <CardFooter className='justify-center'>
          <p className='text-sm text-muted-foreground'>
            Don&apos;t have an account?{' '}
            <Link
              to='/register'
              className='font-medium text-primary underline underline-offset-4 hover:text-primary/80'
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
