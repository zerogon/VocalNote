import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui';
import { LessonDetail } from '@/components/lessons';
import { getLessonById } from '@/actions/lessons';
import { getSession } from '@/lib/auth/session';

interface LessonDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonDetailPage({
  params,
}: LessonDetailPageProps) {
  const sessionData = await getSession();

  if (!sessionData?.user) {
    redirect('/login/student');
  }

  const { id } = await params;
  const lessonId = parseInt(id, 10);

  if (isNaN(lessonId)) {
    notFound();
  }

  const lesson = await getLessonById(lessonId);

  if (!lesson) {
    notFound();
  }

  // 본인의 레슨만 조회 가능
  if (lesson.studentId !== sessionData.user.id) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/student/dashboard">목록으로</Link>
        </Button>
      </div>
      <LessonDetail lesson={lesson} canUpload={sessionData.user.canUpload} />
    </div>
  );
}
