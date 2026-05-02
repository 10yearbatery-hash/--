# 에이전트 작업 규칙

## 작업 시작 전 필수 절차

1. `.omc/progress.json` 읽고 현재 위치 파악
2. `.omc/feature-checklist.json` 읽고 다음 작업 확인
3. 해당 작업 관련 `docs/` 파일 읽기
4. `CLAUDE.md` 규칙 재확인

---

## 작업 단위

- **한 번에 한 기능씩** 진행
- `feature-checklist.json`의 미완료(`done: false`) 항목 1개 선택
- 선택 기준: 의존성 없는 것 우선, 번호 순서 우선

---

## 완료 정의

하나의 기능이 완료되려면 다음을 모두 충족해야 한다:

1. 코드 작성 완료
2. TypeScript 타입 오류 없음 (`npm run type-check`)
3. 린트 오류 없음 (`npm run lint`)
4. 브라우저(또는 Playwright)로 해당 기능 동작 확인
5. `feature-checklist.json`의 해당 항목 `done: true` 업데이트
6. `progress.json` 업데이트
7. 기능 단위 git 커밋 (한국어 메시지)

---

## 커밋 규칙

```
feat: [기능명] 구현
fix: [기능명] 버그 수정
style: [페이지명] UI 스타일 적용
```

예시:
- `feat: 방 만들기 API 및 세션 생성 구현`
- `feat: 채팅 스트리밍 및 Q1~Q4 단계 진행 구현`
- `feat: 결과 페이지 4단계 스텝 UI 구현`

---

## 금지 사항

- PRD `docs/prd.md` 범위 외 기능 추가
- 임의 리팩터링 (요청 없는 코드 정리)
- 가짜 데이터로 완료 선언
- `any`, `as` 타입 단언
- `SUPABASE_SERVICE_ROLE_KEY`를 클라이언트 코드에 노출
- A↔B 메시지 격리 정책 위반

---

## 막힌 경우

1. `progress.json`의 `blocked` 필드에 사유 기록
2. 사용자에게 보고
3. 임의로 우회하지 않음

---

## 세션 재시작 시

```
1. progress.json 읽기
2. feature-checklist.json 읽기
3. 마지막 커밋 확인 (git log --oneline -5)
4. 현재 작업 이어서 진행
```
