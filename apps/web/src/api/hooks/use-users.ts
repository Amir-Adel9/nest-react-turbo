import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

async function fetchUsers() {
  const { data } = await apiClient.GET('/api/users');
  return data ?? [];
}

export function useUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    retry: false,
    enabled: options?.enabled ?? true,
  });
}
