'use client'

import { useEffect, useState } from 'react'

interface UserData {
  bestScores: Record<string, number>
  userDeckProgress: Record<string, number>
}

/**
 * Client component tải dữ liệu user-specific (điểm thi, tiến độ flashcard)
 * sau khi render ban đầu để không block cache trang chủ.
 */
export default function useHomeUserData(): UserData & { loading: boolean } {
  const [data, setData] = useState<UserData>({ bestScores: {}, userDeckProgress: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/home/user-data')
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json) setData(json)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { ...data, loading }
}
