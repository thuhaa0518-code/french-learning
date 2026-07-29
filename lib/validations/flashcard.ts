import { z } from 'zod'

export const CreateDeckSchema = z.object({
  tieuDe: z.string().min(1, 'Tiêu đề không được để trống').max(200),
  moTa: z.string().optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2']).optional(),
  isPublish: z.boolean().default(false),
})

export const UpdateDeckSchema = z.object({
  tieuDe: z.string().min(1).max(200).optional(),
  moTa: z.string().optional().nullable(),
  level: z.enum(['A1', 'A2', 'B1', 'B2']).optional().nullable(),
  isPublish: z.boolean().optional(),
})

export const CreateCardSchema = z.object({
  deckId: z.string().min(1, 'Deck ID không được để trống'),
  tuPhap: z.string().min(1, 'Từ pháp không được để trống'),
  nghiaViet: z.string().min(1, 'Nghĩa Việt không được để trống'),
  phatAm: z.string().optional(),
  viDu: z.string().optional(),
  audioUrl: z.string().url('URL audio không hợp lệ').optional(),
})

export const UpdateCardSchema = z.object({
  tuPhap: z.string().min(1).optional(),
  nghiaViet: z.string().min(1).optional(),
  phatAm: z.string().optional().nullable(),
  viDu: z.string().optional().nullable(),
  audioUrl: z.string().url().optional().nullable(),
})

export type CreateDeckInput = z.infer<typeof CreateDeckSchema>
export type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>
export type CreateCardInput = z.infer<typeof CreateCardSchema>
export type UpdateCardInput = z.infer<typeof UpdateCardSchema>
