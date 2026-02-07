import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@/lib/zod-resolver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/api/hooks/use-login';
import { extractErrorMessage } from '@/api/client';
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const login = useLogin();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (login.isError && login.error) {
      extractErrorMessage(login.error, 'Login failed').then(setSubmitError);
    }
  }, [login.isError, login.error]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit((data) => {
        setSubmitError(null);
        login.mutate(data);
      })}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label
          htmlFor="login-email"
          className={cn(errors.email && 'text-destructive')}
        >
          Email
        </Label>
        <Input
          id="login-email"
          type="text"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          className={cn(errors.email && 'border-destructive ring-2 ring-destructive/20')}
          {...register('email')}
        />
        {errors.email && (
          <p
            id="login-email-error"
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            {errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="login-password"
          className={cn(errors.password && 'text-destructive')}
        >
          Password
        </Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            className={cn(
              'pr-10',
              errors.password && 'border-destructive ring-2 ring-destructive/20'
            )}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id="login-password-error"
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            {errors.password.message}
          </p>
        )}
      </div>
      {submitError && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {submitError}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending && <Loader2Icon className="animate-spin" />}
        {login.isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
