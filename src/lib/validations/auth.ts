import { z } from 'zod';

const phoneRegex = /^01[0-9]{8,9}$/;

export const studentLoginSchema = z.object({
  phone: z
    .string()
    .min(1, '휴대폰 번호를 입력해주세요.')
    .regex(phoneRegex, '올바른 휴대폰 번호를 입력해주세요.'),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export const studentFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').max(100, '이름은 100자 이하로 입력해주세요.'),
  phone: z
    .string()
    .min(1, '휴대폰 번호를 입력해주세요.')
    .regex(phoneRegex, '올바른 휴대폰 번호를 입력해주세요.'),
});

export type StudentLoginInput = z.infer<typeof studentLoginSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type StudentFormInput = z.infer<typeof studentFormSchema>;
