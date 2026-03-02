import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'user']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 4 }).notNull().unique(),
  role: roleEnum('role').default('user').notNull(),
  canUpload: boolean('can_upload').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  role: roleEnum('role').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  studentId: serial('student_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  date: timestamp('date').notNull(),
  songTitle: varchar('song_title', { length: 200 }).notNull().default(''),
  sessionNumber: integer('session_number').notNull().default(1),
  content: text('content').notNull(),
  studentMemo: text('student_memo'),
  adminViewedAt: timestamp('admin_viewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recordings = pgTable('recordings', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id')
    .references(() => lessons.id, { onDelete: 'cascade' })
    .notNull(),
  fileId: varchar('file_id', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 500 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
export type Recording = typeof recordings.$inferSelect;
export type NewRecording = typeof recordings.$inferInsert;
