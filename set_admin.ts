import 'dotenv/config'
import { prisma } from './lib/prisma'

async function main() {
  const result = await prisma.user.updateMany({
    data: {
      vaiTro: 'ADMIN'
    }
  })
  console.log(`Updated ${result.count} users to ADMIN`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
