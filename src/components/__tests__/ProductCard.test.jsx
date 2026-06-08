import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../ProductCard';

const mockProduct = {
  id: 1,
  name: '无线降噪耳机 Pro',
  price: 1299,
  img: '/img.png',
  hot: true,
};

describe('ProductCard', () => {
  it('渲染商品名称', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );
    expect(screen.getByText('无线降噪耳机 Pro')).toBeInTheDocument();
  });

  it('渲染格式化价格', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );
    expect(screen.getByText('¥1,299.00')).toBeInTheDocument();
  });

  it('热门商品显示热门标签', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );
    expect(screen.getByText('热门')).toBeInTheDocument();
  });

  it('非热门商品不显示热门标签', () => {
    const normalProduct = { ...mockProduct, hot: false };
    render(
      <MemoryRouter>
        <ProductCard product={normalProduct} />
      </MemoryRouter>
    );
    expect(screen.queryByText('热门')).not.toBeInTheDocument();
  });

  it('链接指向商品详情页', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/detail/1');
  });

  it('商品图片具有正确的 alt 文本', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );
    const img = screen.getByAltText('无线降噪耳机 Pro');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/img.png');
  });
});
