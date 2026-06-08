import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('渲染搜索输入框和按钮', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar />
      </MemoryRouter>
    );
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '搜索' })).toBeInTheDocument();
  });

  it('接受自定义 placeholder', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar placeholder="自定义占位" />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('自定义占位')).toBeInTheDocument();
  });

  it('输入文本后提交触发 onSearch', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar onSearch={onSearch} />
      </MemoryRouter>
    );

    const input = screen.getByRole('searchbox');
    await user.type(input, '耳机');
    await user.click(screen.getByRole('button', { name: '搜索' }));

    expect(onSearch).toHaveBeenCalledWith('耳机');
  });

  it('空文本提交不触发 onSearch（trim 后为空）', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar onSearch={onSearch} />
      </MemoryRouter>
    );

    const input = screen.getByRole('searchbox');
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: '搜索' }));

    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('输入的文本被 trim 后再传递', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar onSearch={onSearch} />
      </MemoryRouter>
    );

    const input = screen.getByRole('searchbox');
    await user.type(input, '  商品  ');
    await user.click(screen.getByRole('button', { name: '搜索' }));

    expect(onSearch).toHaveBeenCalledWith('商品');
  });
});
