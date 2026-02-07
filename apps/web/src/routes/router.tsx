import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { DefaultLayout } from '@/routes/layouts/default';
import { LoginPage } from '@/routes/pages/login';
import { RegisterPage } from '@/routes/pages/register';

async function ensureUser() {
  const existing = useAuthStore.getState().user;
  if (existing) return existing;
  const { data } = await apiClient.GET('/api/auth/me');
  const user = data!;
  useAuthStore.getState().setUser(user);
  return user;
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    try {
      await ensureUser();
    } catch {
      throw redirect({ to: '/login', replace: true });
    }
  },
  component: DefaultLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
