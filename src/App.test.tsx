import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ envKeys: { google: false, anthropic: false } }) }));
});

it('실패한 요청도 히스토리에 저장하고 복원한 프롬프트를 다시 입력할 수 있다', async () => {
  vi.mocked(fetch).mockImplementation(async (url) => ({
    ok: false,
    json: async () => url === '/api/config'
      ? { envKeys: { google: true, anthropic: false } }
      : { error: '생성 실패' },
  } as Response));
  const user = userEvent.setup();
  const first = render(<App />);
  await screen.findByText('.env 키가 연결되어 있습니다.');
  await user.type(screen.getByRole('textbox'), '히스토리 요청');
  await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
  await screen.findByText('생성 실패');
  first.unmount();
  render(<App />);
  await user.click(within(screen.getByRole('region', { name: '프롬프트 히스토리' })).getByRole('button', { name: '히스토리 요청' }));
  expect(screen.getByRole('textbox')).toHaveValue('히스토리 요청');
});

it('선택한 Provider와 직접 입력한 키를 다시 마운트하면 복원한다', async () => {
  const user = userEvent.setup();
  const { unmount } = render(<App />);
  await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');
  await user.type(screen.getByLabelText('API Key'), 'test-key');
  unmount();
  render(<App />);
  expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
  expect(screen.getByLabelText('API Key')).toHaveValue('test-key');
});

it('Provider를 바꾸면 이전 키가 지워지고 새로고침 후에도 비어 있다', async () => {
  const user = userEvent.setup();
  const first = render(<App />);
  await user.type(screen.getByLabelText('API Key'), 'google-key');
  await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');
  expect(screen.getByLabelText('API Key')).toHaveValue('');
  first.unmount();
  render(<App />);
  expect(screen.getByLabelText('API Key')).toHaveValue('');
});

it.each(['{broken', '{"provider":"unknown","apiKey":"wrong"}'])(
  '설정이 손상되어도 기본값으로 실행한다: %s', (saved) => {
    window.localStorage.setItem('rcg.settings', saved);
    render(<App />);
    expect(screen.getByLabelText('Provider')).toHaveValue('google');
    expect(screen.getByLabelText('API Key')).toHaveValue('');
  },
);

it('저장소 접근이 차단되어도 입력과 상태 변경을 사용할 수 있다', async () => {
  vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText('API Key'), 'test-key');
  expect(screen.getByLabelText('API Key')).toHaveValue('test-key');
});
