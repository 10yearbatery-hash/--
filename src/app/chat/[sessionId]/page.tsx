'use client'
import { useEffect, useRef, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/ui/Header'
import ChatBubble from '@/components/chat/ChatBubble'
import TypingIndicator from '@/components/chat/TypingIndicator'
import SystemMessage from '@/components/chat/SystemMessage'
import { getSessionToken } from '@/lib/utils/session-token'
import { createClient } from '@/lib/supabase/client'
import type { RoomStatus } from '@/types'

const STAGE_TAGS: Record<number, string> = {
  1: '상처 확인',
  2: '상처 확인',
  3: '진심 발견',
  4: '입장 바꾸기',
  5: '마무리',
}

const FIRST_MESSAGE = `안녕하세요 💗\n이 공간은 슬픔을 가리는 곳이 아니에요. 서로의 진심을 발견하고, 관계를 회복하는 데 함께하고 싶어요.\n\n먼저, 두 분이 부딪히게 된 '그 상황' 자체에 대해 듣고 싶어요. 감정을 조금 덜어내고, 어떤 일이 있었는지 있는 그대로 편하게 말씀해 주시겠어요?`

interface ChatMessage {
  id: string
  role: 'ai' | 'user'
  content: string
}

function ChatPageInner() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomCode = searchParams.get('roomCode') || ''
  const roomId = searchParams.get('roomId') || ''

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'ai', content: FIRST_MESSAGE },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('WAITING')
  const [sessionDone, setSessionDone] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Realtime room status 구독
  useEffect(() => {
    if (!roomId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoomStatus(payload.new.status as RoomStatus)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  // 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  async function sendMessage() {
    if (!input.trim() || isTyping) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', content: userMsg }])
    setIsTyping(true)

    try {
      const sessionToken = getSessionToken()
      const res = await fetch(`/api/chat/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken || '',
        },
        body: JSON.stringify({ content: userMsg }),
      })

      if (!res.ok) {
        setIsTyping(false)
        return
      }

      const data = await res.json()

      if (data.text) {
        setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, role: 'ai', content: data.text }])
      }
      if (data.questionAdvance) {
        setCurrentQuestion(data.questionAdvance)
      }
    } catch (err) {
      console.error('메시지 전송 오류:', err)
    } finally {
      setIsTyping(false)
    }
  }

  async function finishSession() {
    const sessionToken = getSessionToken()
    await fetch(`/api/sessions/${sessionId}/finish`, {
      method: 'POST',
      headers: { 'x-session-token': sessionToken || '' },
    })
    setSessionDone(true)
  }

  const stageTag = STAGE_TAGS[currentQuestion] || '마무리'
  const isFinishStep = currentQuestion >= 5

  return (
    <main className="h-dvh flex flex-col bg-[#FFF5F8] overflow-hidden">
      <Header
        title="본심 상담"
        showBack
        roomCode={roomCode}
        rightSlot={
          <span className="text-xs bg-[#FFD6E7] text-[#FF6B9D] px-2 py-1 rounded-full font-medium">
            {stageTag}
          </span>
        }
      />

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {messages.map((m) => (
          <ChatBubble key={m.id} role={m.role} content={m.content} />
        ))}
        {isTyping && <TypingIndicator />}

        {/* 세션 완료 후 상태 메시지 */}
        {sessionDone && (
          <>
            {(roomStatus === 'WAITING' || roomStatus === 'A_DONE' || roomStatus === 'B_DONE') && (
              <SystemMessage text="상대방이 아직 본심을 기록하고 있습니다. 조금만 기다려 주세요." />
            )}
            {(roomStatus === 'BOTH_DONE' || roomStatus === 'GENERATING') && (
              <SystemMessage text="두 분의 진심을 바탕으로 결과를 생성하고 있습니다..." />
            )}
            {roomStatus === 'RESULT_READY' && (
              <SystemMessage
                text="결과 생성이 완료됐어요 ✨ 두 분의 본심이 담긴 리포트를 확인해 보세요."
                showButton
                buttonText="결과보러가기 →"
                onButtonClick={() => router.push(`/result/${roomId}`)}
              />
            )}
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      {!sessionDone && (
        <div className="px-5 py-3 border-t border-[#F0D0DC] bg-[#FFF5F8] flex gap-2">
          <input
            className="flex-1 bg-white border border-[#F0D0DC] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#FF6B9D]"
            placeholder="솔직하게 털어놔 보세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (isFinishStep) finishSession()
                else sendMessage()
              }
            }}
            disabled={isTyping}
          />
          <button
            className="w-10 h-10 rounded-full bg-[#FF6B9D] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50"
            onClick={isFinishStep ? finishSession : sendMessage}
            disabled={isTyping || (!input.trim() && !isFinishStep)}
          >
            →
          </button>
        </div>
      )}
    </main>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#FF6B9D]">로딩 중...</div>}>
      <ChatPageInner />
    </Suspense>
  )
}
