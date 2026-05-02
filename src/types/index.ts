export type RoomStatus =
  | 'WAITING'
  | 'A_DONE'
  | 'B_DONE'
  | 'BOTH_DONE'
  | 'GENERATING'
  | 'RESULT_READY'

export type SessionRole = 'A' | 'B'
export type SessionStatus = 'IN_PROGRESS' | 'DONE'
export type MessageRole = 'ai' | 'user'

export interface Room {
  id: string
  code: string
  keyword: string
  creator_name: string
  partner_name: string
  status: RoomStatus
  created_at: string
  expires_at: string
}

export interface Session {
  id: string
  room_id: string
  role: SessionRole
  participant_name: string
  session_token: string
  user_id: string | null
  status: SessionStatus
  current_question: number
  q1_summary: string | null
  q2_summary: string | null
  q3_summary: string | null
  q4_summary: string | null
  created_at: string
  completed_at: string | null
}

export interface Message {
  id: string
  session_id: string
  role: MessageRole
  content: string
  question_stage: number | null
  created_at: string
}

export interface ResultTruth {
  hurt: string
  need: string
  understanding: string
}

export interface ResultData {
  id: string
  room_id: string
  situation_summary: string
  situation_highlight: string
  truth_a_hurt: string
  truth_a_need: string
  truth_a_understanding: string
  truth_b_hurt: string
  truth_b_need: string
  truth_b_understanding: string
  translation_body: string
  translation_highlight: string
  recommended_promises: Array<{ id: string; content: string }>
  created_at: string
}

export interface UserPromise {
  id: string
  user_id: string
  room_id: string | null
  content: string
  is_custom: boolean
  created_at: string
}
