'use server';

import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';
import { db, lessons, type Lesson } from '@/lib/db';
import { lessonFormSchema } from '@/lib/validations/lessons';
import { deleteFile } from '@/lib/google-drive';

export interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function getLessonsByStudent(studentId: number): Promise<Lesson[]> {
  return db
    .select()
    .from(lessons)
    .where(eq(lessons.studentId, studentId))
    .orderBy(desc(lessons.date));
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
    content: formData.get('content'),
  };

  const result = lessonFormSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  await db.insert(lessons).values({
    studentId,
    date: new Date(result.data.date),
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

  // 연결된 녹음 파일이 있으면 Drive에서 삭제
  if (lesson.recordingId) {
    try {
      await deleteFile(lesson.recordingId);
    } catch {
      // Drive 파일 삭제 실패는 무시
    }
  }

  await db.delete(lessons).where(eq(lessons.id, id));

  revalidatePath(`/admin/students/${lesson.studentId}/lessons`);
  revalidatePath('/student/dashboard');
  return { success: true };
}

export async function removeRecording(lessonId: number): Promise<ActionResult> {
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    return { error: '레슨을 찾을 수 없습니다.' };
  }

  if (!lesson.recordingId) {
    return { error: '녹음 파일이 없습니다.' };
  }

  try {
    await deleteFile(lesson.recordingId);
  } catch {
    // Drive 파일 삭제 실패는 무시
  }

  await db
    .update(lessons)
    .set({ recordingId: null, updatedAt: new Date() })
    .where(eq(lessons.id, lessonId));

  revalidatePath(`/admin/students/${lesson.studentId}/lessons`);
  revalidatePath('/student/dashboard');
  revalidatePath(`/student/lessons/${lessonId}`);
  return { success: true };
}
