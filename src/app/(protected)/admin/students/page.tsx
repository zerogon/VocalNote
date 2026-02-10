import { Card, CardContent } from '@/components/ui';
import { StudentList } from '@/components/students';
import { getStudents, getAdminStats } from '@/actions/students';

export default async function StudentsPage() {
  const [students, stats] = await Promise.all([getStudents(), getAdminStats()]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">학생 관리</h1>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {stats.totalStudents}
            </p>
            <p className="text-sm text-muted-foreground">등록 학생</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {stats.totalLessons}
            </p>
            <p className="text-sm text-muted-foreground">총 레슨</p>
          </CardContent>
        </Card>
      </div>

      <StudentList students={students} />
    </div>
  );
}
