'use server';

import { revalidatePath } from 'next/cache';
import { eq, desc, count, max } from 'drizzle-orm';
import { db, lessons, recordings, type Lesson } from '@/lib/db';
import { lessonFormSchema, studentMemoSchema } from '@/lib/validations/lessons';
import { getSession } from '@/lib/auth/session';
import { deleteFile } from '@/lib/google-drive';

export interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function getLessonsWithRecordingStatus(
  studentId: number
): Promise<(Lesson & { hasRecording: boolean; recordingCount: number; latestRecordingAt: Date | null; memoUpdatedAt: Date | null })[]> {
  const result = await db
    .select({
      lesson: lessons,
      recordingCount: count(recordings.id),
      latestRecordingAt: max(recordings.createdAt),
    })
    .from(lessons)
    .leftJoin(recordings, eq(recordings.lessonId, lessons.id))
    .where(eq(lessons.studentId, studentId))
    .groupBy(lessons.id)
    .orderBy(desc(lessons.date));

  return result.map((r) => ({
    ...r.lesson,
    hasRecording: r.recordingCount > 0,
    recordingCount: r.recordingCount,
    latestRecordingAt: r.latestRecordingAt ?? null,
    memoUpdatedAt: r.lesson.studentMemo ? r.lesson.updatedAt : null,
  }));
}

export async function getLessonById(id: number): Promise<Lesson | null> {
  const result = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function addLesson(
  studentId: number,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    date: formData.get('date'),
    songTitle: formData.get('songTitle'),
    sessionNumber: formData.get('sessionNumber'),
    content: formData.get('content'),
  };

  const result = lessonFormSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  await db.insert(lessons).values({
    studentId,
    date: new Date(result.data.date),
    songTitle: result.data.songTitle,
    sessionNumber: result.data.sessionNumber,
    content: result.data.content,
  });

  revalidatePath(`/admin/students/${studentId}/lessons`);
  revalidatePath('/student/dashboard');
  return { success: true };
}

export async function updateLesson(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    date: formData.get('date'),
    songTitle: formData.get('songTitle'),
    sessionNumber: formData.get('sessionNumber'),
    content: formData.get('content'),
  };

  const result = lessonFormSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const lesson = await getLessonById(id);
  if (!lesson) {
    return { error: '레슨을 찾을 수 없습니다.' };
  }

  await db
    .update(lessons)
    .set({
      date: new Date(result.data.date),
      songTitle: result.data.songTitle,
      sessionNumber: result.data.sessionNumber,
      content: result.data.content,
      updatedAt: new Date(),
    })
    .where(eq(lessons.id, id));

  revalidatePath(`/admin/students/${lesson.studentId}/lessons`);
  revalidatePath('/student/dashboard');
  revalidatePath(`/student/lessons/${id}`);
  return { success: true };
}

export async function deleteLesson(id: number): Promise<ActionResult> {
  const lesson = await getLessonById(id);
  if (!lesson) {
    return { error: '레슨을 찾을 수 없습니다.' };
  }

  // 연결된 녹음 파일 모두 Drive에서 삭제
  const lessonRecordings = await db
    .select()
    .from(recordings)
    .where(eq(recordings.lessonId, id));

  for (const recording of lessonRecordings) {
    try {
      await deleteFile(recording.fileId);
    } catch {
      // Drive 파일 삭제 실패는 무시
    }
  }

  await db.delete(lessons).where(eq(lessons.id, id));

  revalidatePath(`/admin/students/${lesson.studentId}/lessons`);
  revalidatePath('/student/dashboard');
  return { success: true };
}

export async function saveStudentMemo(
  lessonId: number,
  memo: string
): Promise<ActionResult> {
  const sessionData = await getSession();
  if (!sessionData?.user) {
    return { error: '로그인이 필요합니다.' };
  }

  const result = studentMemoSchema.safeParse({ memo });
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    return { error: '레슨을 찾을 수 없습니다.' };
  }

  if (lesson.studentId !== sessionData.user.id) {
    return { error: '권한이 없습니다.' };
  }

  await db
    .update(lessons)
    .set({
      studentMemo: result.data.memo.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(lessons.id, lessonId));

  revalidatePath(`/student/lessons/${lessonId}`);
  return { success: true };
}

