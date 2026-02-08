'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db, users, type User } from '@/lib/db';
import { studentFormSchema } from '@/lib/validations/auth';

export interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function getStudents(): Promise<User[]> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.role, 'user'))
    .orderBy(users.createdAt);
  return result;
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
    return { error: '이미 등록된 휴대폰 번호입니다.' };
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
    return { error: '이미 등록된 휴대폰 번호입니다.' };
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
