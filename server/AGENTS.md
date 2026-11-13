# Server Rules

## Module Context

AI 프로바이더 응답을 브라우저에서 미리 볼 수 있는 코드로 변환하는 API 영역이다. 브라우저용 React 코드와 달리 Bun 런타임에서 실행된다.

## Tech Stack & Constraints

- Bun의 `Bun.serve`, 네이티브 `fetch`, TypeScript를 사용한다.
- 이 문서의 코드 근거 경로는 저장소 루트 기준이다.

## Implementation Patterns

- HTTP 처리와 외부 API 호출은 `index.ts`, 응답 정규화와 모델 순차 실행은 부수효과 없는 모듈로 분리하는 패턴을 따른다.
- 성공 응답 `{ code }`, 실패 응답 `{ error }`는 브라우저 훅과 함께 변경한다. 근거: `server/index.ts:190`, `server/index.ts:209`, `src/hooks/useComponentGenerator.ts:29`.

## Testing Strategy

- 저장소 루트에서 `bun run test -- server`로 서버 테스트를 실행한다.
- 정규화 변경은 `generator.test.ts`, 모델 시도 순서·실패 처리 변경은 `fallback.test.ts`에서 관찰 가능한 결과를 검증한다.
- 테스트에서 순수 모듈을 직접 import한다. `index.ts`를 import하면 실제 서버가 시작되므로 테스트 대상 함수에 접근하려고 진입점을 import하지 않는다. 근거: `server/generator.test.ts:2`, `server/fallback.test.ts:2`, `server/index.ts:138`.
- 기존 테스트는 순수 함수에 집중되어 있다. HTTP나 프로바이더 응답 처리 변경은 외부 호출을 대체한 검증을 추가하고 순수 함수 테스트만으로 API 전체를 검증했다고 보고하지 않는다.

## Local Golden Rules

- 생성 결과는 앱 소스와 달리 import와 TypeScript 문법이 없는 독립 JavaScript/JSX여야 한다. 인라인 스타일과 `render(<Component />)` 계약을 유지한다. 근거: `server/index.ts:10`, `server/index.ts:20`, `src/components/LivePreview.tsx:14`.
- 이중 방어: 시스템 프롬프트의 출력 형식 요구만 믿고 후처리를 제거하지 않는다. `stripCodeFences` 후 `ensureRenderCall` 순서를 유지하고 이미 있는 render 호출은 중복 삽입하지 않는다. 근거: `server/index.ts:12`, `server/index.ts:188`, `server/generator.ts:17`, `server/generator.test.ts:21`.
- 프로바이더 비대칭: Google 경로의 순차 모델 폴백과 `MAX_TOKENS` 오류 처리를 보존한다. Anthropic 경로와 공통화할 때 이 동작을 누락하거나 두 API의 응답 구조를 같다고 가정하지 않는다. 근거: `server/index.ts:88`, `server/index.ts:115`, `server/index.ts:123`, `server/index.ts:134`.
- 폴백은 첫 성공에서 멈추고 전부 실패하면 마지막 오류를 던진다. 순서가 의미 있으므로 병렬 경쟁으로 바꾸지 않는다. 근거: `server/fallback.ts:12`, `server/fallback.ts:19`, `server/fallback.test.ts:5`, `server/fallback.test.ts:27`.
- 클라이언트가 입력한 키가 서버 환경변수 키보다 우선하는 동작을 유지한다. 근거: `server/index.ts:64`.
- `OPTIONS`와 오류 응답에도 CORS 헤더를 유지하고 429·503 상태 처리를 일반 500 오류로 합치지 않는다. 근거: `server/index.ts:141`, `server/index.ts:194`, `server/index.ts:201`.
