import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import SearchBar from './SearchBar';
import styles from './Header.module.css';

export default function Header() {
  const { user } = useAuth();
  const { totalCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.leftGroup}>
          <Link to="/" className={styles.logo} aria-label="返回首页">
            Atelier<span>Shop</span>
          </Link>
          <nav className={styles.nav} aria-label="主导航">
            <Link
              to="/"
              className={`${styles.navLink} ${isActive('/') && location.pathname === '/' ? styles.navLinkActive : ''}`}
            >
              首页
            </Link>
            <Link
              to="/category"
              className={`${styles.navLink} ${isActive('/category') ? styles.navLinkActive : ''}`}
            >
              分类
            </Link>
          </nav>
        </div>

        <div className={styles.searchWrap}>
          <SearchBar
            onSearch={(q) => navigate(q ? `/?q=${encodeURIComponent(q)}` : '/')}
          />
        </div>

        <div className={styles.rightGroup}>
          <Link
            to="/cart"
            className={styles.cartLink}
            aria-label={`购物车，${totalCount} 件商品`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalCount > 0 && (
              <span className={styles.badge}>{totalCount > 99 ? '99+' : totalCount}</span>
            )}
          </Link>
          <Link to="/user" className={styles.userLink}>
            {user ? user.nickname : '登录'}
          </Link>
        </div>
      </div>
    </header>
  );
}
