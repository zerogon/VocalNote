import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { ROUTES } from '@/lib/auth/constants';
import { AppHeader } from '@/components/layout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getSession();

  if (!sessionData) {
    redirect(ROUTES.LOGIN);
  }

  if (sessionData.session.role !== 'admin') {
    redirect(ROUTES.STUDENT_DASHBOARD);
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="관리자"
        homeHref={ROUTES.ADMIN_STUDENTS}
        nav={[{ label: '학생 관리', href: ROUTES.ADMIN_STUDENTS }]}
      />
      <main className="mx-auto max-w-screen-lg px-4 py-6">{children}</main>
    </div>
  );
}
