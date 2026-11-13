import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';

describe('PromptInput', () => {
  it('프롬프트가 비어 있으면 생성 버튼이 비활성이다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('입력하면 버튼이 활성화되고 클릭 시 입력값으로 onGenerate가 호출된다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    await user.type(screen.getByRole('textbox'), '프로필 카드');
    const submit = screen.getByRole('button', { name: '컴포넌트 생성' });
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(onGenerate).toHaveBeenCalledWith('프로필 카드');
  });

  it('로딩 중에는 생성 버튼이 비활성이고 "생성 중..." 을 보여준다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: '생성 중...' })).toBeDisabled();
  });

  it('500자 입력은 제출할 수 있다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    await user.click(screen.getByRole('textbox'));
    await user.paste('가'.repeat(500));
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));

    expect(onGenerate).toHaveBeenCalledWith('가'.repeat(500));
  });

  it('501자 입력은 오류를 표시하고 생성 버튼을 비활성화한다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.paste('가'.repeat(501));

    expect(screen.getByRole('alert')).toHaveTextContent('프롬프트는 500자 이내로 입력해주세요.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it.each(['{Control>}{Enter}{/Control}', '{Meta>}{Enter}{/Meta}'])(
    '초과 입력은 단축키 %s로도 제출할 수 없다',
    async (shortcut) => {
      const onGenerate = vi.fn();
      const user = userEvent.setup();
      render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

      await user.click(screen.getByRole('textbox'));
      await user.paste('가'.repeat(501));
      await user.keyboard(shortcut);

      expect(onGenerate).not.toHaveBeenCalled();
    },
  );

  it('초과 입력을 500자로 줄이면 오류가 사라지고 다시 제출할 수 있다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.paste('가'.repeat(501));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.keyboard('{Backspace}');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
    expect(onGenerate).toHaveBeenCalledWith('가'.repeat(500));
  });
});
