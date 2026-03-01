'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
  Card,
  CardContent,
} from '@/components/ui';
import { UploadToggle } from './upload-toggle';
import { DeleteDialog } from './delete-dialog';
import { StudentForm } from './student-form';
import type { User } from '@/lib/db';
import type { StudentWithActivity } from '@/actions/students';

interface StudentListProps {
  students: StudentWithActivity[];
}

function formatRelativeTime(date: Date): string {
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export function StudentList({ students }: StudentListProps) {
  const router = useRouter();
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<User | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddOpen(true)}>학생 추가</Button>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            등록된 학생이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 모바일: 카드 리스트 */}
          <div className="space-y-3 md:hidden">
            {students.map((student) => (
              <Card
                key={student.id}
                className="cursor-pointer transition-colors hover:bg-accent/40"
                onClick={() => router.push(`/admin/students/${student.id}/lessons`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{student.name}</p>
                        {student.latestActivityType === 'recording' && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">🎙 녹음</span>
                        )}
                        {student.latestActivityType === 'memo' && (
                          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">📝 메모</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {student.phone}
                      </p>
                      {student.latestActivityAt && (
                        <p className="text-xs text-primary/50">{formatRelativeTime(student.latestActivityAt)}</p>
                      )}
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <UploadToggle
                        studentId={student.id}
                        canUpload={student.canUpload}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-border/40 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setEditingStudent(student); }}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={(e) => { e.stopPropagation(); setDeletingStudent(student); }}
                    >
                      삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 데스크톱: 테이블 */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>휴대폰 번호</TableHead>
                  <TableHead className="w-32 text-center">
                    업로드 권한
                  </TableHead>
                  <TableHead className="text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow
                    key={student.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/students/${student.id}/lessons`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{student.name}</span>
                        {student.latestActivityType === 'recording' && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">🎙 녹음</span>
                        )}
                        {student.latestActivityType === 'memo' && (
                          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">📝 메모</span>
                        )}
                      </div>
                      {student.latestActivityAt && (
                        <p className="text-xs text-primary/50 mt-0.5">{formatRelativeTime(student.latestActivityAt)}</p>
                      )}
                    </TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <UploadToggle
                        studentId={student.id}
                        canUpload={student.canUpload}
                      />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-nowrap justify-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingStudent(student)}
                        >
                          수정
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeletingStudent(student)}
                        >
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <StudentForm open={isAddOpen} onOpenChange={setIsAddOpen} />

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
