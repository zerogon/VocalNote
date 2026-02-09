import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui';
import { LessonList } from '@/components/lessons';
import { getLessonsByStudent } from '@/actions/lessons';
import { db, users } from '@/lib/db';

interface LessonsPageProps {
  params: Promise<{ id: string }>;
}

async function getStudent(id: number) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result[0] ?? null;
}

export default async function LessonsPage({ params }: LessonsPageProps) {
  const { id } = await params;
  const studentId = parseInt(id, 10);

  if (isNaN(studentId)) {
    notFound();
  }

  const student = await getStudent(studentId);

  if (!student) {
    notFound();
  }

  const lessons = await getLessonsByStudent(studentId);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/students">목록으로</Link>
        </Button>
        <h1 className="text-2xl font-bold">{student.name} - 레슨 관리</h1>
      </div>
      <LessonList lessons={lessons} isAdmin={true} studentId={studentId} />
    </div>
  );
}
