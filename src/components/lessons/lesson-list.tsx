'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
} from '@/components/ui';
import { LessonForm } from './lesson-form';
import { DeleteDialog } from './delete-dialog';
import type { Lesson } from '@/lib/db';

interface LessonListProps {
  lessons: Lesson[];
  isAdmin: boolean;
  studentId?: number;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function LessonList({ lessons, isAdmin, studentId }: LessonListProps) {
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="space-y-4">
      {isAdmin && studentId && (
        <div className="flex justify-end">
          <Button onClick={() => setIsAddOpen(true)}>레슨 추가</Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>날짜</TableHead>
              <TableHead>레슨 내용</TableHead>
              <TableHead className="w-32 text-center">등록일</TableHead>
              <TableHead className="w-24 text-center">
                {isAdmin ? '관리' : ''}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  등록된 레슨이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(lesson.date)}
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {lesson.content.length > 100
                      ? lesson.content.substring(0, 100) + '...'
                      : lesson.content}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {formatDateTime(lesson.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      {isAdmin ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingLesson(lesson)}
                          >
                            수정
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingLessonId(lesson.id)}
                          >
                            삭제
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/student/lessons/${lesson.id}`}>
                            상세 보기
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isAdmin && studentId && (
        <>
          <LessonForm
            studentId={studentId}
            open={isAddOpen}
            onOpenChange={setIsAddOpen}
          />

          {editingLesson && (
            <LessonForm
              studentId={studentId}
              lesson={editingLesson}
              open={!!editingLesson}
              onOpenChange={(open) => !open && setEditingLesson(null)}
            />
          )}

          {deletingLessonId && (
            <DeleteDialog
              lessonId={deletingLessonId}
              open={!!deletingLessonId}
              onOpenChange={(open) => !open && setDeletingLessonId(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
