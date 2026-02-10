import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, lessons } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getFileStream } from '@/lib/google-drive';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const sessionData = await getSession();
  if (!sessionData) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { fileId } = await params;
  const isAdmin = sessionData.session.role === 'admin';

  // 해당 fileId를 가진 레슨 조회
  const lesson = await db
    .select()
    .from(lessons)
    .where(eq(lessons.recordingId, fileId))
    .limit(1);

  if (lesson.length === 0) {
    return NextResponse.json(
      { error: '녹음 파일을 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  // 학생은 본인 레슨만 접근 가능
  if (!isAdmin) {
    if (!sessionData.user || lesson[0].studentId !== sessionData.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }
  }

  const { stream, mimeType, size } = await getFileStream(fileId);

  // Node Readable → Web ReadableStream
  const webStream = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      stream.on('end', () => {
        controller.close();
      });
      stream.on('error', (err: Error) => {
        controller.error(err);
      });
    },
  });

  return new Response(webStream, {
    headers: {
      'Content-Type': mimeType,
      ...(size > 0 && { 'Content-Length': String(size) }),
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
