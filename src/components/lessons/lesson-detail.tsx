import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { RecordingSection } from '@/components/recordings';
import { StudentMemoSection } from './student-memo-section';
import { getRecordingsByLesson } from '@/actions/recordings';
import type { Lesson } from '@/lib/db';

interface LessonDetailProps {
  lesson: Lesson;
  canUpload?: boolean;
  showMemo?: boolean;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function LessonDetail({ lesson, canUpload = false, showMemo = false }: LessonDetailProps) {
  const recordings = await getRecordingsByLesson(lesson.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>
            {lesson.songTitle
              ? `${lesson.songTitle} - ${lesson.sessionNumber}회차`
              : formatDate(lesson.date)}
          </CardTitle>
        </div>
        {lesson.songTitle && (
          <p className="text-sm text-muted-foreground">{formatDate(lesson.date)}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="whitespace-pre-wrap break-words leading-relaxed text-foreground/90">{lesson.content}</div>
        {showMemo && (
          <>
            <div className="border-t border-border/40" />
            <StudentMemoSection lessonId={lesson.id} initialMemo={lesson.studentMemo ?? null} />
          </>
        )}
        <div className="border-t border-border/40 pt-6">
          <RecordingSection
            lessonId={lesson.id}
            recordings={recordings}
            canUpload={canUpload}
          />
        </div>
      </CardContent>
    </Card>
  );
}
