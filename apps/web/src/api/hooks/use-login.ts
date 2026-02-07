import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { apiClient, extractErrorMessage } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginDto } from '@/api/types';

async function login(body: LoginDto) {
  const { data } = await apiClient.POST('/api/auth/login', { body });
  return data!;
}

export function useLogin() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data);
      toast.success('Signed in successfully');
      navigate({ to: '/' });
    },
    onError: async (err: unknown) => {
      const message = await extractErrorMessage(err, 'Login failed');
      toast.error(message);
    },
  });
}
