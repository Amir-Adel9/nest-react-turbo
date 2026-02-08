import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type WelcomeCardProps = {
  userName: string;
};

export function WelcomeCard({ userName }: WelcomeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{userName}</CardTitle>
        <CardDescription>Welcome to the application.</CardDescription>
      </CardHeader>
    </Card>
  );
}
