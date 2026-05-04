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

function makeFirstMessage(role: 'A' | 'B' | null, myName: string): string {
  const charName = role === 'B' ? '시미' : '보니'
  const name = myName || '선생님'
  return `안녕하세요, ${name}님!\n저는 이번 갈등 해결에서 ${name}님을 담당하게 된 '${charName}'라고 해요.\n\n이 공간은 슬픔을 가리는 곳이 아니에요. 서로의 진심을 발견하고, 관계를 회복하는 데 함께하고 싶어요.\n\n먼저, 두 분이 부딪히게 된 '그 상황' 자체에 대해 듣고 싶어요. 감정을 조금 덜어내고, 어떤 일이 있었는지 있는 그대로 편하게 말씀해 주시겠어요?`
}

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
    { id: 'init', role: 'ai', content: makeFirstMessage(null, '') },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('WAITING')
  const [sessionDone, setSessionDone] = useState(false)
  const [sessionRole, setSessionRole] = useState<'A' | 'B' | null>(null)
  const [myName, setMyName] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // DB에서 채팅 기록 복원 + 세션 정보 로드
  useEffect(() => {
    const sessionToken = getSessionToken()
    if (!sessionToken || !sessionId) return
    fetch(`/api/chat/${sessionId}/messages`, {
      headers: { 'x-session-token': sessionToken },
    })
      .then((r) => r.json())
      .then((data) => {
        const role = (data.sessionRole as 'A' | 'B') ?? null
        const name = data.participantName ?? ''
        setSessionRole(role)
        setMyName(name)

        if (data.messages?.length > 0) {
          setMessages(data.messages.map((m: { id: string; role: 'ai' | 'user'; content: string }) => ({
            id: m.id,
            role: m.role,
            content: m.content,
          })))
          setCurrentQuestion(data.currentQuestion || 1)
          if (data.sessionDone) setSessionDone(true)
        } else {
          setMessages([{ id: 'init', role: 'ai', content: makeFirstMessage(role, name) }])
        }
      })
      .catch(() => {
        setMessages([{ id: 'init', role: 'ai', content: makeFirstMessage(null, '') }])
      })
  }, [sessionId])

  // Realtime room status 구독
  useEffect(() => {
    if (!roomId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => { setRoomStatus(payload.new.status as RoomStatus) }
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
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken || '' },
        body: JSON.stringify({ content: userMsg }),
      })
      if (!res.ok) { setIsTyping(false); return }
      const data = await res.json()
      if (data.text) {
        setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, role: 'ai', content: data.text }])
      }
      if (data.questionAdvance) setCurrentQuestion(data.questionAdvance)
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

  const isFinishStep = currentQuestion >= 5
  const aiAvatarSrc = sessionRole === 'B' ? '/simmy.png' : '/bonny.png'

  return (
    <main className="h-dvh flex flex-col bg-white overflow-hidden">
      <Header
        title="대화하기"
        showBack
        progress={Math.min(currentQuestion / 5, 1)}
        rightSlot={
          roomCode ? (
            <span className="text-[13px] font-jua text-[#a0a0b8]">#{roomCode}</span>
          ) : undefined
        }
      />

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.map((m) => (
          <ChatBubble key={m.id} role={m.role} content={m.content} avatarSrc={aiAvatarSrc} />
        ))}
        {isTyping && <TypingIndicator avatarSrc={aiAvatarSrc} />}

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
        <div className="px-4 pb-6 pt-3 bg-white flex items-end gap-3">
          <div className="flex-1 flex items-center bg-[#f5f5f5] rounded-full px-4 py-2 min-h-[44px]">
            <textarea
              className="flex-1 bg-transparent placeholder:text-[#a0a0b8] text-[15px] resize-none outline-none font-light min-h-[24px] max-h-[80px] py-0.5"
              placeholder="솔직하게 털어놓아 보세요..."
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
              }}
              disabled={isTyping}
            />
          </div>
          <button
            className="w-11 h-11 rounded-full bg-pink-gradient flex items-center justify-center flex-shrink-0 disabled:opacity-50"
            onClick={isFinishStep ? finishSession : sendMessage}
            disabled={isTyping || (!input.trim() && !isFinishStep)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 14V4M9 4L4 9M9 4L14 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
