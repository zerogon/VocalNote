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
        <CardTitle>{formatDate(lesson.date)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">{lesson.content}</div>
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
