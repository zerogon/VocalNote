import { StudentList } from '@/components/students';
import { getStudents } from '@/actions/students';

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">학생 관리</h1>
      <StudentList students={students} />
    </div>
  );
}
