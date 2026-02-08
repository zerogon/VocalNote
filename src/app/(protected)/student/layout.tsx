import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { ROUTES } from '@/lib/auth/constants';
import { LogoutButton } from '@/components/auth';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getSession();

  if (!sessionData) {
    redirect(ROUTES.LOGIN);
  }

  if (sessionData.session.role !== 'user') {
    redirect(ROUTES.ADMIN_STUDENTS);
  }

  const userName = sessionData.user?.name ?? '학생';

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between py-4">
          <span className="font-semibold">{userName}님</span>
          <LogoutButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
