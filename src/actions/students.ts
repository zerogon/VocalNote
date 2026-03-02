'use server';

import { revalidatePath } from 'next/cache';
import { eq, count, max, isNotNull, isNull, or, gt, and } from 'drizzle-orm';
import { db, users, lessons, recordings, type User } from '@/lib/db';
import { studentFormSchema } from '@/lib/validations/auth';

export interface ActionResult {
  success?: boolean;
  error?: string;
}

export interface StudentWithActivity extends User {
  latestActivityAt: Date | null;
  latestActivityType: 'recording' | 'memo' | null;
}

export async function getAdminStats() {
  const [studentCount] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, 'user'));

  const [lessonCount] = await db.select({ count: count() }).from(lessons);

  return {
    totalStudents: studentCount.count,
    totalLessons: lessonCount.count,
  };
}

export async function getStudents(): Promise<StudentWithActivity[]> {
  const [allStudents, latestRecordings, latestMemos] = await Promise.all([
    db.select().from(users).where(eq(users.role, 'user')),
    db
      .select({ studentId: lessons.studentId, latestAt: max(recordings.createdAt) })
      .from(recordings)
      .innerJoin(lessons, eq(recordings.lessonId, lessons.id))
      .where(
        or(
          isNull(lessons.adminViewedAt),
          gt(recordings.createdAt, lessons.adminViewedAt)
        )
      )
      .groupBy(lessons.studentId),
    db
      .select({ studentId: lessons.studentId, latestAt: max(lessons.updatedAt) })
      .from(lessons)
      .where(
        and(
          isNotNull(lessons.studentMemo),
          or(
            isNull(lessons.adminViewedAt),
            gt(lessons.updatedAt, lessons.adminViewedAt)
          )
        )
      )
      .groupBy(lessons.studentId),
  ]);

  const recordingMap = new Map(latestRecordings.map((r) => [r.studentId, r.latestAt]));
  const memoMap = new Map(latestMemos.map((m) => [m.studentId, m.latestAt]));

  const studentsWithActivity: StudentWithActivity[] = allStudents.map((student) => {
    const recAt = recordingMap.get(student.id) ?? null;
    const memoAt = memoMap.get(student.id) ?? null;

    let latestActivityAt: Date | null = null;
    let latestActivityType: 'recording' | 'memo' | null = null;

    if (recAt && memoAt) {
      if (recAt >= memoAt) {
        latestActivityAt = recAt;
        latestActivityType = 'recording';
      } else {
        latestActivityAt = memoAt;
        latestActivityType = 'memo';
      }
    } else if (recAt) {
      latestActivityAt = recAt;
      latestActivityType = 'recording';
    } else if (memoAt) {
      latestActivityAt = memoAt;
      latestActivityType = 'memo';
    }

    return { ...student, latestActivityAt, latestActivityType };
  });

  studentsWithActivity.sort((a, b) => {
    if (a.latestActivityAt && b.latestActivityAt) {
      return b.latestActivityAt.getTime() - a.latestActivityAt.getTime();
    }
    if (a.latestActivityAt) return -1;
    if (b.latestActivityAt) return 1;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return studentsWithActivity;
}

export async function addStudent(formData: FormData): Promise<ActionResult> {
  const rawData = {
    name: formData.get('name'),
    phone: formData.get('phone'),
  };

  const result = studentFormSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { name, phone } = result.data;

  // Check for duplicate phone
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  if (existing.length > 0) {
    return { error: '이미 등록된 번호입니다.' };
  }

  await db.insert(users).values({
    name,
    phone,
    role: 'user',
  });

  revalidatePath('/admin/students');
  return { success: true };
}

export async function updateStudent(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    name: formData.get('name'),
    phone: formData.get('phone'),
  };

  const result = studentFormSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { name, phone } = result.data;

  // Check for duplicate phone (excluding current user)
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  if (existing.length > 0 && existing[0].id !== id) {
    return { error: '이미 등록된 번호입니다.' };
  }

  await db
    .update(users)
    .set({ name, phone, updatedAt: new Date() })
    .where(eq(users.id, id));

  revalidatePath('/admin/students');
  return { success: true };
}

export async function deleteStudent(id: number): Promise<ActionResult> {
  await db.delete(users).where(eq(users.id, id));
  revalidatePath('/admin/students');
  return { success: true };
}

export async function toggleUploadPermission(
  id: number,
  canUpload: boolean
): Promise<ActionResult> {
  await db
    .update(users)
    .set({ canUpload, updatedAt: new Date() })
    .where(eq(users.id, id));

  revalidatePath('/admin/students');
  return { success: true };
}
