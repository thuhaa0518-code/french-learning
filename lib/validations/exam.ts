import { z } from 'zod'

export const CreateExamSchema = z.object({
  tieuDe: z.string().min(1, 'Tiêu đề không được để trống'),
  moTa: z.string().optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2']),
  thoiGianLam: z.number().int().min(1, 'Thời gian làm phải >= 1 phút').default(45),
  isPublish: z.boolean().default(false),
  videoId: z.string().optional(),
})

export const DapAnSchema = z.object({
  noiDung: z.string().min(1, 'Nội dung đáp án không được để trống'),
  laDapAnDung: z.boolean(),
})

export const CreateQuestionSchema = z
  .object({
    loai: z.enum(['MULTIPLE_CHOICE']),
    noiDung: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
    giaiThich: z.string().optional(),
    thuTu: z.number().int().min(0).default(0),
    dapAn: z
      .array(DapAnSchema)
      .min(2, 'Câu hỏi phải có ít nhất 2 đáp án'),
  })
  .refine(
    (data) => data.dapAn.filter((d) => d.laDapAnDung).length === 1,
    { message: 'Phải có đúng 1 đáp án đúng', path: ['dapAn'] },
  )

export const CauTraLoiSchema = z.object({
  questionId: z.string().min(1),
  noiDung: z.string().optional().nullable(),
})

export const SubmitAnswersSchema = z.object({
  cauTraLoi: z.array(CauTraLoiSchema),
})

export type CreateExamInput = z.infer<typeof CreateExamSchema>
export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>
export type SubmitAnswersInput = z.infer<typeof SubmitAnswersSchema>
