export const SESSION_COOKIE_NAME = 'session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const AUTH_MESSAGES = {
  INVALID_PHONE: '올바른 휴대폰 번호를 입력해주세요.',
  PHONE_NOT_FOUND: '등록되지 않은 휴대폰 번호입니다.',
  INVALID_PASSWORD: '비밀번호가 일치하지 않습니다.',
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  ADMIN_ONLY: '관리자만 접근할 수 있습니다.',
  STUDENT_ONLY: '학생만 접근할 수 있습니다.',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  ADMIN_STUDENTS: '/admin/students',
  STUDENT_DASHBOARD: '/student/dashboard',
} as const;
