import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { Lesson } from '@/lib/db';

interface LessonDetailProps {
  lesson: Lesson;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function LessonDetail({ lesson }: LessonDetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{formatDate(lesson.date)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap">{lesson.content}</div>
        {/* Phase 4: 녹음 재생 UI 추가 예정 */}
      </CardContent>
    </Card>
  );
}
