import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { LessonList } from '@/components/lessons';
import { getLessonsByStudent } from '@/actions/lessons';

export default async function StudentDashboard() {
  const sessionData = await getSession();

  if (!sessionData?.user) {
    redirect('/login/student');
  }

  const lessons = await getLessonsByStudent(sessionData.user.id);

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">내 레슨</h1>
      <LessonList lessons={lessons} isAdmin={false} />
    </div>
  );
}
