import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export default function StudentDashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">대시보드</h1>
      <Card>
        <CardHeader>
          <CardTitle>환영합니다</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            레슨 기능은 Phase 3에서 추가될 예정입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
