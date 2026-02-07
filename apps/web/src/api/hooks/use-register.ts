import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { apiClient, extractErrorMessage } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';
import type { RegisterDto } from '@/api/types';

async function register(body: RegisterDto) {
  const { data } = await apiClient.POST('/api/auth/register', { body });
  return data!;
}

export function useRegister() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setUser(data);
      toast.success('Account created');
      navigate({ to: '/' });
    },
    onError: async (err: unknown) => {
      const message = await extractErrorMessage(err, 'Registration failed');
      toast.error(message);
    },
  });
}
