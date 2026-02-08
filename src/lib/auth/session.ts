import { eq, and, gt } from 'drizzle-orm';
import { db, sessions, users, type User } from '@/lib/db';
import { SESSION_DURATION_MS } from './constants';
import { getSessionCookie, setSessionCookie, deleteSessionCookie } from './cookies';

export type SessionRole = 'admin' | 'user';

interface CreateSessionResult {
  sessionId: string;
  expiresAt: Date;
}

export async function createSession(
  userId: number | null,
  role: SessionRole
): Promise<CreateSessionResult> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    role,
    expiresAt,
  });

  await setSessionCookie(sessionId);

  return { sessionId, expiresAt };
}

export interface SessionData {
  session: {
    id: string;
    role: SessionRole;
    expiresAt: Date;
  };
  user: User | null;
}

export async function getSession(): Promise<SessionData | null> {
  const sessionId = await getSessionCookie();
  if (!sessionId) return null;

  // First, get the session
  const sessionResult = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (sessionResult.length === 0) {
    await deleteSessionCookie();
    return null;
  }

  const session = sessionResult[0];

  // If admin session (no userId), return without user
  if (session.userId === null) {
    return {
      session: {
        id: session.id,
        role: session.role,
        expiresAt: session.expiresAt,
      },
      user: null,
    };
  }

  // For student session, get the user
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (userResult.length === 0) {
    await deleteSessionCookie();
    return null;
  }

  return {
    session: {
      id: session.id,
      role: session.role,
      expiresAt: session.expiresAt,
    },
    user: userResult[0],
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  await deleteSessionCookie();
}

export async function deleteCurrentSession(): Promise<void> {
  const sessionId = await getSessionCookie();
  if (sessionId) {
    await deleteSession(sessionId);
  }
}
