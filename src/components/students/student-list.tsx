'use client';

import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
} from '@/components/ui';
import { UploadToggle } from './upload-toggle';
import { DeleteDialog } from './delete-dialog';
import { StudentForm } from './student-form';
import type { User } from '@/lib/db';

interface StudentListProps {
  students: User[];
}

export function StudentList({ students }: StudentListProps) {
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<User | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddOpen(true)}>학생 추가</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>휴대폰 번호</TableHead>
              <TableHead className="w-32 text-center">업로드 권한</TableHead>
              <TableHead className="w-24 text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  등록된 학생이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell className="text-center">
                    <UploadToggle
                      studentId={student.id}
                      canUpload={student.canUpload}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingStudent(student)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingStudent(student)}
                      >
                        삭제
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StudentForm
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
      />

      {editingStudent && (
        <StudentForm
          student={editingStudent}
          open={!!editingStudent}
          onOpenChange={(open) => !open && setEditingStudent(null)}
        />
      )}

      {deletingStudent && (
        <DeleteDialog
          studentId={deletingStudent.id}
          studentName={deletingStudent.name}
          open={!!deletingStudent}
          onOpenChange={(open) => !open && setDeletingStudent(null)}
        />
      )}
    </div>
  );
}
