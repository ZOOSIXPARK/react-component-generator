# Frontend Rules

## Module Context

사용자 입력과 생성 결과 상태를 관리하고, API가 반환한 코드의 실행 미리보기와 원문 보기를 제공한다. 생성 요청은 API 서버를 통한다.

## Tech Stack & Constraints

- React 19, react-live 4, 브라우저 DOM, CSS를 사용한다.
- 이 문서의 코드 근거 경로는 저장소 루트 기준이다.

## Implementation Patterns

- 생성 목록·로딩·오류는 `useComponentGenerator`에서 관리하고 UI는 props와 콜백으로 연결한다. 근거: `src/hooks/useComponentGenerator.ts:27`, `src/App.tsx:31`.
- `GeneratedComponent`와 `Provider` 타입을 재사용한다. 프로바이더 추가 시 서버의 별도 Provider 정의와 UI 설정도 함께 확인한다. 근거: `src/types/index.ts:1`, `src/App.tsx:9`, `server/index.ts:57`.

## Testing Strategy

- 저장소 루트에서 `bun run test -- src`로 UI 테스트를 실행한다.
- Vitest, Testing Library, user-event로 사용자 입력과 콜백 결과를 검증한다. 기존 예시는 `src/components/PromptInput.test.tsx:12`를 따른다.
- 공통 jsdom 환경, jest-dom matcher와 DOM cleanup은 기존 설정을 사용한다. 근거: `vite.config.ts:17`, `src/test/setup.ts:1`.
- 현재 UI 테스트는 입력 폼을 검증한다. 생성 훅이나 미리보기 동작을 변경하면 해당 동작을 직접 확인하고 기존 폼 테스트 통과만으로 검증을 대신하지 않는다.

## Local Golden Rules

- `LiveProvider`의 `noInline`은 서버의 render 호출 정규화와 연결된 실행 계약이다. 둘 중 한쪽만 변경하지 않는다. `LiveError`를 통해 실행 오류를 표시한다. 근거: `src/components/LivePreview.tsx:14`, `src/components/LivePreview.tsx:18`, `server/generator.ts:13`.
- 미리보기는 현재 페이지의 `LiveProvider`에서 실행된다. 이를 격리된 iframe 또는 보안 샌드박스라고 가정하지 않는다. 근거: `src/components/LivePreview.tsx:14`.
- 새로고침은 `previewKey`를 변경해 미리보기를 리마운트한다. 재생성은 기존 프롬프트로 API를 다시 요청한다. 두 동작을 합치지 않는다. 근거: `src/components/ComponentCard.tsx:33`, `src/components/ComponentCard.tsx:41`, `src/components/ComponentCard.tsx:70`.
- 이중 방어: 빈 입력·500자 초과 입력·생성 중 제출은 버튼 비활성화와 제출 핸들러 양쪽에서 차단한다. 단축키 제출도 같은 핸들러를 거친다. 근거: `src/components/PromptInput.tsx:26`, `src/components/PromptInput.tsx:52`, `src/components/PromptInput.tsx:64`.
- 프로바이더 전환 시 직접 입력한 키를 비운다. 서버 키 사용 가능 여부는 프로바이더별 boolean으로 판단하며, 서버 키 사용 시 요청에서 apiKey를 생략할 수 있어야 한다. 근거: `src/App.tsx:41`, `src/App.tsx:52`, `src/hooks/useComponentGenerator.ts:43`.
- 생성 결과는 최신 항목을 앞에 추가하며 `createdAt`은 `Date`이다. 저장·복원 기능을 추가하면 문자열을 그대로 넘기지 말고 시간 표시 계약을 유지한다. 근거: `src/hooks/useComponentGenerator.ts:56`, `src/hooks/useComponentGenerator.ts:59`, `src/components/ComponentCard.tsx:18`.
