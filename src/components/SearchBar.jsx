import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch, placeholder = '搜索商品…' }) {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query.trim());
  };

  return (
    <form className={styles.form} role="search" onSubmit={handleSubmit}>
      <label htmlFor="search-input" className="visually-hidden">
        搜索商品
      </label>
      <input
        id="search-input"
        type="search"
        name="q"
        className={styles.input}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
      <button type="submit" className={styles.button} aria-label="搜索">
        搜索
      </button>
    </form>
  );
}
