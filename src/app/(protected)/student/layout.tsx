import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { ROUTES } from '@/lib/auth/constants';
import { AppHeader } from '@/components/layout';

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
    <div className="min-h-screen bg-background">
      <AppHeader
        title={`${userName}님`}
        homeHref={ROUTES.STUDENT_DASHBOARD}
        nav={[{ label: '내 레슨', href: ROUTES.STUDENT_DASHBOARD }]}
      />
      <main className="mx-auto max-w-screen-lg px-4 py-8">{children}</main>
    </div>
  );
}
