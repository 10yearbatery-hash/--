'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/ui/Header'
import Card from '@/components/ui/Card'

interface PromiseItem {
  id: string
  content: string
  created_at: string
  is_custom: boolean
}

export default function PromisesPage() {
  const router = useRouter()
  const [promises, setPromises] = useState<PromiseItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/promises')
      .then((r) => {
        if (r.status === 401) { router.push('/login'); return null }
        return r.json()
      })
      .then((data) => {
        if (data) {
          setPromises(data.promises || [])
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [router])

  return (
    <main className="min-h-screen flex flex-col">
      <Header title="우리들의 약속" showBack />
      <div className="flex-1 px-5 py-6 flex flex-col gap-3">
        {loading && (
          <p className="text-center text-[#666] text-sm mt-10">불러오는 중...</p>
        )}
        {!loading && promises.length === 0 && (
          <div className="flex flex-col items-center gap-3 mt-10">
            <span className="text-4xl">💝</span>
            <p className="text-center text-[#666] text-sm">아직 저장된 약속이 없어요</p>
            <button
              className="text-sm text-[#FF6B9D]"
              onClick={() => router.push('/')}
            >
              새로운 대화 시작하기
            </button>
          </div>
        )}
        {promises.map((p) => (
          <Card key={p.id}>
            <p className="text-xs text-[#FF6B9D] mb-1">
              {new Date(p.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm text-[#1A1A1A] leading-relaxed">{p.content}</p>
          </Card>
        ))}
      </div>
    </main>
  )
}
