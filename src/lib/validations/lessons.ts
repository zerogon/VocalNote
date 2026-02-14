import { z } from 'zod';

export const lessonFormSchema = z.object({
  date: z.string().min(1, '날짜를 선택해주세요.'),
  songTitle: z
    .string()
    .min(1, '노래 제목을 입력해주세요.')
    .max(200, '노래 제목은 200자 이하로 입력해주세요.'),
  sessionNumber: z.coerce
    .number()
    .int()
    .min(1, '회차는 1 이상이어야 합니다.')
    .max(4, '회차는 1~4 사이여야 합니다.'),
  content: z
    .string()
    .min(1, '레슨 내용을 입력해주세요.')
    .max(10000, '레슨 내용은 10000자 이하로 입력해주세요.'),
});

export type LessonFormInput = z.infer<typeof lessonFormSchema>;
