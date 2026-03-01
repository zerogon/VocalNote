import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db, lessons, recordings, users } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { uploadFile, resolveUploadFolder } from '@/lib/google-drive';
import { validateAudioFile } from '@/lib/validations/recording';

export async function POST(request: NextRequest) {
  const sessionData = await getSession();
  if (!sessionData) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const isAdmin = sessionData.session.role === 'admin';

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const lessonId = formData.get('lessonId') as string | null;

  if (!file || !lessonId) {
    return NextResponse.json(
      { error: '파일과 레슨 ID가 필요합니다.' },
      { status: 400 }
    );
  }

  const validationError = validateAudioFile(file);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }

  const lesson = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, parseInt(lessonId, 10)))
    .limit(1);

  if (lesson.length === 0) {
    return NextResponse.json(
      { error: '레슨을 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  const targetLesson = lesson[0];

  // 권한 확인: 관리자는 항상 허용, 학생은 본인 레슨 + canUpload 확인
  if (!isAdmin) {
    if (!sessionData.user) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }
    if (targetLesson.studentId !== sessionData.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }
    if (!sessionData.user.canUpload) {
      return NextResponse.json(
        { error: '업로드 권한이 없습니다.' },
        { status: 403 }
      );
    }
  }

  // 학생 이름 조회 (폴더 구조용)
  const student = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, targetLesson.studentId))
    .limit(1);

  const studentName = student.length > 0 ? student[0].name : '알수없음';
  const songTitle = targetLesson.songTitle || '무제';
  const sessionNumber = targetLesson.sessionNumber;

  // 파일명에 부적합한 문자 제거
  const sanitize = (s: string) => s.replace(/[/\\*?"<>|]/g, '');

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop() || 'mp3';
  const originalBaseName = file.name.replace(/\.[^/.]+$/, '');
  const fileName = `${sessionNumber}회차_${sanitize(songTitle)}_${sanitize(originalBaseName)}.${ext}`;

  // 폴더 구조: 년도/학생이름/
  const year = new Date().getFullYear().toString();
  const folderId = await resolveUploadFolder(year, sanitize(studentName));
  const fileId = await uploadFile(buffer, fileName, file.type, folderId);

  const displayName = file.name.replace(/\.[^/.]+$/, '');

  const [inserted] = await db
    .insert(recordings)
    .values({
      lessonId: targetLesson.id,
      fileId,
      displayName,
    })
    .returning();

  revalidatePath(`/admin/students/${targetLesson.studentId}/lessons`);
  revalidatePath('/student/dashboard');
  revalidatePath(`/student/lessons/${targetLesson.id}`);

  return NextResponse.json({ success: true, fileId, recordingId: inserted.id });
}
