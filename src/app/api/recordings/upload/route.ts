import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db, lessons, users } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { uploadFile, deleteFile, resolveUploadFolder } from '@/lib/google-drive';
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

  // 기존 녹음이 있으면 Drive에서 삭제
  if (targetLesson.recordingId) {
    try {
      await deleteFile(targetLesson.recordingId);
    } catch {
      // 기존 파일 삭제 실패는 무시 (이미 삭제되었을 수 있음)
    }
  }

  // 학생 이름 조회
  const student = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, targetLesson.studentId))
    .limit(1);

  const studentName = student.length > 0 ? student[0].name : '알수없음';
  const songTitle = targetLesson.songTitle || '무제';

  // KST 기준 업로드 날짜
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const year = kst.getUTCFullYear().toString();
  const month = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kst.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // 파일명에 부적합한 문자 제거
  const sanitize = (s: string) => s.replace(/[/\\*?"<>|]/g, '');

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop() || 'mp3';
  const fileName = `${sanitize(studentName)}_${sanitize(songTitle)}_${dateStr}.${ext}`;

  // 폴더 구조: 년도/학생이름/
  const folderId = await resolveUploadFolder(year, sanitize(studentName));
  const fileId = await uploadFile(buffer, fileName, file.type, folderId);

  await db
    .update(lessons)
    .set({ recordingId: fileId, updatedAt: new Date() })
    .where(eq(lessons.id, targetLesson.id));

  revalidatePath(`/admin/students/${targetLesson.studentId}/lessons`);
  revalidatePath('/student/dashboard');
  revalidatePath(`/student/lessons/${targetLesson.id}`);

  return NextResponse.json({ success: true, fileId });
}
