import { defineConfig, env } from 'prisma/config'

// Load .env.local vì Prisma CLI không tự đọc file này
import { readFileSync } from 'fs'
import { resolve } from 'path'

try {
  const content = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* .env.local không tồn tại */ }

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
