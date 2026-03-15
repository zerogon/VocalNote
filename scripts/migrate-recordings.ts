/**
 * 일회성 데이터 migration 스크립트
 * lessons.recording_id → recordings 테이블
 *
 * 실행 방법:
 *   npx tsx scripts/migrate-recordings.ts
 *
 * 주의: recordings 테이블이 먼저 생성된 후 실행할 것 (drizzle-kit push 후)
 *       이 스크립트 실행 후 schema.ts에서 recordingId 컬럼 제거하고 다시 push할 것
 */

import { sql } from '@vercel/postgres';

// .env.local 로드
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  console.log('migration 시작...');

  // 기존 recording_id가 있는 레슨 조회 (raw SQL - schema에서 이미 제거되었을 수 있으므로)
  const { rows } = await sql`
    SELECT l.id AS lesson_id, l.recording_id, l.song_title
    FROM lessons l
    WHERE l.recording_id IS NOT NULL
  `;

  console.log(`migration 대상 레슨: ${rows.length}개`);

  let succeeded = 0;
  let failed = 0;

  for (const row of rows) {
    const displayName = row.song_title ? `${row.song_title}_녹음` : '녹음';
    try {
      // 이미 존재하는지 확인
      const existing = await sql`
        SELECT id FROM recordings WHERE file_id = ${row.recording_id}
      `;
      if (existing.rows.length > 0) {
        console.log(`  레슨 ${row.lesson_id}: 이미 존재, 건너뜀`);
        continue;
      }

      await sql`
        INSERT INTO recordings (lesson_id, file_id, display_name, created_at, updated_at)
        VALUES (${row.lesson_id}, ${row.recording_id}, ${displayName}, NOW(), NOW())
      `;
      console.log(`  레슨 ${row.lesson_id}: 성공 (${displayName})`);
      succeeded++;
    } catch (err) {
      console.error(`  레슨 ${row.lesson_id}: 실패`, err);
      failed++;
    }
  }

  console.log(`\nmigration 완료: 성공 ${succeeded}개, 실패 ${failed}개`);
  console.log('\n다음 단계: schema.ts에서 recordingId 컬럼 제거 후 npx drizzle-kit push 실행');
}

main().catch((err) => {
  console.error('migration 오류:', err);
  process.exit(1);
});
