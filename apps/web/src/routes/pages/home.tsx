import { useAuthStore } from '@/stores/auth.store';
import { WelcomeCard, AllUsersCard } from '@/components/home';

export function HomePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <>
      <WelcomeCard userName={user.name} />
      <AllUsersCard enabled={!!user} currentUserEmail={user.email} />
    </>
  );
}
