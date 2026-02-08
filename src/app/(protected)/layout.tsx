import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { ROUTES } from '@/lib/auth/constants';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getSession();

  if (!sessionData) {
    redirect(ROUTES.LOGIN);
  }

  return <>{children}</>;
}
