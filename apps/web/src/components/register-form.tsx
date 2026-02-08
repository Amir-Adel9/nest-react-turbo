import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@/lib/zod-resolver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/api/hooks/use-register';
import { extractErrorMessage } from '@/api/client';
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Aligned with backend CreateUserDto: MinLength(3) name, IsStrongPassword(minLength 8, minLowercase 1, minNumbers 1, minSymbols 1)
const registerSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    name: z.string().min(3, 'Name must be at least 3 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
        'Include at least one lowercase letter, one number, and one special character',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function fieldErrorClass(hasError: boolean) {
  return cn(hasError && 'border-destructive ring-2 ring-destructive/20');
}

function labelErrorClass(hasError: boolean) {
  return cn(hasError && 'text-destructive');
}

export function RegisterForm() {
  const registerMutation = useRegister();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (registerMutation.isError && registerMutation.error) {
      extractErrorMessage(registerMutation.error, 'Registration failed').then(
        setSubmitError,
      );
    }
  }, [registerMutation.isError, registerMutation.error]);

  const onSubmit = (data: RegisterFormValues) => {
    setSubmitError(null);
    registerMutation.mutate({
      email: data.email,
      name: data.name,
      password: data.password,
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label
          htmlFor='register-email'
          className={labelErrorClass(!!errors.email)}
        >
          Email
        </Label>
        <Input
          id='register-email'
          type='text'
          inputMode='email'
          autoComplete='email'
          placeholder='you@example.com'
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
          className={fieldErrorClass(!!errors.email)}
          {...register('email')}
        />
        {errors.email && (
          <p
            id='register-email-error'
            role='alert'
            className='text-sm font-medium text-destructive'
          >
            {errors.email.message}
          </p>
        )}
      </div>
      <div className='space-y-2'>
        <Label
          htmlFor='register-name'
          className={labelErrorClass(!!errors.name)}
        >
          Name
        </Label>
        <Input
          id='register-name'
          type='text'
          autoComplete='name'
          placeholder='John Doe'
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'register-name-error' : undefined}
          className={fieldErrorClass(!!errors.name)}
          {...register('name')}
        />
        {errors.name && (
          <p
            id='register-name-error'
            role='alert'
            className='text-sm font-medium text-destructive'
          >
            {errors.name.message}
          </p>
        )}
      </div>
      <div className='space-y-2'>
        <Label
          htmlFor='register-password'
          className={labelErrorClass(!!errors.password)}
        >
          Password
        </Label>
        <div className='relative'>
          <Input
            id='register-password'
            type={showPassword ? 'text' : 'password'}
            autoComplete='new-password'
            placeholder='Min 8 chars, 1 letter, 1 number, 1 special'
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'register-password-error' : undefined
            }
            className={cn('pr-10', fieldErrorClass(!!errors.password))}
            {...register('password')}
          />
          <button
            type='button'
            onClick={() => setShowPassword((p) => !p)}
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOffIcon className='h-4 w-4' />
            ) : (
              <EyeIcon className='h-4 w-4' />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id='register-password-error'
            role='alert'
            className='text-sm font-medium text-destructive'
          >
            {errors.password.message}
          </p>
        )}
      </div>
      <div className='space-y-2'>
        <Label
          htmlFor='register-confirm'
          className={labelErrorClass(!!errors.confirmPassword)}
        >
          Confirm password
        </Label>
        <div className='relative'>
          <Input
            id='register-confirm'
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete='new-password'
            placeholder='Re-enter your password'
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? 'register-confirm-error' : undefined
            }
            className={cn('pr-10', fieldErrorClass(!!errors.confirmPassword))}
            {...register('confirmPassword')}
          />
          <button
            type='button'
            onClick={() => setShowConfirmPassword((p) => !p)}
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? (
              <EyeOffIcon className='h-4 w-4' />
            ) : (
              <EyeIcon className='h-4 w-4' />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p
            id='register-confirm-error'
            role='alert'
            className='text-sm font-medium text-destructive'
          >
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      {submitError && (
        <p role='alert' className='text-sm font-medium text-destructive'>
          {submitError}
        </p>
      )}
      <Button
        type='submit'
        className='w-full'
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending && <Loader2Icon className='animate-spin' />}
        {registerMutation.isPending ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
