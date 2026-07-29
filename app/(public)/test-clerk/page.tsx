import { auth, currentUser } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export default async function TestClerkPage() {
  const authObj = await auth()
  const { userId, sessionClaims } = authObj
  const user = await currentUser()

  return (
    <div className="p-8 font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">Clerk Debug</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify({
          userId,
          sessionClaims_full: sessionClaims,
          publicMetadata: (sessionClaims as Record<string, unknown>)?.publicMetadata,
          vai_tro_direct: (sessionClaims as Record<string, unknown>)?.vai_tro,
          clerkPublicMetadata: user?.publicMetadata,
          email: user?.emailAddresses?.[0]?.emailAddress,
        }, null, 2)}
      </pre>
    </div>
  )
}
