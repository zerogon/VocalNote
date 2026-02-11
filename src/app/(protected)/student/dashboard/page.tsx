import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { Card, CardContent } from '@/components/ui';
import { LessonList } from '@/components/lessons';
import { getLessonsByStudent } from '@/actions/lessons';

export default async function StudentDashboard() {
  const sessionData = await getSession();

  if (!sessionData?.user) {
    redirect('/login/student');
  }

  const lessons = await getLessonsByStudent(sessionData.user.id);

  const lastLesson = lessons.length > 0 ? lessons[0] : null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">내 레슨</h1>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="relative p-5 text-center">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
            <p className="text-3xl font-bold text-primary">{lessons.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">총 레슨</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="relative p-5 text-center">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 to-accent-foreground" />
            <p className="text-lg font-bold text-primary">
              {lastLesson
                ? lastLesson.date.toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '-'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">최근 레슨</p>
          </CardContent>
        </Card>
      </div>

      <LessonList lessons={lessons} isAdmin={false} />
    </div>
  );
}
