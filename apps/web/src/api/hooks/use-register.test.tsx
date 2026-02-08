import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRegister } from './use-register';

const mockSetUser = vi.fn();
const mockNavigate = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { setUser: (u: unknown) => void }) => unknown) =>
    selector({ setUser: mockSetUser }),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>();
  return {
    ...actual,
    apiClient: {
      POST: vi.fn(),
    },
  };
});

const getApiClient = () =>
  import('@/api/client').then((m) => m.apiClient as unknown as { POST: ReturnType<typeof vi.fn> });

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('on success calls setUser, toast.success, and navigate', async () => {
    const api = await getApiClient();
    const user = { id: '1', email: 'u@example.com', name: 'User' };
    api.POST.mockResolvedValueOnce({ data: user, error: undefined });

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      email: 'u@example.com',
      name: 'User',
      password: 'Password1!',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSetUser).toHaveBeenCalledWith(user);
    expect(mockToastSuccess).toHaveBeenCalledWith('Account created');
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
  });

  it('on error calls toast.error with extracted message', async () => {
    const api = await getApiClient();
    const res = {
      clone: () =>
        ({ json: () => Promise.resolve({ message: 'User with this email already exists' }) }),
    } as unknown as Response;
    api.POST.mockRejectedValueOnce(Object.assign(new Error('409'), { response: res }));

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      email: 'dup@example.com',
      name: 'User',
      password: 'Password1!',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('User with this email already exists');
    });
  });
});
