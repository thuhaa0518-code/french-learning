import { z } from 'zod'

export const SectionSchema = z.object({
  loai: z.enum(['TEXT', 'VOCABULARY', 'GRAMMAR', 'VIDEO', 'MINI_QUIZ', 'EXERCISE']),
  noiDung: z.string().min(1, 'Nội dung section không được để trống'),
  thuTu: z.number().int().min(0).default(0),
})

export const CreateLessonSchema = z.object({
  tieuDe: z.string().min(1, 'Tiêu đề không được để trống').max(300),
  level: z.enum(['A1', 'A2', 'B1', 'B2']),
  chuDe: z.enum(['VOCABULARY', 'GRAMMAR', 'LISTENING', 'READING']),
  anhBia: z.string().url('URL ảnh bìa không hợp lệ').optional(),
  thoiGianDoc: z.number().int().min(1).default(5),
  sections: z.array(SectionSchema).min(1, 'Bài học phải có ít nhất 1 section'),
  isPublish: z.boolean().optional().default(false),
})

export const UpdateLessonSchema = z.object({
  tieuDe: z.string().min(1).max(300).optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2']).optional(),
  chuDe: z.enum(['VOCABULARY', 'GRAMMAR', 'LISTENING', 'READING']).optional(),
  anhBia: z.string().url().optional().nullable(),
  thoiGianDoc: z.number().int().min(1).optional(),
  sections: z.array(SectionSchema).min(1).optional(),
  isPublish: z.boolean().optional(),
})

export type CreateLessonInput = z.infer<typeof CreateLessonSchema>
export type UpdateLessonInput = z.infer<typeof UpdateLessonSchema>
export type SectionInput = z.infer<typeof SectionSchema>
