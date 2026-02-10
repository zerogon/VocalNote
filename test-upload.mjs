import { readFileSync as readF } from 'fs';
const envContent = readF('/home/zerogon/workspace/vocal/.env.local', 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+?)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { pgTable, serial, varchar, timestamp, pgEnum, boolean, integer, text } from 'drizzle-orm/pg-core';
import { desc, eq } from 'drizzle-orm';
import crypto from 'crypto';

// Recreate minimal schema
const roleEnum = pgEnum('role', ['admin', 'user']);
const sessions = pgTable('sessions', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: integer('user_id'),
  role: roleEnum('role').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  studentId: serial('student_id').notNull(),
  date: timestamp('date').notNull(),
  content: text('content').notNull(),
  recordingId: varchar('recording_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const db = drizzle(sql);

// Create a fresh admin session
const sessionId = crypto.randomUUID();
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

await db.insert(sessions).values({
  id: sessionId,
  userId: null,
  role: 'admin',
  expiresAt,
});
console.log('Created admin session:', sessionId);

// Get a lesson to test with
const lessonList = await db.select().from(lessons).orderBy(desc(lessons.createdAt)).limit(1);
if (lessonList.length === 0) {
  console.log('No lessons found!');
  process.exit(1);
}
const lesson = lessonList[0];
console.log('Test lesson:', lesson.id, '(student:', lesson.studentId, ')');

// Test upload
import { readFileSync } from 'fs';
const fileBuffer = readFileSync('/tmp/test-audio.mp3');
const blob = new Blob([fileBuffer], { type: 'audio/mpeg' });

const formData = new FormData();
formData.append('file', blob, 'test-audio.mp3');
formData.append('lessonId', String(lesson.id));

console.log('\nUploading to /api/recordings/upload ...');
const res = await fetch('http://localhost:3000/api/recordings/upload', {
  method: 'POST',
  headers: {
    Cookie: `session=${sessionId}`,
  },
  body: formData,
});

console.log('Status:', res.status);
const resText = await res.text();
console.log('Response:', resText);
let data;
try { data = JSON.parse(resText); } catch { data = {}; }

if (data.fileId) {
  // Test streaming
  console.log('\nTesting stream /api/recordings/' + data.fileId + ' ...');
  const streamRes = await fetch(`http://localhost:3000/api/recordings/${data.fileId}`, {
    headers: {
      Cookie: `session=${sessionId}`,
    },
  });
  console.log('Stream status:', streamRes.status);
  console.log('Content-Type:', streamRes.headers.get('content-type'));
  console.log('Content-Length:', streamRes.headers.get('content-length'));

  const body = await streamRes.arrayBuffer();
  console.log('Body size:', body.byteLength, 'bytes');
}

// Cleanup session
await db.delete(sessions).where(eq(sessions.id, sessionId));
console.log('\nCleaned up test session');
process.exit(0);
