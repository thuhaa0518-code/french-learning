import { z } from 'zod'

export const UpdateProfileSchema = z.object({
  tenHienThi: z
    .string()
    .min(1, 'Tên hiển thị không được để trống')
    .max(200, 'Tên hiển thị tối đa 200 ký tự'),
})

export const UpdateRoleSchema = z.object({
  vaiTro: z.enum(['STUDENT', 'ADMIN']),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>
