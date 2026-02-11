import { Card, CardContent } from '@/components/ui';
import { StudentList } from '@/components/students';
import { getStudents, getAdminStats } from '@/actions/students';

export default async function StudentsPage() {
  const [students, stats] = await Promise.all([getStudents(), getAdminStats()]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">학생 관리</h1>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="relative p-5 text-center">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
            <p className="text-3xl font-bold text-primary">{stats.totalStudents}</p>
            <p className="mt-1 text-sm text-muted-foreground">등록 학생</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="relative p-5 text-center">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 to-accent-foreground" />
            <p className="text-3xl font-bold text-primary">{stats.totalLessons}</p>
            <p className="mt-1 text-sm text-muted-foreground">총 레슨</p>
          </CardContent>
        </Card>
      </div>

      <StudentList students={students} />
    </div>
  );
}
