import { describe, it, expect, beforeEach } from 'vitest';
import { loadFromStorage, saveToStorage } from '../storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('保存并读取数据', () => {
    saveToStorage('testKey', { a: 1, b: 'hello' });
    const result = loadFromStorage('testKey', null);
    expect(result).toEqual({ a: 1, b: 'hello' });
  });

  it('不存在的 key 返回默认值', () => {
    const result = loadFromStorage('nonexistent', 'default');
    expect(result).toBe('default');
  });

  it('存储数组并读取', () => {
    const arr = [1, 2, 3];
    saveToStorage('arr', arr);
    expect(loadFromStorage('arr', [])).toEqual([1, 2, 3]);
  });

  it('损坏的 JSON 返回默认值', () => {
    localStorage.setItem('bad', '{invalid json');
    const result = loadFromStorage('bad', 'fallback');
    expect(result).toBe('fallback');
  });

  it('覆盖已有值', () => {
    saveToStorage('key', 'first');
    saveToStorage('key', 'second');
    expect(loadFromStorage('key', null)).toBe('second');
  });
});
