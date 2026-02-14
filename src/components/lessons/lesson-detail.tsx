import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { RecordingSection } from '@/components/recordings';
import type { Lesson } from '@/lib/db';

interface LessonDetailProps {
  lesson: Lesson;
  canUpload?: boolean;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function LessonDetail({ lesson, canUpload = false }: LessonDetailProps) {
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
        <div className="border-t border-border/40 pt-6">
        <RecordingSection
          lessonId={lesson.id}
          recordingId={lesson.recordingId}
          canUpload={canUpload}
        />
        </div>
      </CardContent>
    </Card>
  );
}
