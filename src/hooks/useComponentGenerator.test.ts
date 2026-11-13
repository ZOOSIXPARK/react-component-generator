import { afterEach, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

afterEach(() => vi.unstubAllGlobals());

it('생성 목록을 최신순으로 복원하고 createdAt을 Date로 유지한다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'render(<div>결과</div>)' }) }));
  const first = renderHook(() => useComponentGenerator());
  await act(() => first.result.current.generate('첫 요청', undefined, 'google'));
  await act(() => first.result.current.generate('다음 요청', undefined, 'google'));
  const saved = first.result.current.components;
  first.unmount();
  const restored = renderHook(() => useComponentGenerator());
  expect(restored.result.current.components).toEqual(saved);
  expect(restored.result.current.components[0].createdAt).toBeInstanceOf(Date);
});

it('개별 삭제와 전체 삭제를 저장하며 프롬프트 히스토리는 유지한다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'render(<div />)' }) }));
  const first = renderHook(() => useComponentGenerator());
  await act(() => first.result.current.generate('첫 요청', undefined, 'google'));
  await act(() => first.result.current.generate('다음 요청', undefined, 'google'));
  const remaining = first.result.current.components[1];
  act(() => first.result.current.removeComponent(first.result.current.components[0].id));
  first.unmount();
  const second = renderHook(() => useComponentGenerator());
  expect(second.result.current.components).toEqual([remaining]);
  act(() => second.result.current.clearAll());
  second.unmount();
  const third = renderHook(() => useComponentGenerator());
  expect(third.result.current.components).toEqual([]);
  expect(third.result.current.promptHistory).toEqual(['다음 요청', '첫 요청']);
});

it('재요청한 프롬프트는 중복 없이 히스토리 맨 위로 이동한다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'render(<div />)' }) }));
  const { result } = renderHook(() => useComponentGenerator());
  for (const prompt of ['첫 요청', '다음 요청', '첫 요청']) {
    await act(() => result.current.generate(prompt, undefined, 'google'));
  }
  expect(result.current.promptHistory).toEqual(['첫 요청', '다음 요청']);
  expect(fetch).toHaveBeenLastCalledWith('/api/generate', expect.objectContaining({
    body: JSON.stringify({ prompt: '첫 요청', provider: 'google' }),
  }));
});

it('잘못된 저장 항목은 제외하고 유효한 컴포넌트만 복원한다', () => {
  const valid = { id: 'saved', prompt: '저장된 요청', code: 'render(<div />)', createdAt: '2026-11-13T06:00:00.000Z' };
  window.localStorage.setItem('rcg.components', JSON.stringify([valid, { ...valid, createdAt: 'invalid' }, null]));
  const { result } = renderHook(() => useComponentGenerator());
  expect(result.current.components).toEqual([{ ...valid, createdAt: new Date(valid.createdAt) }]);
});
