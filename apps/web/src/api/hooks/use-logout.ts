import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';

async function logout(): Promise<void> {
  await apiClient.POST('/api/auth/logout');
}

export function useLogout() {
  const clearUser = useAuthStore((s) => s.clearUser);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUser();
      window.location.href = '/login';
    },
    onError: () => {
      // Even if logout fails server-side, clear local state
      clearUser();
      window.location.href = '/login';
    },
  });
}
