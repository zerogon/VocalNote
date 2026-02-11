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
  Card,
  CardContent,
} from '@/components/ui';
import { RecordingUpload } from '@/components/recordings';
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

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function LessonList({ lessons, isAdmin, studentId }: LessonListProps) {
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [uploadingLessonId, setUploadingLessonId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {isAdmin && studentId && (
        <div className="flex justify-end">
          <Button onClick={() => setIsAddOpen(true)}>레슨 추가</Button>
        </div>
      )}

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            등록된 레슨이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 모바일: 카드 리스트 */}
          <div className="space-y-3 md:hidden">
            {lessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">
                        {formatDate(lesson.date)}
                      </span>
                      {lesson.recordingId && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          녹음
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatShortDate(lesson.createdAt)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-foreground">
                    {lesson.content}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-3">
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
                          className="text-destructive"
                          onClick={() => setDeletingLesson(lesson)}
                        >
                          삭제
                        </Button>
                        {!lesson.recordingId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setUploadingLessonId(
                                uploadingLessonId === lesson.id ? null : lesson.id
                              )
                            }
                          >
                            녹음 업로드
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/student/lessons/${lesson.id}`}>
                          상세 보기
                        </Link>
                      </Button>
                    )}
                  </div>
                  {isAdmin && uploadingLessonId === lesson.id && (
                    <div className="mt-3">
                      <RecordingUpload lessonId={lesson.id} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 데스크톱: 테이블 */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>레슨 내용</TableHead>
                  <TableHead className="w-20 text-center">녹음</TableHead>
                  <TableHead className="w-32 text-center">등록일</TableHead>
                  <TableHead className="w-36 text-center">
                    {isAdmin ? '관리' : ''}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {formatDate(lesson.date)}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {lesson.content.length > 100
                        ? lesson.content.substring(0, 100) + '...'
                        : lesson.content}
                    </TableCell>
                    <TableCell className="text-center">
                      {lesson.recordingId ? (
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" title="녹음 있음" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {formatShortDate(lesson.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
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
                              onClick={() => setDeletingLesson(lesson)}
                            >
                              삭제
                            </Button>
                            {!lesson.recordingId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setUploadingLessonId(
                                    uploadingLessonId === lesson.id
                                      ? null
                                      : lesson.id
                                  )
                                }
                              >
                                업로드
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/student/lessons/${lesson.id}`}>
                              상세 보기
                            </Link>
                          </Button>
                        )}
                      </div>
                      {isAdmin && uploadingLessonId === lesson.id && (
                        <div className="mt-2">
                          <RecordingUpload lessonId={lesson.id} />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

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

          {deletingLesson && (
            <DeleteDialog
              lessonId={deletingLesson.id}
              hasRecording={!!deletingLesson.recordingId}
              open={!!deletingLesson}
              onOpenChange={(open) => !open && setDeletingLesson(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
