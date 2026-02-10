/**
 * Google OAuth2 Refresh Token 발급 스크립트 (일회성)
 *
 * 사용법:
 *   GOOGLE_CLIENT_ID="..." GOOGLE_CLIENT_SECRET="..." node scripts/get-google-token.mjs
 *
 * 사전 준비:
 *   1. Google Cloud Console > API 및 서비스 > 사용자 인증 정보
 *   2. "OAuth 2.0 클라이언트 ID" 생성 (유형: 웹 애플리케이션)
 *   3. 승인된 리디렉션 URI에 http://localhost:3333/callback 추가
 *   4. Google Drive API 사용 설정 확인
 */

import { google } from 'googleapis';
import http from 'node:http';
import url from 'node:url';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET 환경변수를 설정하세요.');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'http://localhost:3333/callback',
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive'],
  prompt: 'consent',
});

console.log('\n아래 URL을 브라우저에서 열어 인증하세요:\n');
console.log(authUrl);
console.log('\n인증 완료를 기다리는 중...\n');

const server = http.createServer(async (req, res) => {
  const query = url.parse(req.url, true).query;
  if (query.code) {
    try {
      const { tokens } = await oauth2Client.getToken(query.code);
      console.log('=== Refresh Token 발급 성공 ===\n');
      console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`);
      console.log('.env.local 파일에 위 값을 붙여넣으세요.');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h2>인증 완료! 이 탭을 닫아도 됩니다.</h2>');
    } catch (err) {
      console.error('토큰 교환 실패:', err.message);
      res.writeHead(500);
      res.end('Error');
    }
    server.close();
  }
});

server.listen(3333, () => {
  console.log('http://localhost:3333 에서 콜백 대기 중...');
});
