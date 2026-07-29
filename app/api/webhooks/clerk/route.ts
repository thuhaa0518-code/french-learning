import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'

type ClerkWebhookEvent =
  | { type: 'user.created'; data: { id: string; email_addresses: { email_address: string }[]; first_name: string | null; last_name: string | null } }
  | { type: 'user.updated'; data: { id: string; email_addresses: { email_address: string }[]; first_name: string | null; last_name: string | null } }
  | { type: 'user.deleted'; data: { id: string } }

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!CLERK_WEBHOOK_SECRET) {
    return err('INTERNAL_ERROR', 'Missing CLERK_WEBHOOK_SECRET', 500)
  }

  // Lấy Svix headers
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return err('UNAUTHORIZED', 'Missing Svix headers', 400)
  }

  // Lấy body
  const body = await req.text()

  // Verify Svix signature
  const wh = new Webhook(CLERK_WEBHOOK_SECRET)
  let event: ClerkWebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch {
    return err('UNAUTHORIZED', 'Invalid Svix signature', 400)
  }

  // Xử lý sự kiện
  try {
    switch (event.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = event.data
        const email = email_addresses[0]?.email_address ?? ''
        const tenHienThi = [first_name, last_name].filter(Boolean).join(' ') || email

        await prisma.user.create({
          data: {
            clerkId: id,
            email,
            tenHienThi,
            vaiTro: 'STUDENT',
          },
        })
        break
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name } = event.data
        const email = email_addresses[0]?.email_address ?? ''
        const tenHienThi = [first_name, last_name].filter(Boolean).join(' ') || email

        await prisma.user.update({
          where: { clerkId: id },
          data: { email, tenHienThi },
        })
        break
      }

      case 'user.deleted': {
        const { id } = event.data
        await prisma.user.delete({
          where: { clerkId: id },
        })
        break
      }

      default:
        // Bỏ qua các sự kiện không xử lý
        break
    }

    return ok({ received: true })
  } catch (error) {
    // Prisma P2025 = record not found
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'P2025') {
      return ok({ received: true })
    }
    console.error('[Clerk Webhook Error]', error)
    return err('INTERNAL_ERROR', 'Failed to process webhook', 500)
  }
}
