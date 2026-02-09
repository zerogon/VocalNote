import { z } from 'zod';

export const lessonFormSchema = z.object({
  date: z.string().min(1, '날짜를 선택해주세요.'),
  content: z
    .string()
    .min(1, '레슨 내용을 입력해주세요.')
    .max(10000, '레슨 내용은 10000자 이하로 입력해주세요.'),
});

export type LessonFormInput = z.infer<typeof lessonFormSchema>;
