'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { timingSafeEqual } from 'crypto';
import { db, users } from '@/lib/db';
import { createSession, deleteCurrentSession } from '@/lib/auth/session';
import { AUTH_MESSAGES, ROUTES } from '@/lib/auth/constants';
import { studentLoginSchema, adminLoginSchema } from '@/lib/validations/auth';

export interface ActionState {
  error?: string;
  success?: boolean;
}

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return timingSafeEqual(aBuffer, bBuffer);
}

export async function loginStudent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    phone: formData.get('phone'),
  };

  const result = studentLoginSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { phone } = result.data;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  if (user.length === 0) {
    return { error: AUTH_MESSAGES.PHONE_NOT_FOUND };
  }

  await createSession(user[0].id, 'user');

  redirect(ROUTES.STUDENT_DASHBOARD);
}

export async function loginAdmin(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    password: formData.get('password'),
  };

  const result = adminLoginSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { password } = result.data;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || !safeCompare(password, adminPassword)) {
    return { error: AUTH_MESSAGES.INVALID_PASSWORD };
  }

  // For admin, we create a session with null userId
  await createSession(null, 'admin');

  redirect(ROUTES.ADMIN_STUDENTS);
}

export async function logout(): Promise<void> {
  await deleteCurrentSession();
  redirect(ROUTES.LOGIN);
}
