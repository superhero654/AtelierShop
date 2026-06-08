import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, generateOrderNo } from '../format';

describe('formatPrice', () => {
  it('格式化整数价格', () => {
    expect(formatPrice(1299)).toBe('¥1,299.00');
  });

  it('格式化小数价格', () => {
    expect(formatPrice(99.5)).toBe('¥99.50');
  });

  it('格式化零', () => {
    expect(formatPrice(0)).toBe('¥0.00');
  });

  it('格式化大额数字', () => {
    expect(formatPrice(9999999.99)).toBe('¥9,999,999.99');
  });
});

describe('formatDate', () => {
  it('格式化 ISO 日期字符串', () => {
    const result = formatDate('2026-01-01T10:00:00');
    expect(result).toContain('2026');
    expect(result).toContain('01');
    expect(result).toContain('10:00');
  });

  it('空值返回占位符', () => {
    expect(formatDate('')).toBe('—');
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('无效日期返回原字符串', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('generateOrderNo', () => {
  it('生成 17 位订单号（YYYYMMDDHHmmssSSS）', () => {
    const no = generateOrderNo();
    expect(no).toHaveLength(17);
  });

  it('以当前年份开头', () => {
    const no = generateOrderNo();
    expect(no.startsWith(String(new Date().getFullYear()))).toBe(true);
  });

  it('包含完整时间信息', () => {
    const no = generateOrderNo();
    // 格式: YYYYMMDDHHmmssSSS, 全部是数字
    expect(no).toMatch(/^\d{17}$/);
  });

  it('不同毫秒调用生成不同订单号', async () => {
    const no1 = generateOrderNo();
    // 等待 5ms 确保时间戳变化
    await new Promise((r) => setTimeout(r, 5));
    const no2 = generateOrderNo();
    expect(no1).not.toBe(no2);
  });
});
