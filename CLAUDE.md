# 본심 (Bon-Sim) — 커플 갈등 중재 서비스

> 연인 간 갈등을 AI가 중재하여 감정이 아닌 진심으로 화해하도록 돕는 모바일 웹앱

---

## 기술 스택

- **프레임워크:** Next.js 15 (App Router) + TypeScript
- **DB/Auth/Realtime:** Supabase
- **스타일링:** Tailwind CSS v4
- **AI:** Claude API (claude-sonnet-4-6), streaming
- **배포:** Vercel

---

## 문서 목록 (작업 전 반드시 읽을 것)

| 파일 | 내용 | 필수 읽기 시점 |
|------|------|--------------|
| `docs/prd.md` | 서비스 정의, 전체 기능 명세, 유저 플로우 | 모든 작업 전 |
| `docs/ui-ux-spec.md` | 디자인 시스템, 페이지별 UI 명세, 이미지 참조 | UI 작업 전 |
| `docs/db-schema.md` | 테이블 구조, 트리거, ER 다이어그램 | DB/API 작업 전 |
| `docs/realtime-architecture.md` | 상태 머신, Realtime 구독, 결과 생성 흐름 | 채팅/결과 작업 전 |
| `docs/api-design.md` | API 엔드포인트, 요청/응답 스키마 | API 작업 전 |
| `docs/ai-agent-spec.md` | 시스템 프롬프트, Q1~Q4 로직, 결과 생성 프롬프트 | AI 작업 전 |
| `docs/security-rls.md` | RLS 정책, 인증 흐름, 보안 체크리스트 | 보안 관련 작업 전 |

**이미지 참조:** `docs/images/` 폴더의 와이어프레임 및 디자인 시안

---

## 코딩 규칙

- 주석: 한국어
- 커밋 메시지: 한국어
- 들여쓰기: 2칸
- 컴포넌트: 함수형, hooks 우선
- 스타일링: Tailwind 유틸리티 우선, 커스텀 CSS 최소화
- 타입: `any`, `as` 타입 단언 금지
- 환경변수: `SUPABASE_SERVICE_ROLE_KEY`는 서버 코드에서만 사용 (`NEXT_PUBLIC_` 절대 금지)

---

## 절대 구현 금지 (PRD 범위 외)

- 소셜 로그인 (Google, Kakao 등)
- BM, 결제, 수익 모델
- 푸시 알림
- 프로필 편집
- 채팅방 내 A↔B 직접 대화
- 갈등 기록 히스토리 열람
- 관리자 페이지
- 다국어 지원
- 앱 설정 페이지

---

## 검증 명령

```bash
npm run build    # 빌드 오류 확인
npm run lint     # 린트 오류 확인
npm run type-check  # 타입 오류 확인
```

---

## 진행 상황 추적

- 기능 체크리스트: `.omc/feature-checklist.json`
- 진행 상황: `.omc/progress.json`
- 작업 규칙: `AGENTS.md`
