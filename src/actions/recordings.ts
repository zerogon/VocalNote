'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db, recordings, lessons, type Recording } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { deleteFile } from '@/lib/google-drive';
import type { ActionResult } from './lessons';

function revalidateAll(studentId: number, lessonId: number) {
  revalidatePath(`/admin/students/${studentId}/lessons`);
  revalidatePath('/student/dashboard');
  revalidatePath(`/student/lessons/${lessonId}`);
}

async function getRecordingWithLesson(recordingId: number) {
  const result = await db
    .select({ recording: recordings, lesson: lessons })
    .from(recordings)
    .innerJoin(lessons, eq(recordings.lessonId, lessons.id))
    .where(eq(recordings.id, recordingId))
    .limit(1);
  return result[0] ?? null;
}

export async function getRecordingsByLesson(lessonId: number): Promise<Recording[]> {
  return db
    .select()
    .from(recordings)
    .where(eq(recordings.lessonId, lessonId))
    .orderBy(recordings.createdAt);
}

export async function deleteRecording(recordingId: number): Promise<ActionResult> {
  const sessionData = await getSession();
  if (!sessionData) {
    return { error: '로그인이 필요합니다.' };
  }

  const row = await getRecordingWithLesson(recordingId);
  if (!row) {
    return { error: '녹음을 찾을 수 없습니다.' };
  }

  const { recording, lesson } = row;
  const isAdmin = sessionData.session.role === 'admin';

  if (!isAdmin) {
    if (!sessionData.user) return { error: '권한이 없습니다.' };
    if (lesson.studentId !== sessionData.user.id) return { error: '권한이 없습니다.' };
    if (!sessionData.user.canUpload) return { error: '권한이 없습니다.' };
  }

  try {
    await deleteFile(recording.fileId);
  } catch {
    // Drive 파일 삭제 실패는 무시
  }

  await db.delete(recordings).where(eq(recordings.id, recordingId));

  revalidateAll(lesson.studentId, lesson.id);
  return { success: true };
}

export async function renameRecording(
  recordingId: number,
  newName: string
): Promise<ActionResult> {
  const sessionData = await getSession();
  if (!sessionData) {
    return { error: '로그인이 필요합니다.' };
  }

  const trimmed = newName.trim();
  if (!trimmed) {
    return { error: '표시명을 입력해주세요.' };
  }
  if (trimmed.length > 500) {
    return { error: '표시명은 500자 이하로 입력해주세요.' };
  }

  const row = await getRecordingWithLesson(recordingId);
  if (!row) {
    return { error: '녹음을 찾을 수 없습니다.' };
  }

  const { lesson } = row;
  const isAdmin = sessionData.session.role === 'admin';

  if (!isAdmin) {
    if (!sessionData.user) return { error: '권한이 없습니다.' };
    if (lesson.studentId !== sessionData.user.id) return { error: '권한이 없습니다.' };
    if (!sessionData.user.canUpload) return { error: '권한이 없습니다.' };
  }

  await db
    .update(recordings)
    .set({ displayName: trimmed, updatedAt: new Date() })
    .where(eq(recordings.id, recordingId));

  revalidateAll(lesson.studentId, lesson.id);
  return { success: true };
}
