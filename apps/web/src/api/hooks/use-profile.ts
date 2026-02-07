import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';

async function fetchProfile() {
  const { data } = await apiClient.GET('/api/auth/me');
  return data ?? null;
}

export function useProfile(options?: { enabled?: boolean }) {
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const user = await fetchProfile();
      setUser(user);
      return user;
    },
    enabled: options?.enabled ?? true,
    retry: false,
  });
}
