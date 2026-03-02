'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { markLessonAsViewed } from '@/actions/lessons';
import type { Lesson } from '@/lib/db';

type LessonWithRecording = Lesson & {
  hasRecording: boolean;
  recordingCount: number;
  latestRecordingAt: Date | null;
  memoUpdatedAt: Date | null;
  adminViewedAt: Date | null;
};

function hasNewActivity(lesson: LessonWithRecording): boolean {
  const { adminViewedAt, latestRecordingAt, memoUpdatedAt, recordingCount, studentMemo } = lesson;
  if (!adminViewedAt) {
    return recordingCount > 0 || !!studentMemo;
  }
  const newRec = latestRecordingAt && latestRecordingAt > adminViewedAt;
  const newMemo = memoUpdatedAt && memoUpdatedAt > adminViewedAt;
  return !!(newRec || newMemo);
}

interface LessonListProps {
  lessons: LessonWithRecording[];
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

export function LessonList({ lessons, isAdmin, studentId }: LessonListProps) {
  const router = useRouter();
  const [editingLesson, setEditingLesson] = useState<LessonWithRecording | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<LessonWithRecording | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewedLessonIds, setViewedLessonIds] = useState<Set<number>>(new Set());

  function isNew(lesson: LessonWithRecording): boolean {
    return hasNewActivity(lesson) && !viewedLessonIds.has(lesson.id);
  }

  async function handleLessonClick(lesson: LessonWithRecording) {
    if (hasNewActivity(lesson)) {
      setViewedLessonIds((prev) => new Set([...prev, lesson.id]));
      await markLessonAsViewed(lesson.id);
    }
    setEditingLesson(lesson);
  }


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
              <Card
                key={lesson.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={isAdmin ? () => handleLessonClick(lesson) : () => router.push(`/student/lessons/${lesson.id}`)}
              >
                <CardContent className="p-4">
                  {/* 1행: 날짜 + 회차 */}
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">
                      {formatDate(lesson.date)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isAdmin && isNew(lesson) && (
                        <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
                          NEW
                        </span>
                      )}
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {lesson.sessionNumber}회차
                      </span>
                    </div>
                  </div>

                  {/* 2행: 활동 배지 (녹음/메모 있을 때만) */}
                  {(lesson.recordingCount > 0 || lesson.studentMemo) && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {lesson.recordingCount > 0 && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          🎙 {lesson.recordingCount}개
                          {lesson.latestRecordingAt && (
                            <> · {formatRelativeTime(lesson.latestRecordingAt)}</>
                          )}
                        </span>
                      )}
                      {lesson.studentMemo && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                          📝 메모
                          {lesson.memoUpdatedAt && (
                            <> · {formatRelativeTime(lesson.memoUpdatedAt)}</>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                  {lesson.songTitle && (
                    <p className="mb-1 text-sm font-medium text-foreground">
                      {lesson.songTitle}
                    </p>
                  )}
                  <p className="line-clamp-2 text-sm text-foreground/80">
                    {lesson.content}
                  </p>
                  {isAdmin && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setDeletingLesson(lesson); }}
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        삭제
                      </Button>
                      <div onClick={(e) => e.stopPropagation()}>
                        <RecordingUpload lessonId={lesson.id} />
                      </div>
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
                  <TableHead>노래 제목</TableHead>
                  <TableHead className="w-20 text-center whitespace-nowrap">회차</TableHead>
                  <TableHead className="w-20 text-center">녹음</TableHead>
                  <TableHead className="w-20 text-center">메모</TableHead>
                  {isAdmin && (
                    <TableHead className="text-center">관리</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow
                    key={lesson.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={isAdmin ? () => handleLessonClick(lesson) : () => router.push(`/student/lessons/${lesson.id}`)}
                  >
                    <TableCell className="whitespace-nowrap font-medium">
                      <div className="flex items-center gap-1.5">
                        {isAdmin && isNew(lesson) && (
                          <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
                            NEW
                          </span>
                        )}
                        {formatDate(lesson.date)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {lesson.songTitle || '-'}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {lesson.sessionNumber}회차
                    </TableCell>
                    <TableCell className="text-center">
                      {lesson.recordingCount > 0 ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            🎙 {lesson.recordingCount}개
                          </span>
                          {lesson.latestRecordingAt && (
                            <span className="whitespace-nowrap text-xs text-muted-foreground">
                              {formatRelativeTime(lesson.latestRecordingAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {lesson.studentMemo ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="inline-block h-2 w-2 rounded-full bg-primary" title="메모 있음" />
                          {lesson.memoUpdatedAt && (
                            <span className="whitespace-nowrap text-xs text-muted-foreground">
                              {formatRelativeTime(lesson.memoUpdatedAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-nowrap justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletingLesson(lesson)}
                          >
                            삭제
                          </Button>
                          <RecordingUpload lessonId={lesson.id} label="업로드" />
                        </div>
                      </TableCell>
                    )}
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
              hasRecording={deletingLesson.hasRecording}
              open={!!deletingLesson}
              onOpenChange={(open) => !open && setDeletingLesson(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
