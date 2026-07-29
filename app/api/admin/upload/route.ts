import { NextRequest } from 'next/server'
import { ok, err } from '@/lib/api-response'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-server'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5MB
const MAX_AUDIO_SIZE = 2 * 1024 * 1024  // 2MB

// POST /api/admin/upload — Admin only, upload file to Supabase Storage
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const e = error as Error & { code: string; statusCode: number }
      return err(e.code, e.message, e.statusCode)
    }
    return err('UNAUTHORIZED', 'Unauthorized', 401)
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'misc'

    if (!file) {
      return err('VALIDATION_ERROR', 'Không có file nào được gửi', 422)
    }

    const isImage = file.type.startsWith('image/')
    const isAudio = file.type.startsWith('audio/')

    if (!isImage && !isAudio) {
      return err('VALIDATION_ERROR', 'Chỉ chấp nhận file ảnh (image/*) hoặc audio (audio/*)', 422)
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE
    if (file.size > maxSize) {
      const limitMB = maxSize / (1024 * 1024)
      return err('VALIDATION_ERROR', `File quá lớn. Giới hạn: ${limitMB}MB`, 422)
    }

    const ext = file.name.split('.').pop() ?? (isImage ? 'jpg' : 'mp3')
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from('french-media')
      .upload(filename, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error('[Upload error]', uploadError)
      return err('INTERNAL_ERROR', 'Không thể upload file', 500)
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('french-media')
      .getPublicUrl(filename)

    return ok({ url: publicUrl, filename })
  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    return err('INTERNAL_ERROR', 'Không thể xử lý upload', 500)
  }
}
